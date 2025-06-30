import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// This function runs every 15 minutes via cron
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting AI daily suggestions cron job...');
    
    // Get current time and pattern
    const now = new Date();
    const hour = now.getHours();
    const dayType = now.getDay() === 0 || now.getDay() === 6 ? 'weekend' : 'weekday';
    
    let timeSlot = 'morning';
    if (hour >= 5 && hour < 9) timeSlot = 'morning';
    else if (hour >= 9 && hour < 12) timeSlot = 'late_morning';
    else if (hour >= 12 && hour < 14) timeSlot = 'lunch';
    else if (hour >= 14 && hour < 17) timeSlot = 'afternoon';
    else if (hour >= 17 && hour < 20) timeSlot = 'evening';
    else if (hour >= 20 && hour < 23) timeSlot = 'night';
    else timeSlot = 'late_night';

    const currentPattern = `${dayType}_${timeSlot}`;
    
    // Look ahead to the next time slot for proactive suggestions
    const nextHour = hour + 1;
    let nextTimeSlot = timeSlot;
    if (nextHour >= 5 && nextHour < 9) nextTimeSlot = 'morning';
    else if (nextHour >= 9 && nextHour < 12) nextTimeSlot = 'late_morning';
    else if (nextHour >= 12 && nextHour < 14) nextTimeSlot = 'lunch';
    else if (nextHour >= 14 && nextHour < 17) nextTimeSlot = 'afternoon';
    else if (nextHour >= 17 && nextHour < 20) nextTimeSlot = 'evening';
    else if (nextHour >= 20 && nextHour < 23) nextTimeSlot = 'night';
    
    const nextPattern = `${dayType}_${nextTimeSlot}`;

    console.log(`Current pattern: ${currentPattern}, Next pattern: ${nextPattern}`);

    // Get all users with trip history matching the next pattern
    const { data: usersWithPatterns, error: userError } = await supabase
      .from('user_trip_history')
      .select('user_id')
      .in('time_pattern', [currentPattern, nextPattern])
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('user_id');

    if (userError) {
      console.error('Error fetching users:', userError);
      throw userError;
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(usersWithPatterns?.map(u => u.user_id) || [])];
    console.log(`Found ${uniqueUserIds.length} users with matching patterns`);

    let suggestionsCreated = 0;

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Check if user already has pending drafts
        const { data: existingDrafts } = await supabase
          .from('ai_draft_trips')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .gte('expires_at', now.toISOString());

        if (existingDrafts && existingDrafts.length > 0) {
          console.log(`User ${userId} already has ${existingDrafts.length} pending drafts, skipping`);
          continue;
        }

        // Get user's routines for the next time slot
        const { data: routines } = await supabase
          .rpc('get_user_routines', { p_user_id: userId });

        if (!routines || routines.length === 0) continue;

        // Find routines matching next pattern with high frequency
        const relevantRoutines = routines.filter((r: any) => 
          r.time_pattern === nextPattern && r.trip_count >= 3
        );

        if (relevantRoutines.length === 0) continue;

        // Take the most frequent routine
        const topRoutine = relevantRoutines[0];
        
        // Calculate suggested departure time (1 hour from now)
        const suggestedTime = new Date(now);
        suggestedTime.setHours(suggestedTime.getHours() + 1);
        
        // Parse average departure time to adjust minutes
        if (topRoutine.avg_departure_time) {
          const [avgHours, avgMinutes] = topRoutine.avg_departure_time.split(':');
          suggestedTime.setMinutes(parseInt(avgMinutes));
        }

        // Create draft trip
        const draftPayload = {
          role: 'passenger', // Default to passenger for proactive suggestions
          origin_text: topRoutine.common_origin,
          dest_text: topRoutine.common_dest,
          departure_time: suggestedTime.toISOString(),
          seats: 1,
          vehicle_type: 'any'
        };

        const { error: insertError } = await supabase
          .from('ai_draft_trips')
          .insert({
            user_id: userId,
            payload: draftPayload,
            generated_for: suggestedTime.toISOString(),
            confidence_score: Math.min(0.9, topRoutine.trip_count / 10),
            suggestion_reason: `You usually travel this route on ${dayType}s around this time (${topRoutine.trip_count} times in the past month)`,
            expires_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString() // Expires in 2 hours
          });

        if (!insertError) {
          suggestionsCreated++;
          console.log(`Created suggestion for user ${userId}`);
        }

      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    console.log(`AI daily suggestions completed. Created ${suggestionsCreated} suggestions.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestionsCreated,
        processedUsers: uniqueUserIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI daily suggest error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 