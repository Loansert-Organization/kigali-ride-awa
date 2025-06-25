
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referralCode, refereeId, refereeRole } = await req.json();

    if (!referralCode || !refereeId || !refereeRole) {
      throw new Error('Missing required referral data');
    }

    // Find the referrer by promo code
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, promo_code')
      .eq('promo_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      throw new Error('Invalid referral code');
    }

    // Prevent self-referral
    if (referrer.id === refereeId) {
      throw new Error('Self-referral not allowed');
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referrer_id', referrer.id)
      .eq('referee_id', refereeId)
      .single();

    if (existingReferral) {
      throw new Error('Referral already exists');
    }

    // Create referral record
    const { data: newReferral, error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referrer.id,
        referee_id: refereeId,
        referee_role: refereeRole,
        validation_status: 'pending',
        reward_week: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (referralError) throw referralError;

    // Update the referee's referred_by field
    await supabase
      .from('users')
      .update({ referred_by: referralCode })
      .eq('id', refereeId);

    console.log('Referral created successfully:', newReferral);

    return new Response(JSON.stringify({
      success: true,
      referral: newReferral,
      message: 'Referral processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in resolve-referral:', error);
    return new Response(JSON.stringify({
      error: 'Referral processing failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
