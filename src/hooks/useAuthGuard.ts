
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated } = useAuth();
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
