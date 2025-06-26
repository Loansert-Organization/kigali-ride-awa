
import { useErrorHandler } from './useErrorHandler';
import { useGlobalWhatsAppAuth } from '@/contexts/GlobalWhatsAppAuthContext';

export const useGlobalErrorHandler = () => {
  const { showWhatsAppLogin } = useGlobalWhatsAppAuth();
  
  return useErrorHandler({
    onWhatsAppLogin: showWhatsAppLogin
  });
};
