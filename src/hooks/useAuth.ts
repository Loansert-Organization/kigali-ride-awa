
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from '@/types/user';
import { useAuthStateManager } from './useAuthStateManager';
import { useHealthCheck } from './auth/useHealthCheck';
import { useEnvironmentValidation } from './auth/useEnvironmentValidation';
import { useUserProfileManager } from './auth/useUserProfileManager';

export const useAuth = () => {
  const {
    authState,
    updateState,
    createUserProfile,
    refreshProfile,
    retryInitialization,
    clearError
  } = useAuthStateManager();

  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);
  const { performHealthCheck } = useHealthCheck();
  const { debugInfo, validateEnvironment } = useEnvironmentValidation();
  const { loadUserProfile, updateUserProfile: updateProfile } = useUserProfileManager(updateState);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    return updateProfile(authState.userProfile, updates);
  }, [authState.userProfile, updateProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      console.log('🔓 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      updateState({
        user: null,
        session: null,
        userProfile: null,
        error: null
      });
      
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }, [updateState]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing auth...');
        updateState({ loading: true, error: null });
        
        // Set initialization timeout
        const timeout = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ Initialization timeout (8 seconds)');
            updateState({ 
              error: 'Setup is taking longer than expected. Please check your connection and try again.',
              loading: false 
            });
          }
        }, 8000);
        setInitTimeout(timeout);
        
        // Validate environment
        if (!validateEnvironment()) {
          throw new Error('Invalid environment configuration');
        }
        
        // Health check
        const isHealthy = await performHealthCheck();
        if (!isHealthy) {
          throw new Error('Backend services are currently unavailable');
        }
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (mounted) {
          updateState({ 
            session, 
            user: session?.user || null 
          });
          
          // Load profile if user exists
          if (session?.user) {
            try {
              await loadUserProfile(session.user.id);
            } catch (profileError: any) {
              console.warn('⚠️ Profile load failed, but continuing:', profileError.message);
            }
          }
          
          updateState({ loading: false });
          clearTimeout(timeout);
        }

      } catch (error: any) {
        console.error('💥 Initialization failed:', error);
        if (mounted) {
          updateState({ 
            error: error.message || 'Initialization failed',
            loading: false 
          });
          if (initTimeout) clearTimeout(initTimeout);
        }
      }
    };

    initialize();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (mounted) {
          updateState({ 
            session, 
            user: session?.user || null,
            error: null
          });
          
          // Defer profile loading to avoid deadlocks
          if (session?.user && event === 'SIGNED_IN') {
            setTimeout(async () => {
              if (mounted) {
                try {
                  await loadUserProfile(session.user.id);
                } catch (error: any) {
                  console.warn('⚠️ Deferred profile load failed:', error.message);
                }
              }
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            updateState({ userProfile: null });
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [updateState, validateEnvironment, performHealthCheck, loadUserProfile, initTimeout]);

  return {
    user: authState.user,
    session: authState.session,
    userProfile: authState.userProfile,
    loading: authState.loading,
    error: authState.error,
    isRetrying: authState.isRetrying,
    debugInfo,
    refreshUserProfile: refreshProfile,
    updateUserProfile,
    createUserProfile,
    signOut,
    retryInitialization,
    clearError,
    performHealthCheck
  };
};
