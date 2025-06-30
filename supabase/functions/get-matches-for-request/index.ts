import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { requestId } = await req.json();

  // In a real app, you'd fetch the passenger request and then
  // perform a geo-spatial query to find nearby, time-compatible driver trips.
  // For now, we'll return all open driver trips as potential matches.
  
  const { data, error } = await supabase
    .from('driver_trips')
    .select('*')
    .eq('status', 'open');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}); 