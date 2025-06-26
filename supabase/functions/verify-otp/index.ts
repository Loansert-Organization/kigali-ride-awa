
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
    const { phone, code } = await req.json()
    
    if (!phone || !code) {
      return new Response('no-code', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
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
      return new Response('no-code', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpData.expires_at)) {
      console.log('OTP expired for phone:', phone)
      return new Response('expired', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Verify the OTP code using the same hashing method
    const encoder = new TextEncoder()
    const data = encoder.encode(code + 'salt_kigali_ride')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const inputCodeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (inputCodeHash !== otpData.code_hash) {
      console.log('Invalid OTP code for phone:', phone)
      return new Response('wrong', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
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

    // Create a simple JWT-like token for the user
    const tokenData = {
      user_id: user.id,
      phone: user.phone_number,
      verified: true,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    
    const tokenString = btoa(JSON.stringify(tokenData))

    // Clean up the used OTP
    await supabase
      .from('otps')
      .delete()
      .eq('id', otpData.id)

    console.log('OTP verification successful for phone:', phone)

    return new Response(JSON.stringify({ token: tokenString }), {
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
