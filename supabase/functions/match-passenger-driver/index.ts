
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate trip compatibility score
function calculateMatchScore(passengerTrip: any, driverTrip: any) {
  let score = 0;
  const maxScore = 100;

  // Vehicle type match (30 points)
  if (passengerTrip.vehicle_type === driverTrip.vehicle_type) {
    score += 30;
  }

  // Time proximity (25 points)
  const passengerTime = new Date(passengerTrip.scheduled_time).getTime();
  const driverTime = new Date(driverTrip.scheduled_time).getTime();
  const timeDiff = Math.abs(passengerTime - driverTime) / (1000 * 60); // minutes
  
  if (timeDiff <= 15) score += 25;
  else if (timeDiff <= 30) score += 20;
  else if (timeDiff <= 60) score += 15;
  else if (timeDiff <= 120) score += 10;

  // Route proximity (25 points) - simplified using direct distance
  const fromDistance = calculateDistance(
    passengerTrip.from_lat, passengerTrip.from_lng,
    driverTrip.from_lat, driverTrip.from_lng
  );
  const toDistance = calculateDistance(
    passengerTrip.to_lat, passengerTrip.to_lng,
    driverTrip.to_lat, driverTrip.to_lng
  );

  const avgDistance = (fromDistance + toDistance) / 2;
  if (avgDistance <= 2) score += 25;
  else if (avgDistance <= 5) score += 20;
  else if (avgDistance <= 10) score += 15;
  else if (avgDistance <= 20) score += 10;

  // Availability (20 points)
  if (driverTrip.seats_available > 0) {
    score += 20;
  }

  return Math.min(score, maxScore);
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { action, passengerTripId, driverTripId } = await req.json();

    if (action === 'find_matches') {
      // Find matching drivers for a passenger trip
      const { data: passengerTrip, error: passengerError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', passengerTripId)
        .eq('role', 'passenger')
        .single();

      if (passengerError || !passengerTrip) {
        throw new Error('Passenger trip not found');
      }

      // Get available driver trips - Fixed to use correct table structure
      const { data: driverTrips, error: driverError } = await supabase
        .from('trips')
        .select(`
          *,
          user:user_id!inner(promo_code, phone_number),
          driver_profiles!inner(plate_number, is_online, vehicle_type)
        `)
        .eq('role', 'driver')
        .eq('status', 'pending')
        .eq('driver_profiles.is_online', true)
        .gt('seats_available', 0);

      if (driverError) throw driverError;

      // Calculate match scores and rank
      const matches = driverTrips
        ?.filter(trip => trip.from_lat && trip.from_lng && trip.to_lat && trip.to_lng)
        .map(trip => ({
          ...trip,
          match_score: calculateMatchScore(passengerTrip, trip),
          driver_promo_code: trip.users.promo_code,
          plate_number: trip.driver_profiles.plate_number
        }))
        .filter(trip => trip.match_score >= 40) // Minimum match threshold
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 10) // Top 10 matches
        || [];

      return new Response(JSON.stringify({
        success: true,
        matches,
        passenger_trip: passengerTrip,
        total_matches: matches.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'create_booking') {
      // Create a booking between passenger and driver
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('passenger_trip_id', passengerTripId)
        .eq('driver_trip_id', driverTripId)
        .single();

      if (existingBooking) {
        throw new Error('Booking already exists');
      }

      // Verify both trips exist and are available
      const { data: passengerTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('id', passengerTripId)
        .eq('status', 'pending')
        .single();

      const { data: driverTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('id', driverTripId)
        .eq('status', 'pending')
        .gt('seats_available', 0)
        .single();

      if (!passengerTrip || !driverTrip) {
        throw new Error('One or both trips are no longer available');
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: passengerTripId,
          driver_trip_id: driverTripId,
          confirmed: true,
          whatsapp_launched: false
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update driver trip seats
      await supabase
        .from('trips')
        .update({ 
          seats_available: driverTrip.seats_available - 1,
          status: driverTrip.seats_available === 1 ? 'matched' : 'pending'
        })
        .eq('id', driverTripId);

      // Update passenger trip status
      await supabase
        .from('trips')
        .update({ status: 'matched' })
        .eq('id', passengerTripId);

      return new Response(JSON.stringify({
        success: true,
        booking,
        message: 'Booking created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in match-passenger-driver:', error);
    return new Response(JSON.stringify({
      error: 'Matching operation failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
