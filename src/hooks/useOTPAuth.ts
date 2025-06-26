
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useOTPAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digits
    let clean = phoneNumber.replace(/\D/g, '');
    
    // Handle Rwanda numbers
    if (clean.startsWith('0')) {
      clean = '250' + clean.substring(1);
    }
    if (!clean.startsWith('250')) {
      clean = '250' + clean;
    }
    
    return '+' + clean;
  };

  const sendOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('Sending OTP to:', formattedPhone);

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send OTP');
      }

      if (data?.success) {
        toast({
          title: "📱 Code sent!",
          description: "Check your WhatsApp for the 6-digit verification code",
        });
        return { success: true, phone: formattedPhone };
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
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
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('Verifying OTP for:', formattedPhone, 'with code:', otpCode);

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: formattedPhone,
          code: otpCode
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Verification failed');
      }

      if (data?.success && data?.user) {
        toast({
          title: "🎉 Phone verified!",
          description: "Welcome to Kigali Ride!",
        });

        // Store user data in localStorage for session management
        localStorage.setItem('whatsapp_auth_user', JSON.stringify(data.user));
        localStorage.setItem('whatsapp_phone', formattedPhone);
        
        return { 
          success: true, 
          user: data.user
        };
      } else {
        throw new Error(data?.error || 'Verification failed');
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
