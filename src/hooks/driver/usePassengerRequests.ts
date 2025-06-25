
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";

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
  suggested_fare?: number;
  user?: {
    promo_code: string;
  };
}

export const usePassengerRequests = (
  driverLocation?: { lat: number; lng: number },
  vehicleType?: string,
  isOnline?: boolean
) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const loadPassengerRequests = async () => {
    if (!user || !isOnline) {
      setRequests([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get passenger requests with user info - RLS will ensure only pending passenger trips are visible
      const { data, error: requestsError } = await supabase
        .from('trips')
        .select(`
          *,
          users!inner(
            promo_code
          )
        `)
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error loading passenger requests:', requestsError);
        setError('Failed to load passenger requests');
        return;
      }

      // Calculate suggested fare and distance if driver location is available
      const processedRequests = (data || []).map(request => {
        let suggested_fare;
        
        // Simple fare calculation based on distance (if coordinates available)
        if (driverLocation && request.from_lat && request.from_lng) {
          const distance = calculateDistance(
            driverLocation.lat,
            driverLocation.lng,
            request.from_lat,
            request.from_lng
          );
          // Base fare + distance-based pricing (simplified)
          suggested_fare = Math.round(1000 + (distance * 500)); // RWF
        }

        return {
          ...request,
          suggested_fare,
          user: request.users
        };
      });

      setRequests(processedRequests);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error in loadPassengerRequests:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return false;

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

      // Update the passenger trip status
      await supabase
        .from('trips')
        .update({ status: 'matched' })
        .eq('id', requestId);

      toast({
        title: "Request accepted",
        description: "You can now contact the passenger via WhatsApp",
      });

      // Refresh the requests list
      await loadPassengerRequests();
      
      return true;
    } catch (err) {
      console.error('Error accepting request:', err);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleWhatsAppContact = (trip: PassengerRequest) => {
    const message = `Hi! I'm a driver on Kigali Ride. I can help with your trip from ${trip.from_location} to ${trip.to_location}. When would you like to travel?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "Continue the conversation to coordinate your trip",
    });
  };

  // Simple distance calculation (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (user && isOnline) {
      loadPassengerRequests();
      // Set up periodic refresh every 30 seconds when online
      const interval = setInterval(loadPassengerRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isOnline, driverLocation]);

  return {
    requests,
    loading,
    lastRefresh,
    loadPassengerRequests,
    handleAcceptRequest,
    handleWhatsAppContact,
    // Legacy compatibility
    isLoading: loading,
    error: error || '',
    acceptRequest: handleAcceptRequest,
    refetch: loadPassengerRequests
  };
};
