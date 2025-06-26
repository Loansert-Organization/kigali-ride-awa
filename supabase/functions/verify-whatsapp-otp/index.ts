
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
    const { phone_number, otp_code, user_id } = await req.json()

    if (!phone_number || !otp_code || !user_id) {
      throw new Error('Missing required parameters: phone_number, otp_code, user_id')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the most recent OTP for this phone number and user
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      console.error('OTP record not found:', otpError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No OTP found for this phone number'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if OTP has expired (10 minutes)
    const expirationTime = new Date(otpRecord.expires_at).getTime()
    const currentTime = new Date().getTime()
    
    if (currentTime > expirationTime) {
      console.log('OTP expired for phone:', phone_number)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'OTP has expired. Please request a new one.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if OTP matches
    if (otpRecord.otp_code !== otp_code) {
      console.log('Invalid OTP for phone:', phone_number, 'Expected:', otpRecord.otp_code, 'Got:', otp_code)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid OTP code'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        phone_number: phone_number,
        phone_verified: true, 
        auth_method: 'whatsapp'
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Failed to update user:', updateError)
      throw new Error(`Update error: ${updateError.message}`)
    }

    // Delete the used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', otpRecord.id)

    console.log(`User ${user_id} successfully verified via WhatsApp OTP`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully',
        phoneNumber: phone_number
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Verify WhatsApp OTP error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message || 'Verification failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
