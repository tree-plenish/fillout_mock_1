import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test Supabase connection by checking the schools table
    const { data, error } = await supabase
      .from('schools')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'Fillout to Supabase Webhook',
        supabase: {
          connected: false,
          error: error.message
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Fillout to Supabase Webhook',
      supabase: {
        connected: true
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'Fillout to Supabase Webhook',
      supabase: {
        connected: false,
        error: error.message
      }
    }, { status: 500 });
  }
}
