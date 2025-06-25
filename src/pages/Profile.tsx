
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import DriverProfile from "./profile/Driver";
import PassengerProfile from "./profile/Passenger";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select your role first</p>
          <a href="/" className="text-purple-600 underline">Go to Home</a>
        </div>
      </div>
    );
  }

  // Route to appropriate profile based on role
  if (userProfile.role === 'driver') {
    return <DriverProfile />;
  }

  return <PassengerProfile />;
};

export default Profile;
