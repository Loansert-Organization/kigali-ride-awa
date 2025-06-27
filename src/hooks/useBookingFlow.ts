
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useWhatsAppAuth } from '@/contexts/WhatsAppAuthContext';
import { useErrorHandler } from './useErrorHandler';
import { useNavigate } from 'react-router-dom';

export interface TripData {
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  vehicleType: string;
  description: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  fare?: number;
  seatsAvailable?: number;
}

interface TripDetails {
  from_location: string;
  to_location: string;
  [key: string]: unknown;
}

interface BookingFlowService {
  createBooking: (passengerTripId: string, driverTripId: string) => Promise<boolean>;
  createPassengerTrip: (tripData: TripData) => Promise<boolean>;
  confirmBooking: (bookingId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  launchWhatsApp: (phoneNumber?: string, tripDetails?: TripDetails) => void;
  isLoading: boolean;
}

export const useBookingFlow = (): BookingFlowService => {
  const { userProfile, isAuthenticated } = useWhatsAppAuth();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createPassengerTrip = useCallback(async (tripData: TripData): Promise<boolean> => {
    if (!isAuthenticated || !userProfile) {
      handleError(new Error('WhatsApp authentication required'), 'BookingFlow.createPassengerTrip');
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userProfile.id,
          from_location: tripData.fromLocation,
          to_location: tripData.toLocation,
          from_lat: tripData.fromLat,
          from_lng: tripData.fromLng,
          to_lat: tripData.toLat,
          to_lng: tripData.toLng,
          scheduled_time: tripData.scheduledTime,
          vehicle_type: tripData.vehicleType,
          description: tripData.description,
          role: 'passenger',
          status: 'pending',
          seats_available: 1
        })
        .select()
        .single();

      if (error) throw error;

      await handleSuccess(
        'Trip request created successfully! Looking for available drivers...',
        'BookingFlow.createPassengerTrip',
        { tripId: data.id }
      );

      // Navigate to matches page
      navigate(`/ride-matches?tripId=${data.id}`);
      return true;
    } catch (error) {
      await handleError(error, 'BookingFlow.createPassengerTrip', tripData);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isAuthenticated, handleError, handleSuccess, navigate]);

  const createBooking = useCallback(async (
    passengerTripId: string, 
    driverTripId: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !userProfile) {
      handleError(new Error('WhatsApp authentication required'), 'BookingFlow.createBooking');
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: passengerTripId,
          driver_trip_id: driverTripId,
          confirmed: false
        })
        .select()
        .single();

      if (error) throw error;

      await handleSuccess(
        'Booking request sent successfully!',
        'BookingFlow.createBooking',
        { bookingId: data.id }
      );

      return true;
    } catch (error) {
      await handleError(error, 'BookingFlow.createBooking', {
        passengerTripId,
        driverTripId
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isAuthenticated, handleError, handleSuccess]);

  const confirmBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    if (!isAuthenticated || !userProfile) {
      handleError(new Error('WhatsApp authentication required'), 'BookingFlow.confirmBooking');
      return false;
    }

    setIsLoading(true);
    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ confirmed: true })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          passenger_trip_id,
          driver_trip_id,
          trips!inner(*)
        `)
        .eq('id', bookingId)
        .single();

      if (booking) {
        await supabase
          .from('trips')
          .update({ status: 'matched' })
          .in('id', [booking.passenger_trip_id, booking.driver_trip_id]);
      }

      await handleSuccess(
        'Booking confirmed! You can now coordinate via WhatsApp.',
        'BookingFlow.confirmBooking',
        { bookingId }
      );

      return true;
    } catch (error) {
      await handleError(error, 'BookingFlow.confirmBooking', { bookingId });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isAuthenticated, handleError, handleSuccess]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      await handleSuccess(
        'Booking cancelled successfully',
        'BookingFlow.cancelBooking',
        { bookingId }
      );

      return true;
    } catch (error) {
      await handleError(error, 'BookingFlow.cancelBooking', { bookingId });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  const launchWhatsApp = useCallback((phoneNumber?: string, tripDetails?: TripDetails) => {
    try {
      const defaultMessage = tripDetails 
        ? `Hi! I'm contacting you about the ride from ${tripDetails.from_location} to ${tripDetails.to_location}. Let's coordinate the details!`
        : "Hi! I'm contacting you about our Kigali Ride booking. Let's coordinate the details!";

      const encodedMessage = encodeURIComponent(defaultMessage);
      
      let whatsappUrl: string;
      if (phoneNumber) {
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('250') ? cleanNumber : `250${cleanNumber}`;
        whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      } else {
        whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      }

      window.open(whatsappUrl, '_blank');
      
      handleSuccess(
        'WhatsApp opened successfully',
        'BookingFlow.launchWhatsApp',
        { phoneNumber, tripDetails }
      );
    } catch (error) {
      handleError(error, 'BookingFlow.launchWhatsApp', { phoneNumber });
      
      const fallbackMessage = tripDetails 
        ? `Hi! Ride: ${tripDetails.from_location} to ${tripDetails.to_location}`
        : "Hi! Kigali Ride booking - let's coordinate!";
      
      navigator.clipboard?.writeText(fallbackMessage).catch(() => {});
    }
  }, [handleError, handleSuccess]);

  return {
    createBooking,
    createPassengerTrip,
    confirmBooking,
    cancelBooking,
    launchWhatsApp,
    isLoading
  };
};
