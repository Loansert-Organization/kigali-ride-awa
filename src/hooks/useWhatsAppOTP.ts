
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
        
        // Provide specific error messages based on the error
        let errorMessage = 'Failed to send verification code. Please try again.';
        
        if (error.message?.includes('credentials not configured')) {
          errorMessage = 'WhatsApp service is temporarily unavailable. Please contact support.';
        } else if (error.message?.includes('Invalid phone number')) {
          errorMessage = 'Please enter a valid Rwandan phone number (e.g., +250788123456)';
        } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        } else if (error.message?.includes('template')) {
          errorMessage = 'Message template error. Our team has been notified.';
        }
        
        toast({
          title: "Failed to send verification code",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { success: false, error: error.message };
      }

      if (data?.success) {
        const method = data.method === 'text_fallback' ? 'text message' : 'template';
        toast({
          title: "📱 Verification code sent!",
          description: `Check your WhatsApp for the 6-digit code (sent via ${method})`,
        });
        return { success: true, messageId: data.messageId, method: data.method };
      } else {
        console.error('WhatsApp OTP send failed:', data);
        
        toast({
          title: "Failed to send verification code",
          description: data?.error || 'Unknown error occurred. Please try again or contact support.',
          variant: "destructive"
        });
        
        return { success: false, error: data?.error || 'Unknown error' };
      }
    } catch (error: any) {
      console.error('WhatsApp OTP send error:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.message?.includes('fetch')) {
        errorMessage = 'Connection failed. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      toast({
        title: "Connection Error",
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
        
        toast({
          title: "Verification failed",
          description: error.message || "Please try again or contact support.",
          variant: "destructive"
        });
        
        return { success: false, error: error.message };
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
        let errorMessage = "Invalid or expired verification code";
        
        if (data?.expired) {
          errorMessage = "Verification code has expired. Please request a new one.";
        } else if (data?.invalid) {
          errorMessage = "Invalid verification code. Please check and try again.";
        } else if (data?.message) {
          errorMessage = data.message;
        }
        
        toast({
          title: "Verification failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { success: false, error: data?.message || 'Verification failed' };
      }
    } catch (error: any) {
      console.error('WhatsApp OTP verification error:', error);
      
      let errorMessage = "Network error during verification. Please try again.";
      
      if (error.message?.includes('fetch')) {
        errorMessage = "Connection failed. Please check your internet connection.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Verification timed out. Please try again.";
      }
      
      toast({
        title: "Connection Error",
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
