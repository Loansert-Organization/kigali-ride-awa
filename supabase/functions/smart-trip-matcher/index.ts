
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TripMatchRequest {
  passengerTripId: string;
  maxDistance?: number; // km
  maxTimeDiff?: number; // minutes
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

    const { passengerTripId, maxDistance = 5, maxTimeDiff = 30 } = await req.json() as TripMatchRequest

    console.log('Smart trip matching for:', passengerTripId)

    // Get passenger trip details
    const { data: passengerTrip, error: passengerError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', passengerTripId)
      .eq('role', 'passenger')
      .single()

    if (passengerError || !passengerTrip) {
      throw new Error('Passenger trip not found')
    }

    // Calculate time window
    const scheduledTime = new Date(passengerTrip.scheduled_time)
    const timeStart = new Date(scheduledTime.getTime() - maxTimeDiff * 60000)
    const timeEnd = new Date(scheduledTime.getTime() + maxTimeDiff * 60000)

    // Find matching driver trips
    const { data: driverTrips, error: driverError } = await supabase
      .from('trips')
      .select(`
        *,
        users!inner(phone_number, promo_code)
      `)
      .eq('role', 'driver')
      .eq('status', 'pending')
      .gte('scheduled_time', timeStart.toISOString())
      .lte('scheduled_time', timeEnd.toISOString())
      .eq('vehicle_type', passengerTrip.vehicle_type)

    if (driverError) {
      throw new Error(`Error fetching driver trips: ${  driverError.message}`)
    }

    // Calculate distances and score matches
    const matches = (driverTrips || []).map(driverTrip => {
      const fromDistance = calculateDistance(
        passengerTrip.from_lat || 0,
        passengerTrip.from_lng || 0,
        driverTrip.from_lat || 0,
        driverTrip.from_lng || 0
      )

      const toDistance = calculateDistance(
        passengerTrip.to_lat || 0,
        passengerTrip.to_lng || 0,
        driverTrip.to_lat || 0,
        driverTrip.to_lng || 0
      )

      const timeDiff = Math.abs(
        new Date(driverTrip.scheduled_time).getTime() - scheduledTime.getTime()
      ) / (1000 * 60) // minutes

      const score = calculateMatchScore(fromDistance, toDistance, timeDiff, maxDistance, maxTimeDiff)

      return {
        ...driverTrip,
        match_score: score,
        from_distance_km: fromDistance,
        to_distance_km: toDistance,
        time_diff_minutes: timeDiff
      }
    })
    .filter(match => 
      match.from_distance_km <= maxDistance && 
      match.to_distance_km <= maxDistance &&
      match.match_score > 0.3 // Minimum match threshold
    )
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10) // Top 10 matches

    console.log(`Found ${matches.length} matches for passenger trip ${passengerTripId}`)

    return new Response(
      JSON.stringify({
        success: true,
        passengerTrip,
        matches,
        matchCount: matches.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Smart trip matcher error:', error)
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

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Smart scoring algorithm
function calculateMatchScore(
  fromDistance: number, 
  toDistance: number, 
  timeDiff: number,
  maxDistance: number,
  maxTimeDiff: number
): number {
  // Distance score (closer = better)
  const distanceScore = Math.max(0, 1 - (fromDistance + toDistance) / (maxDistance * 2))
  
  // Time score (closer = better)
  const timeScore = Math.max(0, 1 - timeDiff / maxTimeDiff)
  
  // Weighted combination
  return (distanceScore * 0.6) + (timeScore * 0.4)
}
