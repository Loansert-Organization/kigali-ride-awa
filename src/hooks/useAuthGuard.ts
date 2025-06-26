
import { useState } from 'react';
import { useWhatsAppAuth } from '@/contexts/WhatsAppAuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated } = useWhatsAppAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = (callback?: () => void) => {
    if (isAuthenticated) {
      callback?.();
      return true;
    } else {
      setShowLoginModal(true);
      return false;
    }
  };

  const handleLoginSuccess = (callback?: () => void) => {
    setShowLoginModal(false);
    callback?.();
  };

  return {
    requireAuth,
    showLoginModal,
    setShowLoginModal,
    handleLoginSuccess,
    isAuthenticated
  };
};
