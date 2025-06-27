
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DriverHome from '@/pages/home/Driver';
import PassengerHome from '@/pages/home/Passenger';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/onboarding/passenger" replace />;
  }

  if (user.role === 'driver') {
    return <DriverHome />;
  }

  return <PassengerHome />;
};

export default Home;
