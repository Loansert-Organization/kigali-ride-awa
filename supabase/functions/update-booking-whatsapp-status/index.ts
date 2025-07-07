import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId, whatsappLaunched } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating WhatsApp status for booking:', { bookingId, whatsappLaunched });

    // Update the booking WhatsApp status
    const { data, error } = await supabase
      .from('bookings')
      .update({
        whatsapp_launched: whatsappLaunched,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update booking', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the WhatsApp launch event
    await supabase
      .from('agent_logs')
      .insert({
        event_type: 'whatsapp_launched',
        component: 'booking-coordination',
        message: `WhatsApp launched for booking ${bookingId}`,
        metadata: {
          bookingId,
          whatsappLaunched,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

    console.log('WhatsApp status updated successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in update-booking-whatsapp-status:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});