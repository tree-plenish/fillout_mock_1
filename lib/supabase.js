import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create or update school record in Supabase
export async function createOrUpdateSchool(formData) {
  try {
    const schoolData = {
      name: formData.school_name,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      contact_email: formData.school_contact_email,
    };

    // Check if school already exists by name and city
    const { data: existingSchool, error: searchError } = await supabase
      .from('schools')
      .select('*')
      .eq('name', schoolData.name)
      .eq('city', schoolData.city)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new schools
      console.error('Error searching for school:', searchError);
    }

    if (existingSchool) {
      // Update existing school
      const { data: updatedSchool, error: updateError } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', existingSchool.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating school:', updateError);
        return null;
      }

      return updatedSchool;
    } else {
      // Create new school
      const { data: newSchool, error: insertError } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating school:', insertError);
        return null;
      }

      return newSchool;
    }
  } catch (error) {
    console.error('Error in createOrUpdateSchool:', error);
    return null;
  }
}

// Create event record in Supabase
export async function createEvent(formData, schoolId) {
  try {
    const eventData = {
      title: formData.event_type || 'Tree Planting Event',
      school_id: schoolId,
      goal_trees: parseInt(formData.event_estimate_trees) || 0,
      event_date: formData.event_start_date || formData.event_date_range,
      description: `${formData.event_type || 'Event'} at ${formData.school_name}`,
    };

    // If we have both start and end dates, we could store the start date
    // and add additional info to description
    if (formData.event_start_date && formData.event_end_date) {
      eventData.event_date = formData.event_start_date;
      eventData.description += ` (${formData.event_start_date} to ${formData.event_end_date})`;
    }

    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating event:', insertError);
      return null;
    }

    return newEvent;
  } catch (error) {
    console.error('Error in createEvent:', error);
    return null;
  }
}

// Extract form data from Fillout webhook payload
export function extractFormData(payload) {
  try {
    // Fillout sends data in different formats depending on configuration
    // This handles the common case where questions array contains the form fields
    const questions = payload.questions || [];

    const data = {};

    questions.forEach(question => {
      const fieldName = question.name;
      const value = question.value;

      if (fieldName && value !== undefined) {
        data[fieldName] = value;
      }
    });

    // Also check if data is sent directly in the body
    if (Object.keys(data).length === 0 && payload.data) {
      return payload.data;
    }

    // Or check if fields are directly in the payload
    if (Object.keys(data).length === 0) {
      return payload;
    }

    return data;
  } catch (error) {
    console.error('Error extracting form data:', error);
    return null;
  }
}
