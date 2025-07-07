import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { requestId } = await req.json();

  try {
    // First get the passenger trip details
    const { data: passengerTrip, error: passengerError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', requestId)
      .eq('role', 'passenger')
      .single();

    if (passengerError || !passengerTrip) {
      throw new Error('Passenger trip not found');
    }

    // Find matching driver trips based on location and time
    const radius = 10; // km radius for matching
    const timeBuffer = 2 * 60 * 60 * 1000; // 2 hours time buffer

    const { data: driverTrips, error: driversError } = await supabase
      .from('trips')
      .select(`
        *,
        users!inner(promo_code),
        driver_profiles!inner(plate_number, vehicle_type, is_online)
      `)
      .eq('role', 'driver')
      .eq('status', 'pending')
      .eq('driver_profiles.is_online', true)
      .not('from_lat', 'is', null)
      .not('from_lng', 'is', null);

    if (driversError) {
      throw driversError;
    }

    // Filter by distance and time compatibility
    const matches = driverTrips
      ?.filter(trip => {
        // Distance check using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLatFrom = (trip.from_lat - passengerTrip.from_lat) * Math.PI / 180;
        const dLngFrom = (trip.from_lng - passengerTrip.from_lng) * Math.PI / 180;
        const aFrom = Math.sin(dLatFrom/2) * Math.sin(dLatFrom/2) +
                     Math.cos(passengerTrip.from_lat * Math.PI / 180) * Math.cos(trip.from_lat * Math.PI / 180) *
                     Math.sin(dLngFrom/2) * Math.sin(dLngFrom/2);
        const cFrom = 2 * Math.atan2(Math.sqrt(aFrom), Math.sqrt(1-aFrom));
        const distanceFrom = R * cFrom;

        const dLatTo = (trip.to_lat - passengerTrip.to_lat) * Math.PI / 180;
        const dLngTo = (trip.to_lng - passengerTrip.to_lng) * Math.PI / 180;
        const aTo = Math.sin(dLatTo/2) * Math.sin(dLatTo/2) +
                   Math.cos(passengerTrip.to_lat * Math.PI / 180) * Math.cos(trip.to_lat * Math.PI / 180) *
                   Math.sin(dLngTo/2) * Math.sin(dLngTo/2);
        const cTo = 2 * Math.atan2(Math.sqrt(aTo), Math.sqrt(1-aTo));
        const distanceTo = R * cTo;

        // Check if both pickup and destination are within radius
        if (distanceFrom > radius || distanceTo > radius) return false;

        // Time compatibility check
        const passengerTime = new Date(passengerTrip.scheduled_time || passengerTrip.requested_departure_time);
        const driverTime = new Date(trip.scheduled_time || trip.scheduled_departure_time);
        const timeDiff = Math.abs(driverTime.getTime() - passengerTime.getTime());
        
        return timeDiff <= timeBuffer;
      })
      .map(trip => ({
        ...trip,
        driver_promo_code: trip.users.promo_code,
        plate_number: trip.driver_profiles.plate_number,
        vehicle_type: trip.driver_profiles.vehicle_type
      }))
      .slice(0, 10) || []; // Limit to 10 matches

    const data = matches;

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      passenger_trip: passengerTrip,
      match_count: data.length 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error finding matches:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to find matches' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 