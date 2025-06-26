
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
      console.log('🔍 Loading user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        throw error;
      }

      if (!data) {
        console.log('👤 No user profile found, creating one...');
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
          console.error('❌ Error creating user profile:', createError);
          throw createError;
        }
        
        console.log('✅ New profile created:', newProfile);
        const typedProfile = {
          ...newProfile,
          role: newProfile.role as 'passenger' | 'driver' | null
        } as UserProfile;
        
        setUserProfile(typedProfile);
        return typedProfile;
      }

      console.log('✅ Profile loaded:', data);
      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error) {
      console.error('💥 Failed to load user profile:', error);
      setUserProfile(null);
      return null;
    }
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (user?.id) {
      console.log('🔄 Refreshing user profile for:', user.id);
      return await loadUserProfile(user.id);
    }
    console.log('⚠️ No user ID for profile refresh');
    return null;
  }, [user?.id, loadUserProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userProfile) return null;

    try {
      console.log('📝 Updating user profile:', updates);
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

      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      console.log('✅ Profile updated:', typedProfile);
      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return null;
    }
  }, [userProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      console.log('🔓 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
        } else if (mounted) {
          console.log('📱 Initial session:', session ? { id: session.user?.id, expires: session.expires_at } : 'null');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('💥 Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id ? { id: session.user.id } : null);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
