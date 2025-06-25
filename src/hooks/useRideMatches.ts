
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSmartTripMatcher } from './useSmartTripMatcher';
import { useNotificationService } from './useNotificationService';

interface Trip {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  is_negotiable?: boolean;
  description?: string;
  role: string;
  seats_available?: number;
  // Additional fields for matched trips
  match_score?: number;
  from_distance_km?: number;
  to_distance_km?: number;
  time_diff_minutes?: number;
  users?: {
    phone_number?: string;
    promo_code: string;
  };
}

interface Filters {
  vehicleType: string[];
  timeRange: string;
  sortBy: string;
}

export const useRideMatches = () => {
  const location = useLocation();
  const [passengerTrip, setPassengerTrip] = useState<Trip | null>(null);
  const [matchingTrips, setMatchingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    vehicleType: [],
    timeRange: 'all',
    sortBy: 'best_match'
  });

  const { findMatches } = useSmartTripMatcher();
  const { sendNotification } = useNotificationService();

  const loadMatchingTrips = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) return;

      // Get passenger's trip context
      let currentTrip = location.state?.trip;
      if (!currentTrip) {
        const { data: latestTrip } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', userRecord.id)
          .eq('role', 'passenger')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        currentTrip = latestTrip;
      }

      setPassengerTrip(currentTrip);

      if (!currentTrip) {
        setLoading(false);
        return;
      }

      // Use smart trip matcher for better results
      try {
        const matchResult = await findMatches(currentTrip.id, {
          maxDistance: 5,
          maxTimeDiff: 30
        });

        if (matchResult?.matches) {
          // Convert MatchedTrip[] to Trip[] by adding required fields
          const convertedMatches: Trip[] = matchResult.matches.map(match => ({
            ...match,
            role: 'driver', // All matched trips are driver trips
            users: match.users,
            seats_available: match.seats_available || 1
          }));
          
          setMatchingTrips(convertedMatches);
        } else {
          setMatchingTrips([]);
        }
      } catch (matchError) {
        console.error('Error finding matches:', matchError);
        setMatchingTrips([]);
      }

    } catch (error) {
      console.error('Error loading matching trips:', error);
      toast({
        title: "Error",
        description: "Failed to load matching trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTrip = async (driverTrip: Trip) => {
    if (!passengerTrip) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: passengerTrip.id,
          driver_trip_id: driverTrip.id,
          confirmed: true,
          whatsapp_launched: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎉 Match confirmed!",
        description: "You can now contact the driver via WhatsApp",
      });

      // Send notification to driver
      if (sendNotification) {
        try {
          await sendNotification(driverTrip.user_id, {
            title: "New Booking Confirmed",
            body: `Passenger booked your trip from ${driverTrip.from_location} to ${driverTrip.to_location}`,
            type: 'booking_confirmed'
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }

      loadMatchingTrips();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to confirm match. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMatchingTrips();
  }, [filters]);

  return {
    passengerTrip,
    matchingTrips,
    loading,
    filters,
    setFilters,
    loadMatchingTrips,
    handleMatchTrip
  };
};
