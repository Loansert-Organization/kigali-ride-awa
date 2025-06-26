
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from '@/types/user';

export const useOTPAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    
    try {
      // Format phone number for Rwanda (+250)
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      console.log('Sending OTP to:', formattedPhone);

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      console.log('OTP response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send OTP');
      }

      if (data?.success) {
        toast({
          title: "📱 Code sent!",
          description: "Check your WhatsApp for the 6-digit verification code",
        });
        return { success: true, messageId: data.messageId };
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('OTP send error:', error);
      
      toast({
        title: "Failed to send verification code",
        description: error.message || 'Please try again',
        variant: "destructive"
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, otpCode: string) => {
    setIsLoading(true);
    
    try {
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      console.log('Verifying OTP for:', formattedPhone, 'with code:', otpCode);

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: formattedPhone,
          code: otpCode
        }
      });

      console.log('OTP verification response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Verification failed');
      }

      if (data?.success && data?.user) {
        toast({
          title: "🎉 Phone verified!",
          description: "Welcome to Kigali Ride!",
        });

        return { 
          success: true, 
          user: data.user as UserProfile 
        };
      } else {
        let errorMessage = "Invalid or expired verification code";
        
        if (data?.error?.includes('expired')) {
          errorMessage = "Verification code has expired. Please request a new one.";
        } else if (data?.error?.includes('Invalid')) {
          errorMessage = "Invalid verification code. Please check and try again.";
        } else if (data?.error) {
          errorMessage = data.error;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      toast({
        title: "Verification failed",
        description: error.message || 'Please try again',
        variant: "destructive"
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    verifyOTP,
    isLoading
  };
};
