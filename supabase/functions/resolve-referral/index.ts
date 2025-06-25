
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { promoCode, refereeRole } = await req.json();
    
    if (!promoCode || !refereeRole) {
      throw new Error('Promo code and referee role are required');
    }

    // Find the referrer by promo code
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id')
      .eq('promo_code', promoCode)
      .single();

    if (referrerError || !referrer) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid promo code'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get referee user profile
    const { data: referee, error: refereeError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (refereeError || !referee) {
      throw new Error('Referee profile not found');
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referrer_id', referrer.id)
      .eq('referee_id', referee.id)
      .single();

    if (existingReferral) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Referral already exists'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create referral record
    const { data: newReferral, error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referrer.id,
        referee_id: referee.id,
        referee_role: refereeRole,
        validation_status: 'pending',
        points_awarded: 0
      })
      .select()
      .single();

    if (referralError) throw referralError;

    // Calculate points based on role
    const points = refereeRole === 'driver' ? 5 : 1;

    // Update referral with points
    await supabase
      .from('user_referrals')
      .update({
        points_awarded: points,
        validation_status: 'validated'
      })
      .eq('id', newReferral.id);

    // Update user rewards for the current week
    const currentWeek = new Date();
    const monday = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
    monday.setHours(0, 0, 0, 0);
    const weekString = monday.toISOString().split('T')[0];

    await supabase
      .from('user_rewards')
      .upsert({
        user_id: referrer.id,
        week: weekString,
        points: points,
        reward_issued: false
      }, {
        onConflict: 'user_id,week',
        ignoreDuplicates: false
      });

    console.log('Referral resolved successfully:', newReferral);

    return new Response(JSON.stringify({
      success: true,
      referral: newReferral,
      points_awarded: points,
      message: 'Referral processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in resolve-referral:', error);
    return new Response(JSON.stringify({
      error: 'Referral resolution failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
