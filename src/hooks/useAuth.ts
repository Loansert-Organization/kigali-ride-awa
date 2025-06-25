
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { generatePromoCode } from '@/utils/authUtils';

export interface UserProfile {
  id: string;
  auth_user_id: string | null;
  role: 'passenger' | 'driver' | null;
  language: string;
  location_enabled: boolean;
  notifications_enabled: boolean;
  promo_code: string;
  referred_by: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signInAnonymously = async () => {
    console.log('Attempting anonymous sign in...');
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.warn('Anonymous sign in failed, proceeding with guest mode:', error.message);
      return null;
    }
  };

  const createGuestProfile = async (): Promise<UserProfile> => {
    console.log('Creating guest profile without authentication...');
    
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      auth_user_id: null,
      language: 'en',
      referred_by: localStorage.getItem('promo_code'),
      onboarding_completed: false,
      role: null,
      promo_code: generatePromoCode(),
      location_enabled: false,
      notifications_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('guest_profile', JSON.stringify(guestProfile));
    console.log('Created guest profile:', guestProfile);
    
    return guestProfile;
  };

  const loadUserProfile = async (authUser: User | null): Promise<UserProfile | null> => {
    if (!authUser) {
      const storedGuestProfile = localStorage.getItem('guest_profile');
      if (storedGuestProfile) {
        try {
          const guestProfile = JSON.parse(storedGuestProfile);
          console.log('Loaded existing guest profile:', guestProfile);
          return guestProfile;
        } catch (error) {
          console.error('Error parsing stored guest profile:', error);
        }
      }
      
      return await createGuestProfile();
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        throw error;
      }

      if (data) {
        const validRoles = ['passenger', 'driver'];
        const validatedRole = data.role && validRoles.includes(data.role) ? data.role as 'passenger' | 'driver' : null;
        
        if (data.role && !validRoles.includes(data.role)) {
          console.warn('Invalid role detected, setting to null:', data.role);
        }

        return {
          ...data,
          role: validatedRole
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await loadUserProfile(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      const updatedProfile = { ...userProfile, ...updates, updated_at: new Date().toISOString() };
      
      if (userProfile.auth_user_id) {
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('auth_user_id', userProfile.auth_user_id);
        
        if (error) throw error;
      } else {
        localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));
      }
      
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const initializeAuth = async () => {
    console.log('Setting up auth state listener...');
    
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user ? { id: session.user.id } : 'No user');
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            setTimeout(async () => {
              const profile = await loadUserProfile(session.user);
              setUserProfile(profile);
              setLoading(false);
            }, 0);
          } else if (event === 'SIGNED_OUT' || !session) {
            const guestProfile = await loadUserProfile(null);
            setUserProfile(guestProfile);
            setLoading(false);
          }
        }
      );

      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        console.log('Found existing session:', existingSession.user.id);
        setSession(existingSession);
        setUser(existingSession.user);
        const profile = await loadUserProfile(existingSession.user);
        setUserProfile(profile);
      } else {
        console.log('No existing session, attempting anonymous sign in...');
        
        const anonymousResult = await signInAnonymously();
        if (!anonymousResult) {
          const guestProfile = await loadUserProfile(null);
          setUserProfile(guestProfile);
        }
      }
      
      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
      const guestProfile = await loadUserProfile(null);
      setUserProfile(guestProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return {
    user,
    session,
    userProfile,
    loading,
    refreshUserProfile,
    updateUserProfile
  };
};
