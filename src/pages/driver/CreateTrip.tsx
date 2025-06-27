import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import RouteInputBlock from "@/components/trip/RouteInputBlock";
import VehicleDetailsBlock from "@/components/trip/VehicleDetailsBlock";
import FareInputBlock from "@/components/trip/FareInputBlock";
import TripConfirmationBlock from "@/components/trip/TripConfirmationBlock";
import CreateTripProgressIndicator from "@/components/trip/CreateTripProgressIndicator";
import { useCreateTripForm } from "@/hooks/driver/useCreateTripForm";
import { TripData, DriverProfile } from '@/types/api';

interface TripFormData {
  fromLocation: string;
  toLocation: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  scheduledTime: string;
  vehicleType: string;
  seatsAvailable: number;
  description: string;
  fare: number | null;
  isNegotiable: boolean;
  broadcastToNearby: boolean;
}

const CreateTrip = () => {
  const {
    currentStep,
    tripData,
    driverProfile,
    isSubmitting,
    updateTripData,
    canProceedToNextStep,
    handleNext,
    handleBack,
    handleSubmit
  } = useCreateTrip();

  const handleVehicleUpdate = (updates: Partial<TripFormData>) => {
    updateTripData(updates);
  };

  const handleFareUpdate = (updates: Partial<TripFormData>) => {
    updateTripData(updates);
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
          />
        );
      case 2:
        return (
          <>
            <VehicleDetailsBlock
              vehicleType={tripData.vehicleType}
              seatsAvailable={tripData.seatsAvailable}
              description={tripData.description}
              onUpdate={handleVehicleUpdate}
              driverProfile={driverProfile}
            />
            <FareInputBlock
              fare={tripData.fare}
              isNegotiable={tripData.isNegotiable}
              onUpdate={handleFareUpdate}
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
          <div className="w-10" />
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
