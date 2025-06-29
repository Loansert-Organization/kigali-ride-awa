
import React from 'react';
import { UnifiedWhatsAppOTP } from './UnifiedWhatsAppOTP';
import { UserProfile } from '@/types/user';

interface OTPAuthFlowProps {
  onSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
}

export const OTPAuthFlow: React.FC<OTPAuthFlowProps> = ({ onSuccess, onCancel }) => {
  const handleSuccess = () => {
    // Get the stored user data
    const storedUser = localStorage.getItem('whatsapp_auth_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      onSuccess(user);
    }
  };

  return (
    <UnifiedWhatsAppOTP
      onSuccess={handleSuccess}
      onCancel={onCancel}
      className="w-full max-w-md mx-auto"
    />
  );
};
