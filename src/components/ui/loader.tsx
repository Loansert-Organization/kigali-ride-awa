
import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading Kigali Ride...</p>
    </div>
  </div>
);
