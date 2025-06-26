
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
    const { phone_number, otp_code } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify OTP code
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('otp_code', otp_code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired OTP code'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Mark OTP as used
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Check if user exists with this phone number
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('phone_verified', true)
      .eq('auth_method', 'whatsapp')
      .single()

    let user = existingUser

    if (!user) {
      // Create new user with WhatsApp verification
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone_number: phone_number,
          phone_verified: true,
          auth_method: 'whatsapp',
          location_enabled: false,
          notifications_enabled: true,
          language: 'en',
          onboarding_completed: false
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        throw new Error('Failed to create user profile')
      }

      user = newUser
      console.log(`New WhatsApp user created: ${user.id}`)
    } else {
      console.log(`Existing WhatsApp user verified: ${user.id}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully',
        user: {
          id: user.id,
          phone_number: user.phone_number,
          role: user.role,
          onboarding_completed: user.onboarding_completed,
          promo_code: user.promo_code
        }
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
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
