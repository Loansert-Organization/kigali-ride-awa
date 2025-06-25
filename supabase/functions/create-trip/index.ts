
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Geocoding function using Google Maps API
async function geocodeAddress(address: string) {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const encodedAddress = encodeURIComponent(address);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
  );

  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
      formatted_address: data.results[0].formatted_address
    };
  }
  
  return null;
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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const tripData = await req.json();

    // Validate required fields
    const requiredFields = ['from_location', 'to_location', 'vehicle_type', 'role'];
    for (const field of requiredFields) {
      if (!tripData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Verify role matches
    if (userProfile.role !== tripData.role) {
      throw new Error('Role mismatch');
    }

    // Geocode addresses if coordinates not provided
    let fromCoords = null;
    let toCoords = null;

    if (!tripData.from_lat || !tripData.from_lng) {
      try {
        fromCoords = await geocodeAddress(tripData.from_location);
      } catch (error) {
        console.warn('Geocoding failed for from_location:', error);
      }
    }

    if (!tripData.to_lat || !tripData.to_lng) {
      try {
        toCoords = await geocodeAddress(tripData.to_location);
      } catch (error) {
        console.warn('Geocoding failed for to_location:', error);
      }
    }

    // Prepare trip data for insertion
    const insertData = {
      user_id: userProfile.id,
      role: tripData.role,
      from_location: tripData.from_location,
      from_lat: tripData.from_lat || fromCoords?.lat || null,
      from_lng: tripData.from_lng || fromCoords?.lng || null,
      to_location: tripData.to_location,
      to_lat: tripData.to_lat || toCoords?.lat || null,
      to_lng: tripData.to_lng || toCoords?.lng || null,
      vehicle_type: tripData.vehicle_type,
      scheduled_time: tripData.scheduled_time || new Date().toISOString(),
      fare: tripData.fare || null,
      is_negotiable: tripData.is_negotiable ?? true,
      seats_available: tripData.seats_available || 1,
      description: tripData.description || null,
      status: 'pending'
    };

    // Create the trip
    const { data: newTrip, error: tripError } = await supabase
      .from('trips')
      .insert(insertData)
      .select()
      .single();

    if (tripError) throw tripError;

    // Log trip creation for heatmap
    if (newTrip.from_lat && newTrip.from_lng) {
      await supabase
        .from('trip_heatmap_logs')
        .insert({
          trip_id: newTrip.id,
          lat: newTrip.from_lat,
          lng: newTrip.from_lng,
          role: tripData.role
        });
    }

    console.log('Trip created successfully:', newTrip);

    return new Response(JSON.stringify({
      success: true,
      trip: newTrip,
      geocoding: {
        from_geocoded: !!fromCoords,
        to_geocoded: !!toCoords
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-trip:', error);
    return new Response(JSON.stringify({
      error: 'Trip creation failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
