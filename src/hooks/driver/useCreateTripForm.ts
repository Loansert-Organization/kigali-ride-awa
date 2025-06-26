
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

interface TripData {
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  vehicleType: string;
  description: string;
  fare: string;
  seatsAvailable: string;
  isNegotiable: boolean;
}

export const useCreateTripForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsAppOTP, setShowWhatsAppOTP] = useState(false);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    vehicleType: 'car',
    description: '',
    fare: '',
    seatsAvailable: '3',
    isNegotiable: false
  });

  const proceedWithTripCreation = async () => {
    if (!tripData.fromLocation || !tripData.toLocation) {
      toast({
        title: "Missing information",
        description: "Please enter both departure and destination locations",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please verify your WhatsApp number to post trips",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userProfile.id,
          from_location: tripData.fromLocation,
          to_location: tripData.toLocation,
          scheduled_time: tripData.scheduledTime,
          vehicle_type: tripData.vehicleType,
          description: tripData.description,
          fare: tripData.fare ? parseFloat(tripData.fare) : null,
          seats_available: parseInt(tripData.seatsAvailable),
          role: 'driver',
          status: 'pending',
          is_negotiable: tripData.isNegotiable
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🚗 Trip posted successfully!",
        description: "Passengers can now see and book your trip",
      });

      navigate('/home/driver');
    } catch (error) {
      console.error('Trip creation error:', error);
      toast({
        title: "Failed to post trip",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = () => {
    // If not authenticated, show WhatsApp login wizard
    if (!isAuthenticated) {
      setShowWhatsAppOTP(true);
      return;
    }
    
    // If authenticated, proceed with trip creation
    proceedWithTripCreation();
  };

  const handleWhatsAppSuccess = async (phoneNumber: string) => {
    setShowWhatsAppOTP(false);
    // After successful WhatsApp login, proceed with trip creation
    setTimeout(() => {
      proceedWithTripCreation();
    }, 500);
  };

  const canCreateTrip = tripData.fromLocation && tripData.toLocation;

  return {
    tripData,
    setTripData,
    isLoading,
    showWhatsAppOTP,
    setShowWhatsAppOTP,
    isAuthenticated,
    userProfile,
    canCreateTrip,
    handleCreateTrip,
    handleWhatsAppSuccess
  };
};
