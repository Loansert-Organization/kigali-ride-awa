import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { PassengerTrip, DriverTrip, TripStatus } from '@/types';

export const useActiveRequest = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<PassengerTrip | null>(null);
  const [matches, setMatches] = useState<DriverTrip[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

    const fetchActiveRequest = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Skip database queries for local sessions
      if (user.id.startsWith('local-')) {
        setLoading(false);
        setActiveRequest(null);
        return;
      }

      try {
        setLoading(true);
        // Use unified trips table with role filter
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'passenger')
          .in('status', ['pending', 'matched'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching active request:', error);
          setError(error);
        } else {
          setActiveRequest(data);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchActiveRequest();
  }, [fetchActiveRequest]);

  // Poll for matches when there's an active request
  useEffect(() => {
    if (!activeRequest || activeRequest.status !== TripStatus.REQUESTED) {
      setMatches([]);
      return;
    }

    const pollForMatches = async () => {
      setIsLoadingMatches(true);
      try {
        const response = await apiClient.request('match-passenger-driver', {
          body: { 
            action: 'find_matches',
            passengerTripId: activeRequest.id
          }
        });
        
        if (response.success && response.data?.matches) {
          setMatches(response.data.matches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    // Initial fetch
    pollForMatches();

    // Poll every 10 seconds for new matches
    const interval = setInterval(pollForMatches, 10000);

    return () => clearInterval(interval);
  }, [activeRequest]);

  // Listen for real-time updates on passenger trips
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('passenger_trips_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'passenger_trips',
          filter: `passenger_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Passenger trip update:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedTrip = payload.new as PassengerTrip;
            
            // Update active request if it's the same trip
            if (activeRequest?.id === updatedTrip.id) {
              setActiveRequest(updatedTrip);
            }
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newTrip = payload.new as PassengerTrip;
            
            // Set as active request if it's a new requested trip
            if (newTrip.status === TripStatus.REQUESTED) {
              setActiveRequest(newTrip);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeRequest]);

  // Listen for real-time updates on trip matches
  useEffect(() => {
    if (!activeRequest) return;

    const channel = supabase
      .channel('trip_matches_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_matches',
          filter: `passenger_trip_id=eq.${activeRequest.id}`,
        },
        (payload: any) => {
          console.log('Trip match update:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            // New match found - refresh matches
            const pollForMatches = async () => {
              const response = await apiClient.trips.getMatchesForRequest(activeRequest.id);
              if (response.success && response.data) {
                setMatches(response.data);
              }
            };
            pollForMatches();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequest]);

  const clearRequest = async () => {
    if (!activeRequest) return;

    try {
      // Update trip status to cancelled
      const { error } = await supabase
        .from('passenger_trips')
        .update({ status: TripStatus.CANCELLED })
        .eq('id', activeRequest.id);

      if (error) {
        console.error('Error cancelling request:', error);
        return;
      }

      setActiveRequest(null);
      setMatches([]);
    } catch (error) {
      console.error('Error clearing request:', error);
    }
  };

  const acceptMatch = async (driverTripId: string) => {
    if (!activeRequest) return;

    try {
      const response = await apiClient.request('match-passenger-driver', {
        body: { 
          action: 'create_booking',
          passengerTripId: activeRequest.id,
          driverTripId
        }
      });

      if (response.success && response.data?.booking) {
        return response.data.booking;
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  return {
    activeRequest,
    matches,
    isLoadingMatches,
    clearRequest,
    acceptMatch,
    loading,
    error,
    refetch: fetchActiveRequest,
  };
}; 