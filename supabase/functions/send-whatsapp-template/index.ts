
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
    const { phone_number, user_id } = await req.json()

    // Generate 6-digit OTP code
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phone_number,
        otp_code: otp_code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // WhatsApp API credentials
    const WA_ACCESS_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
    const WA_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    if (!WA_ACCESS_TOKEN || !WA_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured')
    }

    // Format phone number (remove + if present)
    const formattedPhone = phone_number.replace('+', '')
    
    // Send WhatsApp template message using auth_rw template
    const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'auth_rw',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: otp_code }
              ]
            }
          ]
        }
      })
    })

    const whatsappResult = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappResult)
      throw new Error(`WhatsApp API error: ${whatsappResult.error?.message || 'Unknown error'}`)
    }

    console.log('WhatsApp template message sent successfully:', whatsappResult)

    // Update user with phone number if provided
    if (user_id) {
      await supabase
        .from('users')
        .update({ phone_number: phone_number })
        .eq('id', user_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'sent',
        messageId: whatsappResult.messages?.[0]?.id,
        otpCode: otp_code // For demo purposes - remove in production
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Send WhatsApp template error:', error)
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
