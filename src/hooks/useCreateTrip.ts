
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EdgeFunctionService, CreateTripRequest } from "@/services/EdgeFunctionService";

interface TripData {
  fromLocation: string;
  fromLat?: number;
  fromLng?: number;
  toLocation: string;
  toLat?: number;
  toLng?: number;
  scheduledTime: string;
  vehicleType: string;
  seatsAvailable: number;
  fare: number | null;
  isNegotiable: boolean;
  description: string;
  broadcastToNearby: boolean;
}

export const useCreateTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date().toISOString().slice(0, 16),
    vehicleType: '',
    seatsAvailable: 1,
    fare: null,
    isNegotiable: true,
    description: '',
    broadcastToNearby: true
  });

  // Handle quick start from driver home
  useEffect(() => {
    if (location.state?.quickStart && location.state?.currentLocation) {
      setTripData(prev => ({
        ...prev,
        fromLat: location.state.currentLocation.lat,
        fromLng: location.state.currentLocation.lng,
        fromLocation: 'Current Location'
      }));
    }
  }, [location.state]);

  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data: profile } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', userRecord.id)
            .single();
          
          if (profile) {
            setDriverProfile(profile);
            setTripData(prev => ({
              ...prev,
              vehicleType: profile.vehicle_type || ''
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  const updateTripData = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return tripData.fromLocation && tripData.toLocation && tripData.scheduledTime;
      case 2:
        return tripData.vehicleType && tripData.seatsAvailable > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) {
        throw new Error('User profile not found');
      }

      // Validate scheduled time is not in the past
      const scheduledDate = new Date(tripData.scheduledTime);
      if (scheduledDate < new Date()) {
        toast({
          title: "Invalid Time",
          description: "Trip time cannot be in the past",
          variant: "destructive"
        });
        return;
      }

      // Convert to CreateTripRequest format with proper typing
      const tripPayload: CreateTripRequest = {
        user_id: userRecord.id,
        role: 'driver' as const,
        from_location: tripData.fromLocation,
        from_lat: tripData.fromLat,
        from_lng: tripData.fromLng,
        to_location: tripData.toLocation,
        to_lat: tripData.toLat,
        to_lng: tripData.toLng,
        vehicle_type: tripData.vehicleType,
        scheduled_time: tripData.scheduledTime,
        seats_available: tripData.seatsAvailable,
        fare: tripData.fare,
        is_negotiable: tripData.isNegotiable,
        description: tripData.description || undefined
      };

      const result = await EdgeFunctionService.createTrip(tripPayload);

      if (result.success) {
        // Confetti effect for first trip
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

        toast({
          title: "🎉 Trip Created!",
          description: "Your trip is now visible to passengers nearby",
        });

        // Broadcast to nearby passengers if enabled
        if (tripData.broadcastToNearby) {
          try {
            console.log('Broadcasting trip to nearby passengers...');
          } catch (error) {
            console.warn('Failed to broadcast trip:', error);
          }
        }

        navigate('/home/driver');
      } else {
        throw new Error(result.error || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    tripData,
    driverProfile,
    isSubmitting,
    updateTripData,
    canProceedToNextStep,
    handleNext,
    handleBack,
    handleSubmit
  };
};
