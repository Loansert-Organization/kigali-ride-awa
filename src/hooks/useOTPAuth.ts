
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

      if (data === 'sent') {
        toast({
          title: "📱 Code sent!",
          description: "Check your WhatsApp for the 6-digit verification code",
        });
        return { success: true };
      } else {
        throw new Error('Failed to send OTP');
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

      if (data && typeof data === 'object' && data.token) {
        // Store the JWT token and create user session
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.token
        });

        if (signInError) {
          console.error('Session creation error:', signInError);
          throw signInError;
        }

        toast({
          title: "🎉 Phone verified!",
          description: "Welcome to Kigali Ride!",
        });

        return { 
          success: true, 
          user: { phone: formattedPhone, token: data.token }
        };
      } else {
        let errorMessage = "Invalid or expired verification code";
        
        if (data === 'expired') {
          errorMessage = "Verification code has expired. Please request a new one.";
        } else if (data === 'wrong') {
          errorMessage = "Invalid verification code. Please check and try again.";
        } else if (data === 'no-code') {
          errorMessage = "No verification code found. Please request a new one.";
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
