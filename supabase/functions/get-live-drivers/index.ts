
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

    // Get online drivers with their latest locations
    let query = supabase
      .from('driver_profiles')
      .select(`
        user_id,
        vehicle_type,
        plate_number,
        is_online,
        users!inner(promo_code),
        trips!inner(
          id,
          from_lat,
          from_lng,
          to_location,
          scheduled_time,
          status,
          seats_available
        )
      `)
      .eq('is_online', true)
      .eq('trips.status', 'pending')
      .eq('trips.role', 'driver');

    if (vehicleType) {
      query = query.eq('vehicle_type', vehicleType);
    }

    const { data: drivers, error } = await query;

    if (error) throw error;

    // Filter drivers within radius and add distance calculation
    const liveDrivers = drivers
      ?.filter(driver => {
        const trip = driver.trips[0];
        if (!trip?.from_lat || !trip?.from_lng) return false;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (trip.from_lat - lat) * Math.PI / 180;
        const dLng = (trip.from_lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(trip.from_lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return distance <= radius;
      })
      .map(driver => ({
        id: driver.user_id,
        promo_code: driver.users.promo_code,
        vehicle_type: driver.vehicle_type,
        plate_number: driver.plate_number,
        location: {
          lat: driver.trips[0].from_lat,
          lng: driver.trips[0].from_lng
        },
        destination: driver.trips[0].to_location,
        scheduled_time: driver.trips[0].scheduled_time,
        seats_available: driver.trips[0].seats_available,
        trip_id: driver.trips[0].id
      })) || [];

    return new Response(JSON.stringify({
      success: true,
      drivers: liveDrivers,
      count: liveDrivers.length,
      search_radius: radius
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-live-drivers:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch live drivers',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
