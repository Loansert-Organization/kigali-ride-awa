import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, action = 'authenticate' } = await req.json();
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Validate Rwanda phone number format
    const rwandaPhoneRegex = /^(\+?250|0)?(78|79|73|72)\d{7}$/;
    if (!rwandaPhoneRegex.test(phoneNumber)) {
      throw new Error('Invalid Rwanda phone number format');
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/^\+?250/, '0').replace(/^0/, '+250');

    console.log('🔐 WhatsApp OAuth request:', { phoneNumber: normalizedPhone, action });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (action === 'send_otp') {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      const { error: otpError } = await supabase
        .from('otp_codes')
        .upsert({
          phone_number: normalizedPhone,
          code: otp,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          verified: false
        });

      if (otpError) {
        throw otpError;
      }

      // In a real implementation, send OTP via WhatsApp API
      // For now, we'll simulate success
      console.log('📱 Would send OTP:', otp, 'to', normalizedPhone);

      return new Response(JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        phone_number: normalizedPhone,
        // In development, return OTP for testing
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp })
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_otp') {
      const { otp } = await req.json();
      
      if (!otp) {
        throw new Error('OTP is required');
      }

      // Verify OTP
      const { data: otpRecord, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone_number', normalizedPhone)
        .eq('code', otp)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark OTP as verified
      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Check if user exists
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Create user if doesn't exist
      if (!user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone: normalizedPhone,
            auth_method: 'whatsapp',
            onboarding_completed: false,
            location_enabled: false,
            notifications_enabled: false,
            promo_code: `RIDE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        user = newUser;
      }

      // Create session token
      const sessionToken = `whatsapp_${user.id}_${Date.now()}`;
      
      // Store session
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          session_token: sessionToken,
          phone_number: normalizedPhone,
          auth_method: 'whatsapp',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          is_active: true
        });

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          onboarding_completed: user.onboarding_completed,
          promo_code: user.promo_code
        },
        session_token: sessionToken,
        message: 'Authentication successful'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('💥 WhatsApp OAuth error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Authentication failed'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});