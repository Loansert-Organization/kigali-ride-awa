
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  // WhatsApp Auth Properties
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  loading: boolean;
  phoneNumber: string | null;
  isGuest: boolean;
  login: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  requiresWhatsAppAuth: () => boolean;
  setGuestRole: (role: 'passenger' | 'driver') => void;
  guestRole: 'passenger' | 'driver' | null;
  
  // Legacy Properties (for compatibility)
  user: User | null;
  session: Session | null;
  refreshUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  error: string | null;
  debugInfo: any;
  retryInitialization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [guestRole, setGuestRole] = useState<'passenger' | 'driver' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo] = useState<any>({});

  const isGuest = !isAuthenticated;

  useEffect(() => {
    checkExistingSession();
    
    // Load guest role from localStorage
    const savedGuestRole = localStorage.getItem('guest_role') as 'passenger' | 'driver' | null;
    if (savedGuestRole) {
      setGuestRole(savedGuestRole);
    }

    // Set up Supabase auth listener for legacy compatibility
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsAuthenticated(true);
          // Try to load user profile
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .single();
            
            if (profile) {
              const typedProfile: UserProfile = {
                ...profile,
                role: profile.role as 'passenger' | 'driver' | null
              };
              setUserProfile(typedProfile);
            }
          } catch (err) {
            console.error('Error loading profile:', err);
          }
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
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
          const typedProfile: UserProfile = {
            ...profile,
            role: profile.role as 'passenger' | 'driver' | null
          };
          setUserProfile(typedProfile);
          setPhoneNumber(storedPhone);
          setIsAuthenticated(true);
        } else {
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
        const typedProfile: UserProfile = {
          ...data.user,
          role: data.user.role as 'passenger' | 'driver' | null
        };
        
        // If user had a guest role, update their profile
        if (guestRole && !typedProfile.role) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: guestRole })
            .eq('id', typedProfile.id);
          
          if (!updateError) {
            typedProfile.role = guestRole;
          }
        }
        
        setUserProfile(typedProfile);
        setPhoneNumber(formattedPhone);
        setIsAuthenticated(true);
        
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
    setUser(null);
    setSession(null);
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

  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    await refreshProfile();
    return userProfile;
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userProfile) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;

      const typedProfile: UserProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      };

      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
      return null;
    }
  };

  const requiresWhatsAppAuth = (): boolean => {
    return !isAuthenticated;
  };

  const retryInitialization = async (): Promise<void> => {
    setError(null);
    await checkExistingSession();
  };

  const handleSetGuestRole = (role: 'passenger' | 'driver') => {
    setGuestRole(role);
    localStorage.setItem('guest_role', role);
  };

  return (
    <AuthContext.Provider value={{
      // WhatsApp Auth Properties
      isAuthenticated,
      userProfile,
      loading,
      phoneNumber,
      isGuest,
      login,
      logout,
      sendOTP,
      refreshProfile,
      requiresWhatsAppAuth,
      setGuestRole: handleSetGuestRole,
      guestRole,
      
      // Legacy Properties (for compatibility)
      user,
      session,
      refreshUserProfile,
      updateUserProfile,
      error,
      debugInfo,
      retryInitialization
    }}>
      {children}
    </AuthContext.Provider>
  );
};
