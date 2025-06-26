
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, userId } = await req.json()

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const now = new Date().toISOString()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save verification code to database
    const { error: dbError } = await supabase
      .from('users')
      .update({
        verification_code: code,
        verification_code_sent_at: now,
        phone_number: phone
      })
      .eq('id', userId)

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // WhatsApp Business API token
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
    const PHONE_NUMBER_ID = '396791596844039' // Updated Phone Number ID
    
    if (!WHATSAPP_TOKEN) {
      throw new Error('WhatsApp API credentials not configured')
    }

    // Format phone number (remove + if present)
    const formattedPhone = phone.replace('+', '')
    
    // Create verification message
    const message = `🚗 Kigali Ride\n\nYour verification code: ${code}\n\nThis code expires in 10 minutes.`

    console.log('Sending WhatsApp message:', {
      to: formattedPhone,
      phoneNumberId: PHONE_NUMBER_ID,
      messagePreview: message.substring(0, 50) + '...'
    });

    // Send WhatsApp message using Meta Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
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

    const whatsappResult = await whatsappResponse.json()

    console.log('WhatsApp API response:', {
      status: whatsappResponse.status,
      statusText: whatsappResponse.statusText,
      result: whatsappResult
    });

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappResult)
      throw new Error(`WhatsApp API error: ${whatsappResult.error?.message || 'Unknown error'}`)
    }

    console.log('WhatsApp message sent successfully:', whatsappResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'sent',
        messageId: whatsappResult.messages?.[0]?.id,
        phoneNumberId: PHONE_NUMBER_ID,
        verificationCode: code // For demo purposes - remove in production
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Send WhatsApp code error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
