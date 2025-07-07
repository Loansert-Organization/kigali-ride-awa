import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push implementation using built-in Crypto API
async function sendWebPushNotification(
  subscription: any, 
  payload: string, 
  vapidPublicKey: string, 
  vapidPrivateKey: string,
  vapidEmail: string
) {
  const { endpoint, keys } = subscription;
  const { p256dh, auth } = keys;

  // Import VAPID private key
  const vapidPrivateKeyBuffer = Uint8Array.from(vapidPrivateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const importedVapidKey = await crypto.subtle.importKey(
    'raw',
    vapidPrivateKeyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours
  const jwtPayload = {
    aud: new URL(endpoint).origin,
    exp,
    sub: `mailto:${vapidEmail}`
  };

  // Encode JWT
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Sign JWT
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    importedVapidKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Prepare headers for push request
  const pushHeaders: Record<string, string> = {
    'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
    'Content-Type': 'application/octet-stream',
    'TTL': '86400',
  };

  // Send push notification
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: pushHeaders,
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Push notification failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

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

    let successCount = 0;
    let failureCount = 0;

    // Send to each token
    for (const tokenRecord of tokens) {
      try {
        const subscription = JSON.parse(tokenRecord.token);
        const payload = JSON.stringify({ title, body, data: data || {} });
        
        await sendWebPushNotification(
          subscription,
          payload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidEmail
        );

        console.log(`Successfully sent notification to subscription: ${subscription.endpoint.substring(0, 50)}...`);
        successCount++;
      } catch (error) {
        console.error('Error sending to token:', tokenRecord.token, error);
        failureCount++;
        
        // Mark token as inactive if it consistently fails
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('id', tokenRecord.id);
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
    console.error('Error in send-push-notification-real:', error);
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