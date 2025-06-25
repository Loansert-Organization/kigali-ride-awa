
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

    // Get all pending referrals
    const { data: pendingReferrals, error: referralError } = await supabase
      .from('user_referrals')
      .select(`
        id,
        referrer_id,
        referee_id,
        referee_role,
        points_awarded,
        validation_status,
        reward_week,
        users!user_referrals_referee_id_fkey(id)
      `)
      .eq('validation_status', 'pending');

    if (referralError) throw referralError;

    const validationResults = [];

    for (const referral of pendingReferrals || []) {
      try {
        let isValid = false;
        let pointsToAward = 0;

        if (referral.referee_role === 'passenger') {
          // Check if passenger has completed at least 1 trip
          const { data: trips, error: tripError } = await supabase
            .from('trips')
            .select('id')
            .eq('user_id', referral.referee_id)
            .eq('role', 'passenger')
            .eq('status', 'completed');

          if (tripError) throw tripError;

          if (trips && trips.length >= 1) {
            isValid = true;
            pointsToAward = 1; // 1 point for passenger referral
          }

        } else if (referral.referee_role === 'driver') {
          // Check if driver has completed at least 5 trips
          const { data: trips, error: tripError } = await supabase
            .from('trips')
            .select('id')
            .eq('user_id', referral.referee_id)
            .eq('role', 'driver')
            .eq('status', 'completed');

          if (tripError) throw tripError;

          if (trips && trips.length >= 5) {
            isValid = true;
            pointsToAward = 5; // 5 points for driver referral
          } else if (trips && trips.length > 0) {
            // Update progress but don't validate yet
            await supabase
              .from('user_referrals')
              .update({ points_awarded: trips.length })
              .eq('id', referral.id);
          }
        }

        if (isValid) {
          // Update referral status to valid
          await supabase
            .from('user_referrals')
            .update({
              validation_status: 'valid',
              points_awarded: pointsToAward
            })
            .eq('id', referral.id);

          // Add points to referrer's weekly rewards
          const currentWeek = new Date();
          const monday = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
          const weekString = monday.toISOString().split('T')[0];

          const { data: existingReward } = await supabase
            .from('user_rewards')
            .select('id, points')
            .eq('user_id', referral.referrer_id)
            .eq('week', weekString)
            .single();

          if (existingReward) {
            // Update existing weekly reward
            await supabase
              .from('user_rewards')
              .update({ points: existingReward.points + pointsToAward })
              .eq('id', existingReward.id);
          } else {
            // Create new weekly reward entry
            await supabase
              .from('user_rewards')
              .insert({
                user_id: referral.referrer_id,
                week: weekString,
                points: pointsToAward,
                reward_issued: false
              });
          }

          validationResults.push({
            referral_id: referral.id,
            referrer_id: referral.referrer_id,
            referee_id: referral.referee_id,
            points_awarded: pointsToAward,
            status: 'validated'
          });

          console.log(`Referral validated: ${referral.id}, points awarded: ${pointsToAward}`);
        }

      } catch (error) {
        console.error(`Error validating referral ${referral.id}:`, error);
        validationResults.push({
          referral_id: referral.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: validationResults.length,
      validated: validationResults.filter(r => r.status === 'validated').length,
      results: validationResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-referral-points:', error);
    return new Response(JSON.stringify({
      error: 'Referral validation failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
