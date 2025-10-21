import { NextResponse } from 'next/server';
import { extractFormData, createOrUpdateSchool, createEvent } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received webhook data:', JSON.stringify(body, null, 2));

    // Extract form data from Fillout payload
    const formData = extractFormData(body);

    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid form data structure'
        },
        { status: 400 }
      );
    }

    // Step 1: Create or update school record
    const school = await createOrUpdateSchool(formData);

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create school record'
        },
        { status: 500 }
      );
    }

    // Step 2: Create event record
    const event = await createEvent(formData, school.id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create event record'
        },
        { status: 500 }
      );
    }

    console.log('Successfully processed form submission:', {
      schoolId: school.id,
      eventId: event.id
    });

    return NextResponse.json({
      success: true,
      data: {
        school: school,
        event: event
      }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Enable CORS for this route
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
