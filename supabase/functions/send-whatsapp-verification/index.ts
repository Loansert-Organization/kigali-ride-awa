
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, verificationCode, appUrl } = await req.json()

    // WhatsApp Business API token
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
    
    if (!WHATSAPP_TOKEN) {
      throw new Error('WhatsApp API token not configured')
    }

    // Format phone number (remove + if present)
    const formattedPhone = phoneNumber.replace('+', '')
    
    // Create verification message
    const message = `🚗 Kigali Ride Verification\n\nYour verification code: ${verificationCode}\n\nClick to complete verification: ${appUrl}/verify?code=${verificationCode}&phone=${encodeURIComponent(phoneNumber)}\n\nThis link expires in 10 minutes.`

    // Send WhatsApp message using Meta Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const result = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messages?.[0]?.id,
        verificationCode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('WhatsApp verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
