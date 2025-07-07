import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching booking details for:', bookingId);

    // Get booking with related trip and user information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        confirmed,
        whatsapp_launched,
        created_at,
        updated_at,
        passenger_trip:passenger_trip_id(
          from_location,
          to_location,
          scheduled_time,
          users!inner(
            phone_number,
            auth_user_id
          )
        ),
        driver_trip:driver_trip_id(
          from_location,
          to_location,
          scheduled_time,
          vehicle_type,
          fare,
          users!inner(
            phone_number,
            auth_user_id
          )
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data for frontend consumption
    const bookingDetails = {
      id: booking.id,
      status: booking.confirmed ? 'confirmed' : 'pending',
      whatsapp_launched: booking.whatsapp_launched,
      created_at: booking.created_at,
      passengerTrip: {
        from_location: booking.passenger_trip?.from_location || '',
        to_location: booking.passenger_trip?.to_location || '',
        scheduled_time: booking.passenger_trip?.scheduled_time || booking.created_at
      },
      driverTrip: {
        from_location: booking.driver_trip?.from_location || '',
        to_location: booking.driver_trip?.to_location || '',
        scheduled_time: booking.driver_trip?.scheduled_time || booking.created_at,
        vehicle_type: booking.driver_trip?.vehicle_type || 'car',
        fare: booking.driver_trip?.fare || 0
      },
      driver: {
        phone_number: booking.driver_trip?.users?.phone_number || '',
        name: booking.driver_trip?.users?.auth_user_id || 'Driver'
      },
      passenger: {
        name: booking.passenger_trip?.users?.auth_user_id || 'Passenger'
      }
    };

    console.log('Booking details retrieved successfully:', {
      bookingId,
      status: bookingDetails.status,
      hasDriverPhone: !!bookingDetails.driver.phone_number
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: bookingDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-booking-details:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});