
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
    const { phone } = await req.json()
    
    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Sending OTP to phone:', phone)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated OTP:', otp)

    // Create a simple hash using the same method as verify-otp
    const encoder = new TextEncoder()
    const data = encoder.encode(otp + 'salt_kigali_ride')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const code_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    console.log('Generated hash:', code_hash)

    // Store OTP in the otps table (not otp_codes)
    const { error: insertError } = await supabase
      .from('otps')
      .insert({
        phone,
        code_hash,
        expires_at: new Date(Date.now() + 5 * 60_000).toISOString()
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to store OTP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('OTP stored successfully in otps table')

    // Send WhatsApp message
    const whatsappResponse = await fetch(
      'https://graph.facebook.com/v19.0/396791596844039/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('WHATSAPP_API_TOKEN')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: {
            body: `🚗 *Kigali Ride* - Your verification code: ${otp}\n\nThis code expires in 5 minutes.\n\nMurakoze! 🇷🇼`
          }
        })
      }
    )

    const whatsappResult = await whatsappResponse.json()
    console.log('WhatsApp API response:', whatsappResult)

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappResult)
      return new Response(JSON.stringify({ error: 'Failed to send WhatsApp message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('OTP sent successfully to:', phone)

    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
