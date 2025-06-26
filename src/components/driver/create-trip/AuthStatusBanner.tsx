
import React from 'react';

interface AuthStatusBannerProps {
  isAuthenticated: boolean;
}

const AuthStatusBanner: React.FC<AuthStatusBannerProps> = ({ isAuthenticated }) => {
  if (isAuthenticated) return null;

  return (
    <div className="bg-green-50 p-3 rounded-lg text-center">
      <p className="text-sm text-green-800">
        🚗 Fill in your trip details. You'll verify your WhatsApp when posting.
      </p>
    </div>
  );
};

export default AuthStatusBanner;
