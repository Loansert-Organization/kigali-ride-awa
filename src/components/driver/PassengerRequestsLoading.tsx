
import React from 'react';

const PassengerRequestsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading passenger requests...</p>
      </div>
    </div>
  );
};

export default PassengerRequestsLoading;
