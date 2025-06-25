
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

      // Build query for matching driver trips
      let query = supabase
        .from('trips')
        .select('*')
        .eq('role', 'driver')
        .eq('status', 'pending')
        .gte('scheduled_time', new Date().toISOString());

      // Apply filters
      if (filters.vehicleType.length > 0) {
        query = query.in('vehicle_type', filters.vehicleType);
      }

      if (filters.timeRange !== 'all') {
        const now = new Date();
        let timeLimit = new Date(now);
        
        switch (filters.timeRange) {
          case 'next_30min':
            timeLimit.setMinutes(now.getMinutes() + 30);
            break;
          case 'next_1hour':
            timeLimit.setHours(now.getHours() + 1);
            break;
          case 'today':
            timeLimit.setHours(23, 59, 59);
            break;
        }
        
        query = query.lte('scheduled_time', timeLimit.toISOString());
      }

      const { data: driverTrips, error } = await query;

      if (error) throw error;

      // Sort trips
      const sortedTrips = driverTrips?.sort((a, b) => {
        if (filters.sortBy === 'time') {
          return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
        }
        if (filters.sortBy === 'fare') {
          return (a.fare || 0) - (b.fare || 0);
        }
        return 0;
      }) || [];

      setMatchingTrips(sortedTrips);
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
