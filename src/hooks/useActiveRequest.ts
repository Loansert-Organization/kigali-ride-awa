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

  const fetchActiveRequest = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchActiveRequest();
  }, [fetchActiveRequest]);

  // Poll for matches when there's an active request
  useEffect(() => {
    if (!activeRequest || activeRequest.status !== 'pending') {
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

  // Listen for real-time updates on trips using the custom hook
  useEffect(() => {
    if (!user || user.id.startsWith('local-')) return;

    const channel = supabase
      .channel(`trips_updates_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Trip update:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedTrip = payload.new as PassengerTrip;
            
            // Update active request if it's the same trip and it's a passenger trip
            if (activeRequest?.id === updatedTrip.id && updatedTrip.role === 'passenger') {
              setActiveRequest(updatedTrip);
            }
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newTrip = payload.new as PassengerTrip;
            
            // Set as active request if it's a new passenger trip
            if (newTrip.role === 'passenger' && newTrip.status === 'pending') {
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

  // Listen for real-time updates on bookings
  useEffect(() => {
    if (!activeRequest || user?.id.startsWith('local-')) return;

    const channel = supabase
      .channel(`bookings_updates_${activeRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `passenger_trip_id=eq.${activeRequest.id}`,
        },
        (payload: any) => {
          console.log('Booking update:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            // New booking created - refresh matches
            const pollForMatches = async () => {
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
                console.error('Error refreshing matches after booking update:', error);
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
  }, [activeRequest, user]);

  const clearRequest = async () => {
    if (!activeRequest) return;

    try {
      // Update trip status to cancelled
      const { error } = await supabase
        .from('trips')
        .update({ status: 'cancelled' })
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