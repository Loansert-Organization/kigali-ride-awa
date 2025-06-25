
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10'); // km
    const vehicleType = url.searchParams.get('vehicleType');
    const maxResults = parseInt(url.searchParams.get('limit') || '20');

    // Get open driver trips
    let query = supabase
      .from('trips')
      .select(`
        id,
        user_id,
        from_location,
        from_lat,
        from_lng,
        to_location,
        to_lat,
        to_lng,
        vehicle_type,
        scheduled_time,
        fare,
        is_negotiable,
        seats_available,
        description,
        users!inner(promo_code),
        driver_profiles!inner(plate_number, is_online)
      `)
      .eq('role', 'driver')
      .eq('status', 'pending')
      .eq('driver_profiles.is_online', true)
      .gte('scheduled_time', new Date().toISOString())
      .not('from_lat', 'is', null)
      .not('from_lng', 'is', null);

    if (vehicleType) {
      query = query.eq('vehicle_type', vehicleType);
    }

    const { data: trips, error } = await query.limit(maxResults * 2); // Get more to filter by distance

    if (error) throw error;

    // Calculate distances and filter within radius
    const nearbyTrips = trips
      ?.map(trip => {
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (trip.from_lat - lat) * Math.PI / 180;
        const dLng = (trip.from_lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(trip.from_lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          ...trip,
          distance: Math.round(distance * 100) / 100,
          driver_promo_code: trip.users.promo_code,
          plate_number: trip.driver_profiles.plate_number
        };
      })
      .filter(trip => trip.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults)
      .map(trip => {
        // Clean up the response
        const { users, driver_profiles, ...cleanTrip } = trip;
        return cleanTrip;
      }) || [];

    return new Response(JSON.stringify({
      success: true,
      trips: nearbyTrips,
      count: nearbyTrips.length,
      search_params: {
        center: { lat, lng },
        radius,
        vehicle_type: vehicleType,
        limit: maxResults
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-nearby-open-trips:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch nearby trips',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
