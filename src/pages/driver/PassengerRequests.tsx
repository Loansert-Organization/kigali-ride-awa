
import React from 'react';
import PassengerRequestsHeader from '@/components/driver/PassengerRequestsHeader';
import PassengerRequestsList from '@/components/driver/PassengerRequestsList';
import PassengerRequestsEmptyState from '@/components/driver/PassengerRequestsEmptyState';
import PassengerRequestsLoading from '@/components/driver/PassengerRequestsLoading';
import { usePassengerRequestsPage } from '@/hooks/driver/usePassengerRequestsPage';

const PassengerRequests = () => {
  const {
    requests,
    isLoading,
    driverLocation,
    handleAcceptRequest,
    handleContactPassenger,
    handleBackToDashboard,
    handleGoBack
  } = usePassengerRequestsPage();

  if (isLoading) {
    return <PassengerRequestsLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerRequestsHeader
        requestCount={requests.length}
        onBack={handleGoBack}
      />

      <div className="p-4">
        {requests.length === 0 ? (
          <PassengerRequestsEmptyState
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <PassengerRequestsList
            requests={requests}
            driverLocation={driverLocation}
            onAcceptRequest={handleAcceptRequest}
            onContactPassenger={handleContactPassenger}
          />
        )}
      </div>
    </div>
  );
};

export default PassengerRequests;
