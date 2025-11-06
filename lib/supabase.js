import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      goal_trees: parseInt(formData.estimated_trees) || 0,
      trees_planted: 0, // Default to 0, will be updated after event
      event_date: formData.event_start_date || formData.event_date_range,
      description: `${formData.event_type || 'Event'} at ${formData.school_name}`,
      pickup: false, // Default to false, can be updated later
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

// Extract form data from form.io webhook payload
export function extractFormData(payload) {
  try {
    // Form.io sends data in the format: { request, submission, params }
    // The actual form data is in submission.data
    if (payload.submission && payload.submission.data) {
      const formioData = payload.submission.data;

      // Map form.io fields to our expected format
      const mappedData = {
        school_name: formioData.schoolName,
        city: formioData.city,
        state: formioData.state,
        country: 'USA', // Default to USA since form.io form doesn't include country field
        school_contact_email: formioData.schoolContactEmail,
        event_type: formioData.typeOfEvent,
        estimated_trees: formioData.estimatedNumberOfTreesToPlant,
        event_start_date: formioData.preferredEventDatesOrTimeline,
        event_end_date: formioData.endDate,
      };

      return mappedData;
    }

    // Fallback: check if data is sent directly in the body
    if (payload.data) {
      return payload.data;
    }

    // Final fallback: return the payload itself
    return payload;
  } catch (error) {
    console.error('Error extracting form data:', error);
    return null;
  }
}
