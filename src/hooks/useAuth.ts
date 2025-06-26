
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from '@/types/user';
import { useAuthStateManager } from './useAuthStateManager';

export const useAuth = () => {
  const {
    authState,
    updateState,
    createUserProfile,
    refreshProfile,
    retryInitialization,
    clearError
  } = useAuthStateManager();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);

  // Health check for backend connectivity
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🏥 Performing health check...');
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      console.log(`🏥 Health check completed in ${responseTime}ms`);
      
      if (error) {
        console.error('❌ Health check failed:', error);
        return false;
      }
      
      console.log('✅ Backend is healthy');
      return true;
    } catch (error) {
      console.error('💥 Health check exception:', error);
      return false;
    }
  }, []);

  // Environment validation
  const validateEnvironment = useCallback(() => {
    const supabaseUrl = 'https://ldbzarwjnnsoyoengheg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY';
    
    const envInfo = {
      supabaseUrl,
      authKey: supabaseKey?.substring(0, 20) + '...' || 'missing',
      environment: import.meta.env.MODE || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔧 Environment info:', envInfo);
    setDebugInfo(envInfo);
    
    return Boolean(supabaseUrl && supabaseKey);
  }, []);

  // Load user profile with comprehensive error handling
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log(`🔍 Loading profile for user: ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile load error:', error);
        
        // Handle specific error types
        if (error.code === '42P17') {
          throw new Error('Database configuration error (infinite recursion in policies). Please try again.');
        }
        
        if (error.message.includes('policy') || error.code === 'PGRST116') {
          console.log('🔐 RLS policy issue, this should resolve automatically...');
          // Don't throw here, let it return null and handle gracefully
          return null;
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('👤 No profile found for user');
        return null;
      }

      const profile = data as UserProfile;
      console.log('✅ Profile loaded:', profile);
      updateState({ userProfile: profile });
      return profile;

    } catch (error: any) {
      console.error('💥 Failed to load profile:', error);
      throw error;
    }
  }, [updateState]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!authState.userProfile) {
      throw new Error('No user profile to update');
    }

    try {
      console.log('📝 Updating profile:', updates);
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.userProfile.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }

      const updatedProfile = data as UserProfile;
      updateState({ userProfile: updatedProfile });
      return updatedProfile;

    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }, [authState.userProfile, updateState]);

  // Sign out
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
              // Don't block initialization for profile errors
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
