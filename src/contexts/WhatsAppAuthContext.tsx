
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';

interface WhatsAppAuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  loading: boolean;
  phoneNumber: string | null;
  login: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const WhatsAppAuthContext = createContext<WhatsAppAuthContextType | undefined>(undefined);

export const useWhatsAppAuth = () => {
  const context = useContext(WhatsAppAuthContext);
  if (context === undefined) {
    throw new Error('useWhatsAppAuth must be used within a WhatsAppAuthProvider');
  }
  return context;
};

export const WhatsAppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing WhatsApp session on app load
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedPhone = localStorage.getItem('whatsapp_phone');
      const storedUserId = localStorage.getItem('whatsapp_user_id');
      
      if (storedPhone && storedUserId) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', storedUserId)
          .eq('phone_verified', true)
          .eq('auth_method', 'whatsapp')
          .single();

        if (profile) {
          // Type-safe conversion of the role field
          const typedProfile: UserProfile = {
            ...profile,
            role: profile.role as 'passenger' | 'driver' | null
          };
          setUserProfile(typedProfile);
          setPhoneNumber(storedPhone);
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          localStorage.removeItem('whatsapp_phone');
          localStorage.removeItem('whatsapp_user_id');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('250') 
        ? `+${phone}` 
        : phone.startsWith('+250') 
        ? phone 
        : `+250${phone.replace(/^0+/, '')}`;

      const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
        body: { phone_number: formattedPhone }
      });

      if (error) throw error;

      if (data?.success) {
        return { success: true };
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, otpCode: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('250') 
        ? `+${phone}` 
        : phone.startsWith('+250') 
        ? phone 
        : `+250${phone.replace(/^0+/, '')}`;

      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: {
          phone_number: formattedPhone,
          otp_code: otpCode
        }
      });

      if (error) throw error;

      if (data?.success && data?.user) {
        // Type-safe conversion of the user data
        const typedProfile: UserProfile = {
          ...data.user,
          role: data.user.role as 'passenger' | 'driver' | null
        };
        setUserProfile(typedProfile);
        setPhoneNumber(formattedPhone);
        setIsAuthenticated(true);
        
        // Store session locally
        localStorage.setItem('whatsapp_phone', formattedPhone);
        localStorage.setItem('whatsapp_user_id', data.user.id);
        
        return { success: true };
      } else {
        throw new Error(data?.message || 'OTP verification failed');
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setPhoneNumber(null);
    localStorage.removeItem('whatsapp_phone');
    localStorage.removeItem('whatsapp_user_id');
  };

  const refreshProfile = async (): Promise<void> => {
    if (!isAuthenticated || !userProfile) return;

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (profile) {
        // Type-safe conversion of the refreshed profile
        const typedProfile: UserProfile = {
          ...profile,
          role: profile.role as 'passenger' | 'driver' | null
        };
        setUserProfile(typedProfile);
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  return (
    <WhatsAppAuthContext.Provider value={{
      isAuthenticated,
      userProfile,
      loading,
      phoneNumber,
      login,
      logout,
      sendOTP,
      refreshProfile
    }}>
      {children}
    </WhatsAppAuthContext.Provider>
  );
};
