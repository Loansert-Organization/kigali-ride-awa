import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'trip_matched' | 'booking_confirmed' | 'trip_reminder' | 'general';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, title, body, data = {}, type = 'general' } = await req.json() as NotificationRequest

    console.log('Sending push notification to user:', userId)

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (tokenError) {
      throw new Error(`Error fetching push tokens: ${  tokenError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active push tokens found for user:', userId)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active push tokens found',
          tokenCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For now, store notifications in database (can be extended with actual push service)
    const notifications = tokens.map(token => ({
      user_id: userId,
      title,
      body,
      data: JSON.stringify(data),
      type,
      token: token.token,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }))

    // Store notification records
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (insertError && !insertError.message.includes('relation "notifications" does not exist')) {
      console.error('Error storing notifications:', insertError)
    }

    // In a production environment, you would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android/Web
    // - Apple Push Notification Service (APNs) for iOS
    // - Web Push Protocol for browsers
    
    console.log(`Successfully processed notification for ${tokens.length} tokens`)

    // Send WhatsApp notification as fallback
    const whatsappFallback = await sendWhatsAppNotification(supabase, userId, title, body)

    return new Response(
      JSON.stringify({
        success: true,
        tokenCount: tokens.length,
        whatsappSent: whatsappFallback,
        type,
        message: 'Notification processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Push notification error:', error)
    await supabase
      .from('notifications')
      .update({ status: 'failed', rejection_reason: error.message })
      .eq('user_id', userId)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function sendWhatsAppNotification(
  supabase: any, 
  userId: string, 
  title: string, 
  body: string
): Promise<boolean> {
  try {
    // Get user's phone number
    const { data: user } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', userId)
      .single()

    if (!user?.phone_number) {
      return false
    }

    // Send WhatsApp message via existing function
    const { error } = await supabase.functions.invoke('send-whatsapp-template', {
      body: {
        to: user.phone_number,
        template_name: 'notification',
        parameters: [title, body],
        language: 'en'
      }
    })

    return !error
  } catch (error) {
    console.error('WhatsApp fallback error:', error)
    return false
  }
}
