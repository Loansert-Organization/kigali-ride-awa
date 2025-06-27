
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting weekly reward processing...')

    // Get current week start (Monday)
    const now = new Date()
    const currentWeekStart = new Date(now)
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
    currentWeekStart.setHours(0, 0, 0, 0)

    // Process referral rewards
    const { data: pendingReferrals, error: referralError } = await supabase
      .from('user_referrals')
      .select(`
        *,
        referrer:users!user_referrals_referrer_id_fkey(id, role),
        referee:users!user_referrals_referee_id_fkey(id, role)
      `)
      .eq('validation_status', 'pending')

    if (referralError) {
      throw new Error(`Error fetching referrals: ${  referralError.message}`)
    }

    let processedRewards = 0
    const rewardUpdates = []

    for (const referral of pendingReferrals || []) {
      // Check if referee has completed qualifying actions
      const isQualified = await checkReferralQualification(supabase, referral)
      
      if (isQualified) {
        // Calculate points based on referee role
        const points = referral.referee.role === 'driver' ? 5 : 1

        // Award points to referrer
        rewardUpdates.push({
          user_id: referral.referrer_id,
          week: currentWeekStart.toISOString().split('T')[0],
          points,
          reward_type: 'referral',
          reward_issued: true
        })

        // Mark referral as validated
        await supabase
          .from('user_referrals')
          .update({
            validation_status: 'validated',
            points_awarded: points,
            reward_week: currentWeekStart.toISOString().split('T')[0]
          })
          .eq('id', referral.id)

        processedRewards++
      }
    }

    // Batch insert rewards
    if (rewardUpdates.length > 0) {
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .upsert(rewardUpdates, {
          onConflict: 'user_id,week,reward_type',
          ignoreDuplicates: false
        })

      if (rewardError) {
        console.error('Error inserting rewards:', rewardError)
      }
    }

    // Update leaderboard materialized view
    await supabase.rpc('refresh_materialized_view', { 
      view_name: 'weekly_rewards_leaderboard_view' 
    })

    console.log(`Processed ${processedRewards} rewards for week starting ${currentWeekStart.toISOString()}`)

    return new Response(
      JSON.stringify({
        success: true,
        processedRewards,
        weekStart: currentWeekStart.toISOString(),
        message: 'Weekly rewards processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Reward processor error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function checkReferralQualification(supabase: any, referral: any): Promise<boolean> {
  try {
    if (referral.referee.role === 'passenger') {
      // Passenger needs to complete at least 1 confirmed booking
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('passenger_trip_id', referral.referee_id)
        .eq('confirmed', true)
        .limit(1)

      return bookings && bookings.length > 0
    } 
    
    if (referral.referee.role === 'driver') {
      // Driver needs to complete at least 5 confirmed bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('driver_trip_id', referral.referee_id)
        .eq('confirmed', true)
        .limit(5)

      return bookings && bookings.length >= 5
    }

    return false
  } catch (error) {
    console.error('Error checking qualification:', error)
    return false
  }
}
