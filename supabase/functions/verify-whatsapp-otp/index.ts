
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
    const { phone_number, otp_code, user_id } = await req.json();

    console.log('WhatsApp OTP verification request:', {
      phone_number,
      user_id,
      otp_code: otp_code ? `${otp_code.substring(0, 2)}****` : 'missing',
      timestamp: new Date().toISOString()
    });

    if (!phone_number || !otp_code || !user_id) {
      throw new Error('Missing required parameters: phone_number, otp_code, user_id');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the most recent valid OTP for this phone number and user
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('user_id', user_id)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('OTP lookup result:', {
      found: !!otpRecord,
      error: otpError?.message,
      recordId: otpRecord?.id
    });

    if (otpError || !otpRecord) {
      console.error('OTP record not found:', otpError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No valid OTP found for this phone number. Please request a new code.',
          error: otpError?.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if OTP has expired (10 minutes)
    const expirationTime = new Date(otpRecord.expires_at).getTime();
    const currentTime = new Date().getTime();
    
    console.log('OTP expiration check:', {
      expiresAt: otpRecord.expires_at,
      currentTime: new Date().toISOString(),
      isExpired: currentTime > expirationTime
    });
    
    if (currentTime > expirationTime) {
      console.log('OTP expired for phone:', phone_number);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'OTP has expired. Please request a new one.',
          expired: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if OTP matches
    if (otpRecord.otp_code !== otp_code) {
      console.log('Invalid OTP attempt:', {
        phone: phone_number,
        expected: `${otpRecord.otp_code.substring(0, 2)}****`,
        received: `${otp_code.substring(0, 2)}****`
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid OTP code. Please check and try again.',
          invalid: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Mark OTP as used
    const { error: markUsedError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (markUsedError) {
      console.error('Failed to mark OTP as used:', markUsedError);
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        phone_number: phone_number,
        phone_verified: true, 
        auth_method: 'whatsapp'
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      throw new Error(`User update error: ${updateError.message}`);
    }

    console.log(`User ${user_id} successfully verified via WhatsApp OTP`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully',
        phoneNumber: phone_number,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Verify WhatsApp OTP error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Verification failed due to server error',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
