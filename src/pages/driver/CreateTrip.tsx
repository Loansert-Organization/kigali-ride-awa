
import React from 'react';
import { WhatsAppOTPFlow } from '@/components/auth/WhatsAppOTPFlow';
import CreateTripHeader from '@/components/driver/create-trip/CreateTripHeader';
import AuthStatusBanner from '@/components/driver/create-trip/AuthStatusBanner';
import TripRouteCard from '@/components/driver/create-trip/TripRouteCard';
import TripDetailsCard from '@/components/driver/create-trip/TripDetailsCard';
import CreateTripButton from '@/components/driver/create-trip/CreateTripButton';
import ValidationMessage from '@/components/driver/create-trip/ValidationMessage';
import HelpText from '@/components/driver/create-trip/HelpText';
import { useCreateTripForm } from '@/hooks/driver/useCreateTripForm';

const CreateTrip = () => {
  const {
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
  } = useCreateTripForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <CreateTripHeader />

      <div className="p-4 max-w-md mx-auto space-y-4">
        <AuthStatusBanner isAuthenticated={isAuthenticated} />

        <TripRouteCard
          fromLocation={tripData.fromLocation}
          toLocation={tripData.toLocation}
          onUpdate={(updates) => setTripData(prev => ({ ...prev, ...updates }))}
        />

        <TripDetailsCard
          scheduledTime={tripData.scheduledTime}
          vehicleType={tripData.vehicleType}
          seatsAvailable={parseInt(tripData.seatsAvailable) || 1}
          fare={tripData.fare}
          description={tripData.description}
          isNegotiable={tripData.isNegotiable}
          onUpdate={(updates) => setTripData(prev => ({ ...prev, ...updates }))}
        />

        <CreateTripButton
          onCreateTrip={handleCreateTrip}
          canCreateTrip={canCreateTrip}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />

        <ValidationMessage
          canCreateTrip={canCreateTrip}
          fromLocation={tripData.fromLocation}
          toLocation={tripData.toLocation}
        />

        <HelpText />
      </div>

      <WhatsAppOTPFlow
        isOpen={showWhatsAppOTP}
        onClose={() => setShowWhatsAppOTP(false)}
        onSuccess={handleWhatsAppSuccess}
        userProfile={userProfile}
      />
    </div>
  );
};

export default CreateTrip;
