
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = async (authUser: User) => {
    console.log('Creating user profile for:', authUser.id);
    
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        return null;
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        return existingProfile;
      }

      // Get promo code from URL or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const promoFromUrl = urlParams.get('promo');
      const promoFromStorage = localStorage.getItem('promo_code');
      const referredBy = promoFromUrl || promoFromStorage || null;

      // Store promo code in localStorage if from URL
      if (promoFromUrl) {
        localStorage.setItem('promo_code', promoFromUrl);
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          language: localStorage.getItem('language') || 'en',
          referred_by: referredBy,
          onboarding_completed: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }

      console.log('Created new profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  };

  const createGuestProfile = async () => {
    console.log('Creating guest profile without authentication...');
    
    try {
      // Generate a temporary guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a mock user profile for guest usage
      const guestProfile = {
        id: guestId,
        auth_user_id: null,
        language: localStorage.getItem('language') || 'en',
        referred_by: localStorage.getItem('promo_code') || null,
        onboarding_completed: false,
        role: null,
        promo_code: `GUEST-${guestId.substr(-5).toUpperCase()}`,
        location_enabled: false,
        notifications_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store guest profile in localStorage for persistence
      localStorage.setItem('guest_profile', JSON.stringify(guestProfile));
      
      console.log('Created guest profile:', guestProfile);
      return guestProfile;
    } catch (error) {
      console.error('Error creating guest profile:', error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (!user) {
      // Try to load guest profile from localStorage
      const storedGuestProfile = localStorage.getItem('guest_profile');
      if (storedGuestProfile) {
        try {
          const guestProfile = JSON.parse(storedGuestProfile);
          setUserProfile(guestProfile);
          return;
        } catch (error) {
          console.error('Error parsing guest profile:', error);
        }
      }
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        setUserProfile(profile);
      } else {
        // Create profile if it doesn't exist
        const newProfile = await createUserProfile(user);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error in refreshUserProfile:', error);
    }
  };

  const signInAnonymously = async () => {
    console.log('Attempting anonymous sign in...');
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.warn('Anonymous sign in failed, proceeding with guest mode:', error.message);
        
        // If anonymous signup fails, create a guest profile instead
        const guestProfile = await createGuestProfile();
        setUserProfile(guestProfile);
        setUser(null);
        setSession(null);
        
        toast({
          title: "Welcome to Kigali Ride",
          description: "You're browsing in guest mode. Some features may be limited.",
        });
        
        return;
      }

      console.log('Anonymous sign in successful:', data);
      
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        
        // Create user profile
        setTimeout(async () => {
          const profile = await createUserProfile(data.user);
          setUserProfile(profile);
        }, 0);
      }
    } catch (error) {
      console.error('Error in signInAnonymously:', error);
      
      // Fallback to guest mode
      const guestProfile = await createGuestProfile();
      setUserProfile(guestProfile);
      setUser(null);
      setSession(null);
      
      toast({
        title: "Welcome to Kigali Ride",
        description: "You're browsing in guest mode. Some features may be limited.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer profile creation/fetching to avoid blocking the auth callback
          setTimeout(async () => {
            const profile = await createUserProfile(session.user);
            setUserProfile(profile);
          }, 0);
        } else if (!session?.user) {
          // Check if we have a guest profile
          setTimeout(async () => {
            await refreshUserProfile();
          }, 0);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (existingSession?.user) {
          console.log('Found existing session:', existingSession.user.id);
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Fetch user profile
          setTimeout(async () => {
            await refreshUserProfile();
          }, 0);
        } else {
          console.log('No existing session, attempting anonymous sign in...');
          await signInAnonymously();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await signInAnonymously();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signInAnonymously,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
