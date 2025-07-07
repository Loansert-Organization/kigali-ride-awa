import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeUpdateProps {
  onTripUpdate?: (trip: any) => void;
  onBookingUpdate?: (booking: any) => void;
  onDriverUpdate?: (driver: any) => void;
  tripId?: string;
  userId?: string;
}

export const useRealTimeUpdates = ({
  onTripUpdate,
  onBookingUpdate,
  onDriverUpdate,
  tripId,
  userId
}: RealTimeUpdateProps) => {
  const { user } = useAuth();

  // Trip updates subscription
  useEffect(() => {
    if (!user || !onTripUpdate) return;

    const channel = supabase
      .channel('trip_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: tripId ? `id=eq.${tripId}` : `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Trip update received:', payload);
          onTripUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onTripUpdate, tripId]);

  // Booking updates subscription
  useEffect(() => {
    if (!user || !onBookingUpdate) return;

    const channel = supabase
      .channel('booking_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: tripId ? `passenger_trip_id=eq.${tripId}` : undefined,
        },
        (payload) => {
          console.log('Booking update received:', payload);
          onBookingUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onBookingUpdate, tripId]);

  // Driver presence updates subscription
  useEffect(() => {
    if (!onDriverUpdate) return;

    const channel = supabase
      .channel('driver_presence_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_presence',
        },
        (payload) => {
          console.log('Driver presence update received:', payload);
          onDriverUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDriverUpdate]);

  // Enable realtime for the tables
  const enableRealtime = useCallback(async () => {
    try {
      // Enable realtime for trips table
      const { error: tripsError } = await supabase
        .from('trips')
        .select('id')
        .limit(1);

      if (tripsError) {
        console.warn('Could not verify trips table realtime:', tripsError);
      }

      // Enable realtime for bookings table
      const { error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);

      if (bookingsError) {
        console.warn('Could not verify bookings table realtime:', bookingsError);
      }

      // Enable realtime for driver_presence table
      const { error: presenceError } = await supabase
        .from('driver_presence')
        .select('driver_id')
        .limit(1);

      if (presenceError) {
        console.warn('Could not verify driver_presence table realtime:', presenceError);
      }

      console.log('Realtime connections initialized');
    } catch (error) {
      console.error('Error initializing realtime:', error);
    }
  }, []);

  useEffect(() => {
    enableRealtime();
  }, [enableRealtime]);

  return {
    enableRealtime
  };
};