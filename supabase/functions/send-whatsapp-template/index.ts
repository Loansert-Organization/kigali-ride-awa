
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
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store OTP code in database
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phone_number,
        otp_code: otpCode,
        user_id: user_id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    if (otpError) {
      console.error('Failed to store OTP:', otpError)
      throw new Error(`Failed to store OTP: ${otpError.message}`)
    }

    // WhatsApp Business API credentials
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
    const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.error('WhatsApp API credentials missing:', { 
        hasToken: !!WHATSAPP_TOKEN, 
        hasPhoneId: !!PHONE_NUMBER_ID 
      })
      throw new Error('WhatsApp API credentials not configured')
    }

    // Format phone number (remove + if present)
    const formattedPhone = phone_number.replace('+', '')
    
    console.log('Sending WhatsApp template to:', formattedPhone, 'with OTP:', otpCode)
    console.log('Using Phone Number ID:', PHONE_NUMBER_ID)

    // Send WhatsApp template message - simplified without buttons
    const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'auth_rw',
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otpCode
                }
              ]
            }
          ]
        }
      })
    })

    const whatsappResult = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappResult)
      
      // If template has issues, fall back to regular text message
      if (whatsappResult.error?.code === 131008) {
        console.log('Template failed, trying text message fallback...')
        
        const textResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
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
              body: `🚗 Kigali Ride Verification\n\nYour verification code: ${otpCode}\n\nThis code expires in 10 minutes.`
            }
          })
        })
        
        const textResult = await textResponse.json()
        
        if (!textResponse.ok) {
          throw new Error(`WhatsApp text message failed: ${textResult.error?.message || 'Unknown error'}`)
        }
        
        console.log('Text message sent successfully:', textResult)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: textResult.messages?.[0]?.id,
            method: 'text_fallback'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
      
      throw new Error(`WhatsApp API error: ${whatsappResult.error?.message || 'Unknown error'}`)
    }

    console.log('WhatsApp template sent successfully:', whatsappResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: whatsappResult.messages?.[0]?.id,
        method: 'template'
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
