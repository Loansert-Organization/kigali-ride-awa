
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
    const { phoneNumber, currentUserId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Search for user with same phone (excluding current user)
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id, phone_verified')
      .eq('phone_number', phoneNumber)
      .neq('id', currentUserId)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // Unexpected error (not "No rows found")
      throw new Error(`Database error: ${error.message}`)
    }

    if (existingUser) {
      console.log(`Duplicate phone found: ${phoneNumber} already used by user ${existingUser.id}`)
      
      return new Response(
        JSON.stringify({ 
          exists: true, 
          existingUserId: existingUser.id,
          isVerified: existingUser.phone_verified
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ exists: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Check duplicate phone error:', error)
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
