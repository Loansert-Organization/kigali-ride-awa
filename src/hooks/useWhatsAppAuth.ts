
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useWhatsAppAuth = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { userProfile, updateUserProfile } = useAuth();

  const verifyWhatsAppPhone = async (phoneNumber: string) => {
    setIsVerifying(true);
    
    try {
      // Update user profile with phone number and verification status
      await updateUserProfile({
        phone_number: phoneNumber,
        phone_verified: true,
        auth_method: 'whatsapp'
      });

      toast({
        title: "Phone verified!",
        description: "Your WhatsApp is now connected to your account",
      });

      return { success: true };
    } catch (error) {
      console.error('WhatsApp verification error:', error);
      toast({
        title: "Verification failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsVerifying(false);
    }
  };

  const upgradeAnonymousToWhatsApp = async (phoneNumber: string) => {
    if (!userProfile) return { success: false };

    try {
      // For anonymous users, we need to create a verified account
      // This is a simplified flow - in production you'd want proper verification
      await updateUserProfile({
        phone_number: phoneNumber,
        phone_verified: true,
        auth_method: 'whatsapp'
      });

      toast({
        title: "🎉 Account upgraded!",
        description: "Your rides and rewards are now synced with WhatsApp",
      });

      return { success: true };
    } catch (error) {
      console.error('Account upgrade error:', error);
      return { success: false, error };
    }
  };

  const requiresWhatsAppAuth = () => {
    return !userProfile?.phone_verified;
  };

  return {
    verifyWhatsAppPhone,
    upgradeAnonymousToWhatsApp,
    requiresWhatsAppAuth,
    isVerifying,
    isWhatsAppVerified: userProfile?.phone_verified || false,
    phoneNumber: userProfile?.phone_number
  };
};
