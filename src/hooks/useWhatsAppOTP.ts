
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useWhatsAppOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile, updateUserProfile } = useAuth();

  const sendWhatsAppOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    
    try {
      // Format phone number for Rwanda (+250)
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
        body: {
          phone_number: formattedPhone,
          user_id: userProfile?.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "📱 WhatsApp OTP sent!",
          description: "Check your WhatsApp for the verification code",
        });
        return { success: true, messageId: data.messageId };
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('WhatsApp OTP send error:', error);
      toast({
        title: "Failed to send OTP",
        description: "Please check your phone number and try again",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWhatsAppOTP = async (phoneNumber: string, otpCode: string) => {
    setIsLoading(true);
    
    try {
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: {
          phone_number: formattedPhone,
          otp_code: otpCode,
          user_id: userProfile?.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update local user profile
        await updateUserProfile({
          phone_number: formattedPhone,
          phone_verified: true,
          auth_method: 'whatsapp'
        });

        toast({
          title: "🎉 Phone verified!",
          description: "Your WhatsApp is now connected to your account",
        });

        return { success: true, phoneNumber: data.phoneNumber };
      } else {
        throw new Error(data?.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('WhatsApp OTP verification error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP code",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendWhatsAppOTP,
    verifyWhatsAppOTP,
    isLoading
  };
};
