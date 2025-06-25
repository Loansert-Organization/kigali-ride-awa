import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RouteInputBlock from "@/components/trip/RouteInputBlock";
import DateTimeBlock from "@/components/trip/DateTimeBlock";
import VehicleDetailsBlock from "@/components/trip/VehicleDetailsBlock";
import FareInputBlock from "@/components/trip/FareInputBlock";
import TripConfirmationBlock from "@/components/trip/TripConfirmationBlock";
import CreateTripProgressIndicator from "@/components/trip/CreateTripProgressIndicator";
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

const CreateTrip = () => {
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
        role: 'driver' as const, // Explicitly cast to the required literal type
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
            // This would trigger notifications to nearby passengers
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RouteInputBlock
            fromLocation={tripData.fromLocation}
            toLocation={tripData.toLocation}
            fromLat={tripData.fromLat}
            fromLng={tripData.fromLng}
            toLat={tripData.toLat}
            toLng={tripData.toLng}
            scheduledTime={tripData.scheduledTime}
            onUpdate={updateTripData}
            quickStartLocation={location.state?.currentLocation}
          />
        );
      case 2:
        return (
          <>
            <VehicleDetailsBlock
              vehicleType={tripData.vehicleType}
              seatsAvailable={tripData.seatsAvailable}
              description={tripData.description}
              onUpdate={updateTripData}
              driverProfile={driverProfile}
            />
            <FareInputBlock
              fare={tripData.fare}
              isNegotiable={tripData.isNegotiable}
              onUpdate={updateTripData}
            />
          </>
        );
      case 3:
        return (
          <TripConfirmationBlock
            tripData={tripData}
            broadcastToNearby={tripData.broadcastToNearby}
            onUpdate={updateTripData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">📍 Create Trip</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Progress Indicator */}
      <CreateTripProgressIndicator currentStep={currentStep} />

      {/* Content */}
      <div className="p-4 space-y-6 pb-32">
        {renderStepContent()}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
            >
              {isSubmitting ? 'Creating...' : '📢 Publish Trip'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
