import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { vehicleData } = await req.json();
  
  const { data, error } = await supabase
    .from('driver_vehicles')
    .insert(vehicleData)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // Also update the driver's profile to set this as the active vehicle
  await supabase
    .from('drivers')
    .update({ active_vehicle_id: data.id })
    .eq('user_id', vehicleData.driver_id);

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}); 