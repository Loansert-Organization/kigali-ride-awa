
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
    console.log('🗺️ Maps signature request received');
    
    // Load Google Maps API keys from environment
    const SECRET_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const RESTRICTED_KEY = Deno.env.get("GOOGLE_MAPS_RESTRICTED_KEY");
    
    if (!SECRET_KEY) {
      console.error('❌ Google Maps API key not configured');
      throw new Error('Google Maps API key not configured');
    }
    
    // Prefer restricted key if available, fallback to secret key
    const apiKey = RESTRICTED_KEY || SECRET_KEY;
    
    console.log('✅ Returning Google Maps API key with 60s TTL');
    
    return new Response(JSON.stringify({
      key: apiKey,
      ttl: 60,
      timestamp: Date.now()
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });

  } catch (error) {
    console.error('❌ Error in maps-sig function:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate maps signature',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
