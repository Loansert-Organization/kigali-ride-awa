
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isRetrying: boolean;
}

export interface AuthActions {
  createUserProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<UserProfile | null>;
  retryInitialization: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStateManager = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    loading: true,
    error: null,
    isRetrying: false
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const createUserProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      console.log('🔧 Creating user profile with data:', profileData);
      
      // First try direct database insert
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: authState.user?.id || null,
          role: profileData.role || null,
          language: profileData.language || 'en',
          location_enabled: profileData.location_enabled || false,
          notifications_enabled: profileData.notifications_enabled || false,
          onboarding_completed: profileData.onboarding_completed || false,
          referred_by: profileData.referred_by || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Direct insert failed:', error);
        
        // Fallback to edge function
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-or-update-user-profile', {
          body: { profileData }
        });

        if (edgeError) {
          throw new Error(`Profile creation failed: ${edgeError.message}`);
        }

        if (edgeData?.profile) {
          const typedProfile = edgeData.profile as UserProfile;
          updateState({ userProfile: typedProfile });
          return typedProfile;
        }
        
        throw new Error('Profile creation failed - no data returned');
      }

      const typedProfile = data as UserProfile;
      updateState({ userProfile: typedProfile });
      console.log('✅ Profile created successfully:', typedProfile);
      return typedProfile;

    } catch (error: any) {
      console.error('💥 Profile creation error:', error);
      throw error;
    }
  }, [authState.user?.id, updateState]);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!authState.user?.id) {
      console.log('⚠️ No user ID for profile refresh');
      return null;
    }

    try {
      console.log('🔄 Refreshing profile for user:', authState.user.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authState.user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile refresh failed:', error);
        throw error;
      }

      if (!data) {
        console.log('👤 No profile found');
        return null;
      }

      const typedProfile = data as UserProfile;
      updateState({ userProfile: typedProfile });
      console.log('✅ Profile refreshed:', typedProfile);
      return typedProfile;

    } catch (error: any) {
      console.error('💥 Profile refresh error:', error);
      throw error;
    }
  }, [authState.user?.id, updateState]);

  const retryInitialization = useCallback(async () => {
    console.log('🔄 Retrying initialization...');
    updateState({ isRetrying: true, error: null, loading: true });

    try {
      // Health check first
      const { data: healthData, error: healthError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (healthError) {
        throw new Error(`Backend health check failed: ${healthError.message}`);
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      updateState({ 
        session, 
        user: session?.user || null 
      });

      // If we have a user, try to load their profile
      if (session?.user) {
        await refreshProfile();
      }

      updateState({ loading: false, isRetrying: false });

    } catch (error: any) {
      console.error('💥 Retry initialization failed:', error);
      updateState({ 
        error: error.message || 'Initialization failed',
        loading: false,
        isRetrying: false
      });
    }
  }, [updateState, refreshProfile]);

  return {
    authState,
    updateState,
    createUserProfile,
    refreshProfile,
    retryInitialization,
    clearError
  };
};
