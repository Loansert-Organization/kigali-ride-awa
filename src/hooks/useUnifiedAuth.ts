
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useUnifiedAuth = () => {
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
      
      let errorMessage = "Failed to send verification code. Please try again.";
      
      if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many attempts, try later";
      }
      
      toast({
        title: "Failed to send verification code",
        description: errorMessage,
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
      
      let errorMessage = "Verification failed. Please try again.";
      
      if (error.message?.includes('expired') || error.message?.includes('OTP expired')) {
        errorMessage = "Code expired";
      } else if (error.message?.includes('Invalid') || error.message?.includes('invalid')) {
        errorMessage = "Invalid code";
      } else if (error.message?.includes('attempts') || error.message?.includes('rate limit')) {
        errorMessage = "Too many attempts, try later";
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

  const isAuthenticated = () => {
    const storedUser = localStorage.getItem('whatsapp_auth_user');
    return !!storedUser;
  };

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('whatsapp_auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const logout = () => {
    localStorage.removeItem('whatsapp_auth_user');
    localStorage.removeItem('whatsapp_phone');
  };

  return {
    sendOTP,
    verifyOTP,
    isLoading,
    isAuthenticated,
    getCurrentUser,
    logout
  };
};
