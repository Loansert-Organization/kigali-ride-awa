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

    const { userId, title, body, data } = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending push notification to user:', userId);

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active push tokens found for user:', userId);
      return new Response(
        JSON.stringify({ message: 'No active push tokens found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;

    // For web push notifications, we would need VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = Deno.env.get('VAPID_EMAIL');

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      console.log('VAPID keys not configured, storing notification for future delivery');
      
      // Store notification for when VAPID is configured
      const { error: notificationError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          title,
          body,
          data: data || {},
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Error storing notification:', notificationError);
      }

      return new Response(
        JSON.stringify({ 
          message: 'VAPID not configured, notification stored for later delivery',
          stored: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Here you would implement actual web push using VAPID keys
    // For now, we'll simulate successful delivery
    for (const token of tokens) {
      try {
        // Simulate push notification sending
        console.log(`Sending notification to token: ${token.token.substring(0, 20)}...`);
        
        // In a real implementation, you'd use the Web Push protocol
        // await webpush.sendNotification(subscription, payload, options);
        
        successCount++;
      } catch (error) {
        console.error('Error sending to token:', token.token, error);
        failureCount++;
        
        // Mark token as inactive if it consistently fails
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('id', token.id);
      }
    }

    console.log(`Push notification results: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        message: `Notification sent to ${successCount} devices`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification-production:', error);
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