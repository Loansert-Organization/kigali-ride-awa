
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PassengerRequest {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  description?: string;
}

export const usePassengerRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadPassengerRequests();
    
    const interval = setInterval(loadPassengerRequests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Fallback to Kigali center
          setDriverLocation({ lat: -1.9441, lng: 30.0619 });
        }
      );
    }
  };

  const loadPassengerRequests = async () => {
    try {
      if (!driverLocation) return;

      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(20);

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading passenger requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // TODO: Implement booking creation via EdgeFunctionService
      toast({
        title: "Request Accepted",
        description: "Passenger will be notified of your acceptance"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
    }
  };

  const handleContactPassenger = (request: PassengerRequest) => {
    // TODO: Integrate with WhatsApp modal
    toast({
      title: "Contacting Passenger",
      description: "Opening WhatsApp..."
    });
  };

  const handleBackToDashboard = () => {
    navigate('/driver');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return {
    requests,
    isLoading,
    driverLocation,
    handleAcceptRequest,
    handleContactPassenger,
    handleBackToDashboard,
    handleGoBack
  };
};
