
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

    const now = new Date();
    const expireThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

    // Find expired trips that are still pending
    const { data: expiredTrips, error: selectError } = await supabase
      .from('trips')
      .select('id, user_id, role, from_location, to_location, scheduled_time')
      .eq('status', 'pending')
      .lt('scheduled_time', expireThreshold.toISOString());

    if (selectError) throw selectError;

    if (!expiredTrips || expiredTrips.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No expired trips found',
        expired_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update expired trips to 'expired' status
    const { error: updateError } = await supabase
      .from('trips')
      .update({ 
        status: 'expired',
        updated_at: now.toISOString()
      })
      .in('id', expiredTrips.map(trip => trip.id));

    if (updateError) throw updateError;

    // Cancel related bookings
    const tripIds = expiredTrips.map(trip => trip.id);
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        confirmed: false,
        updated_at: now.toISOString()
      })
      .or(`passenger_trip_id.in.(${tripIds.join(',')}),driver_trip_id.in.(${tripIds.join(',')})`);

    if (bookingError) {
      console.warn('Error updating related bookings:', bookingError);
    }

    // Archive trips older than 30 days
    const archiveThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: oldTrips, error: oldTripsError } = await supabase
      .from('trips')
      .select('id')
      .lt('created_at', archiveThreshold.toISOString())
      .in('status', ['completed', 'cancelled', 'expired']);

    if (oldTripsError) {
      console.warn('Error finding old trips:', oldTripsError);
    } else if (oldTrips && oldTrips.length > 0) {
      // In a real implementation, you might move these to an archive table
      // For now, we'll just log them
      console.log(`Found ${oldTrips.length} trips ready for archiving`);
    }

    console.log(`Expired ${expiredTrips.length} trips`);

    return new Response(JSON.stringify({
      success: true,
      expired_count: expiredTrips.length,
      expired_trips: expiredTrips.map(trip => ({
        id: trip.id,
        route: `${trip.from_location} → ${trip.to_location}`,
        scheduled_time: trip.scheduled_time,
        role: trip.role
      })),
      archive_candidates: oldTrips?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto-expire-trips:', error);
    return new Response(JSON.stringify({
      error: 'Trip expiry process failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
