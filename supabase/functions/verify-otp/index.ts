
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
    const { phone, code } = await req.json()
    
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: 'Phone and code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Verifying OTP for phone:', phone)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the most recent OTP for this phone
    const { data: otpData, error: fetchError } = await supabase
      .from('otps')
      .select('id, code_hash, expires_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError || !otpData) {
      console.error('No OTP found for phone:', phone)
      return new Response(JSON.stringify({ error: 'No OTP found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpData.expires_at)) {
      console.log('OTP expired for phone:', phone)
      return new Response(JSON.stringify({ error: 'OTP expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the OTP code
    const isValidCode = await bcrypt.compare(code, otpData.code_hash)
    if (!isValidCode) {
      console.log('Invalid OTP code for phone:', phone)
      return new Response(JSON.stringify({ error: 'Invalid code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create or get user in the users table
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone)
      .maybeSingle()

    if (!user) {
      // Create new user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone_number: phone,
          phone_verified: true,
          auth_method: 'whatsapp'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      user = newUser
    } else {
      // Update existing user verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_verified: true,
          auth_method: 'whatsapp'
        })
        .eq('id', user.id)
    }

    // Clean up the used OTP
    await supabase
      .from('otps')
      .delete()
      .eq('id', otpData.id)

    console.log('OTP verification successful for phone:', phone)

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        phone_number: user.phone_number,
        phone_verified: user.phone_verified,
        role: user.role,
        promo_code: user.promo_code
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
