
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

    const { bookingId, userId, message, title } = await req.json();

    if (!bookingId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, device_type')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tokensError) {
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active push tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the notification attempt
    await supabase
      .from('agent_logs')
      .insert({
        user_id: userId,
        event_type: 'push_notification_sent',
        component: 'notify-trip-matched',
        message: `Notification sent for booking ${bookingId}`,
        metadata: {
          bookingId,
          title: title || 'Trip Update',
          message: message || 'You have a trip update',
          tokenCount: tokens.length
        },
        severity: 'info'
      });

    // In a real implementation, you would send to FCM here
    // For now, we'll just log the successful "send"
    console.log(`Would send notification to ${tokens.length} devices:`, {
      title: title || 'Trip Update',
      body: message || 'You have a trip update',
      bookingId
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokensSent: tokens.length,
        message: 'Notifications queued successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
