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
          from_address:from_location,
          to_address:to_location,
          requested_departure_time:scheduled_time,
          passenger:user_id(
            phone_number,
            name:auth_user_id
          )
        ),
        driver_trip:driver_trip_id(
          from_address:from_location,
          to_address:to_location,
          scheduled_departure_time:scheduled_time,
          vehicle_type,
          fare_per_seat:fare,
          driver:user_id(
            phone_number,
            name:auth_user_id
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
        from_address: booking.passenger_trip?.from_address || '',
        to_address: booking.passenger_trip?.to_address || '',
        requested_departure_time: booking.passenger_trip?.requested_departure_time || booking.created_at
      },
      driverTrip: {
        from_address: booking.driver_trip?.from_address || '',
        to_address: booking.driver_trip?.to_address || '',
        scheduled_departure_time: booking.driver_trip?.scheduled_departure_time || booking.created_at,
        vehicle_type: booking.driver_trip?.vehicle_type || 'car',
        fare_per_seat: booking.driver_trip?.fare_per_seat || 0
      },
      driver: {
        phone_number: booking.driver_trip?.driver?.phone_number || '',
        name: booking.driver_trip?.driver?.name || 'Driver'
      },
      passenger: {
        name: booking.passenger_trip?.passenger?.name || 'Passenger'
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