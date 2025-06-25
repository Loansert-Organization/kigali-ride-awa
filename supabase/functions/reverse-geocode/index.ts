
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Call Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`
    );

    if (!response.ok) {
      throw new Error(`Google API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for the given coordinates');
    }

    const result = data.results[0];
    
    // Extract relevant information
    const addressComponents = result.address_components || [];
    let neighborhood = '';
    let district = '';
    let city = '';
    let country = '';
    
    for (const component of addressComponents) {
      const types = component.types;
      if (types.includes('neighborhood') || types.includes('sublocality')) {
        neighborhood = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      }
      if (types.includes('locality') || types.includes('administrative_area_level_1')) {
        city = component.long_name;
      }
      if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // Find nearby places of interest
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&key=${apiKey}&language=en`
    );

    let nearbyPlaces = [];
    if (placesResponse.ok) {
      const placesData = await placesResponse.json();
      if (placesData.status === 'OK' && placesData.results) {
        nearbyPlaces = placesData.results
          .slice(0, 5)
          .map((place: any) => ({
            name: place.name,
            type: place.types[0],
            rating: place.rating || null,
            vicinity: place.vicinity
          }));
      }
    }

    const geocodeResult = {
      formatted_address: result.formatted_address,
      components: {
        neighborhood,
        district,
        city,
        country
      },
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      place_id: result.place_id,
      nearby_places: nearbyPlaces,
      types: result.types
    };

    console.log(`Reverse geocoded: ${lat}, ${lng} -> ${result.formatted_address}`);

    return new Response(JSON.stringify({
      success: true,
      result: geocodeResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reverse-geocode:', error);
    return new Response(JSON.stringify({
      error: 'Reverse geocoding failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
