
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'

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
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString()

    // Store OTP with bcrypt hash
    const { error: insertError } = await supabase
      .from('otps')
      .insert({
        phone,
        code_hash: await bcrypt.hash(otp),
        expires_at: new Date(Date.now() + 5 * 60_000) // 5-minute expiry
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to store OTP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Send WhatsApp message using the autho_rw template
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
          type: 'template',
          template: {
            name: 'autho_rw',
            language: { code: 'en' },
            components: [
              { 
                type: 'body', 
                parameters: [{ type: 'text', text: otp }] 
              }
            ]
          }
        })
      }
    )

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text()
      console.error('WhatsApp API error:', errorText)
      return new Response(JSON.stringify({ error: 'WhatsApp send failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const whatsappResult = await whatsappResponse.json()
    console.log('WhatsApp OTP sent successfully:', whatsappResult)

    return new Response(JSON.stringify({ success: true, messageId: whatsappResult.messages?.[0]?.id }), {
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
