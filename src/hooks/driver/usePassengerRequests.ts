
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface PassengerRequest {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare?: number;
  is_negotiable: boolean;
  seats_available: number;
  description?: string;
  status: string;
  created_at: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
}

export const usePassengerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPassengerRequests = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get passenger requests - RLS will ensure only pending passenger trips are visible
      const { data, error: requestsError } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error loading passenger requests:', requestsError);
        setError('Failed to load passenger requests');
        return;
      }

      setRequests(data || []);
    } catch (err) {
      console.error('Error in loadPassengerRequests:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!user) return;

    try {
      // Get the current user's profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userProfile) {
        throw new Error('User profile not found');
      }

      // Get the driver's current trip (if any)
      const { data: driverTrip, error: driverTripError } = await supabase
        .from('trips')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('role', 'driver')
        .eq('status', 'pending')
        .single();

      if (driverTripError && driverTripError.code !== 'PGRST116') {
        throw driverTripError;
      }

      // Create a booking between the passenger request and driver trip
      if (driverTrip) {
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            passenger_trip_id: requestId,
            driver_trip_id: driverTrip.id,
            confirmed: false
          });

        if (bookingError) throw bookingError;
      }

      // Refresh the requests list
      await loadPassengerRequests();
      
      return true;
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept request');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadPassengerRequests();
    }
  }, [user]);

  return {
    requests,
    isLoading,
    error,
    acceptRequest,
    refetch: loadPassengerRequests
  };
};
