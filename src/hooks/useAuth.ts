
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              auth_user_id: userId,
              role: null,
              language: 'en',
              location_enabled: false,
              notifications_enabled: false,
              onboarding_completed: false
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            throw createError;
          }
          
          // Type assertion to ensure proper role type
          const typedProfile = {
            ...newProfile,
            role: newProfile.role as 'passenger' | 'driver' | null
          } as UserProfile;
          
          setUserProfile(typedProfile);
          return typedProfile;
        }
        throw error;
      }

      // Type assertion to ensure proper role type
      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUserProfile(null);
      return null;
    }
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (user?.id) {
      return await loadUserProfile(user.id);
    }
    return null;
  }, [user?.id, loadUserProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
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

      // Type assertion to ensure proper role type
      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }, [userProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Load user profile if we have a user
          if (session?.user) {
            // Use setTimeout to avoid potential recursion
            setTimeout(() => {
              loadUserProfile(session.user.id);
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id ? { id: session.user.id } : null);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent recursion in auth state change
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  return {
    user,
    session,
    userProfile,
    loading,
    refreshUserProfile,
    updateUserProfile,
    signOut
  };
};
