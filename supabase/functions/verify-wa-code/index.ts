
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
    const { userId, inputCode } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's verification code and timestamp
    const { data: user, error } = await supabase
      .from('users')
      .select('verification_code, verification_code_sent_at, phone_number')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Check if code matches
    const codeIsValid = user.verification_code === inputCode
    
    // Check if code is expired (10 minutes)
    const codeAge = new Date().getTime() - new Date(user.verification_code_sent_at).getTime()
    const expired = codeAge > (10 * 60 * 1000) // 10 minutes in milliseconds

    if (!codeIsValid || expired) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: expired ? 'Verification code has expired' : 'Invalid verification code'
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
        phone_verified: true, 
        auth_method: 'whatsapp',
        verification_code: null, // Clear the code after use
        verification_code_sent_at: null
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`)
    }

    console.log(`User ${userId} successfully verified via WhatsApp`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully',
        phoneNumber: user.phone_number
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Verify WhatsApp code error:', error)
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
