
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

      console.log('Sending WhatsApp OTP to:', formattedPhone);

      const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
        body: {
          phone_number: formattedPhone,
          user_id: userProfile?.id
        }
      });

      console.log('WhatsApp OTP response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to call WhatsApp service');
      }

      if (data?.success) {
        const method = data.method === 'text_fallback' ? 'text message' : 'template';
        toast({
          title: "📱 WhatsApp OTP sent!",
          description: `Check your WhatsApp for the verification code (sent via ${method})`,
        });
        return { success: true, messageId: data.messageId, method: data.method };
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('WhatsApp OTP send error:', error);
      
      let errorMessage = 'Please check your phone number and try again';
      
      if (error.message?.includes('credentials not configured')) {
        errorMessage = 'WhatsApp service is not configured. Please contact support.';
      } else if (error.message?.includes('Invalid phone number')) {
        errorMessage = 'Please enter a valid Rwandan phone number';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait before trying again.';
      }
      
      toast({
        title: "Failed to send OTP",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: error.message };
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

      console.log('Verifying WhatsApp OTP for:', formattedPhone, 'with code:', otpCode);

      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: {
          phone_number: formattedPhone,
          otp_code: otpCode,
          user_id: userProfile?.id
        }
      });

      console.log('WhatsApp OTP verification response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Verification failed');
      }

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
    } catch (error: any) {
      console.error('WhatsApp OTP verification error:', error);
      
      let errorMessage = "Invalid or expired OTP code";
      
      if (error.message?.includes('expired')) {
        errorMessage = "OTP has expired. Please request a new one.";
      } else if (error.message?.includes('Invalid OTP')) {
        errorMessage = "Invalid OTP code. Please check and try again.";
      } else if (error.message?.includes('No OTP found')) {
        errorMessage = "No OTP found. Please request a new code.";
      }
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: error.message };
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
