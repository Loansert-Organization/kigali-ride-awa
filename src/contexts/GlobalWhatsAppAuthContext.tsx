
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WhatsAppLoginModal } from '@/components/auth/WhatsAppLoginModal';

interface GlobalWhatsAppAuthContextType {
  showWhatsAppLogin: () => void;
  hideWhatsAppLogin: () => void;
  isModalOpen: boolean;
}

const GlobalWhatsAppAuthContext = createContext<GlobalWhatsAppAuthContextType | undefined>(undefined);

interface GlobalWhatsAppAuthProviderProps {
  children: ReactNode;
}

export const GlobalWhatsAppAuthProvider: React.FC<GlobalWhatsAppAuthProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showWhatsAppLogin = () => {
    setIsModalOpen(true);
  };

  const hideWhatsAppLogin = () => {
    setIsModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    // The modal will handle the success logic internally
  };

  return (
    <GlobalWhatsAppAuthContext.Provider 
      value={{ 
        showWhatsAppLogin, 
        hideWhatsAppLogin, 
        isModalOpen 
      }}
    >
      {children}
      <WhatsAppLoginModal
        isOpen={isModalOpen}
        onClose={hideWhatsAppLogin}
        onSuccess={handleAuthSuccess}
        title="Authentication Required"
        description="Please verify your WhatsApp to continue using this feature"
      />
    </GlobalWhatsAppAuthContext.Provider>
  );
};

export const useGlobalWhatsAppAuth = (): GlobalWhatsAppAuthContextType => {
  const context = useContext(GlobalWhatsAppAuthContext);
  if (!context) {
    throw new Error('useGlobalWhatsAppAuth must be used within a GlobalWhatsAppAuthProvider');
  }
  return context;
};
