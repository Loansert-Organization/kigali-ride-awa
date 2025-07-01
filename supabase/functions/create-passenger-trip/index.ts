import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const body = await req.json();
    console.log('Received body:', JSON.stringify(body));
    
    // Extract tripData from the wrapped object
    const tripData = body.tripData || body;
    
    // Add default status if not provided
    if (!tripData.status) {
      tripData.status = 'requested';
    }
    
    // Validate required fields
    if (!tripData.passenger_id) {
      return new Response(
        JSON.stringify({ error: 'passenger_id is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Inserting trip data:', JSON.stringify(tripData));
    
    const { data, error } = await supabase
      .from('passenger_trips')
      .insert(tripData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 