
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { EdgeFunctionService } from '@/services/EdgeFunctionService';

export const usePassengerRequests = (
  driverLocation?: { lat: number; lng: number },
  vehicleType: string = 'car',
  isOnline: boolean = false
) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadPassengerRequests = async () => {
    if (!isOnline || !driverLocation) {
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      // Get nearby passenger trips using edge function
      const data = await EdgeFunctionService.getNearbyOpenTrips(
        driverLocation.lat,
        driverLocation.lng,
        5, // 5km radius
        vehicleType,
        10 // limit to 10 requests
      );

      // Filter for passenger trips only
      const passengerRequests = data.trips?.filter((trip: any) => 
        trip.role === 'passenger' && trip.status === 'pending'
      ) || [];

      setRequests(passengerRequests);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading passenger requests:', error);
      toast({
        title: "Error",
        description: "Failed to load passenger requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (tripId: string) => {
    try {
      // Create booking between driver and passenger
      const result = await EdgeFunctionService.matchPassengerDriver(
        'create_booking',
        tripId
      );

      if (result.success) {
        toast({
          title: "Request Accepted!",
          description: "Opening WhatsApp to coordinate pickup",
        });

        // Remove the accepted request from the list
        setRequests(prev => prev.filter(req => req.id !== tripId));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppContact = async (trip: any) => {
    try {
      const result = await EdgeFunctionService.sendWhatsAppInvite(
        '+250123456789', // This would be the actual passenger's phone
        'booking_request',
        trip,
        undefined,
        'en'
      );
      
      if (result.whatsapp_url) {
        window.open(result.whatsapp_url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (isOnline) {
      loadPassengerRequests();
      const interval = setInterval(loadPassengerRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isOnline, driverLocation, vehicleType]);

  return {
    requests,
    loading,
    lastRefresh,
    loadPassengerRequests,
    handleAcceptRequest,
    handleWhatsAppContact
  };
};
