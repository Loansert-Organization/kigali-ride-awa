
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Health check for Supabase connection with better error handling
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🏥 Performing Supabase health check...');
      const startTime = Date.now();
      
      // Test basic connection with a simple query that doesn't trigger RLS
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      console.log(`🏥 Health check completed in ${responseTime}ms`);
      
      if (error) {
        console.error('❌ Health check failed:', error);
        // Don't set error for RLS issues during health check
        if (!error.message.includes('policy') && !error.message.includes('recursion')) {
          setError('Backend connection failed. Please check your internet connection.');
        }
        return false;
      }
      
      console.log('✅ Supabase connection healthy');
      return true;
    } catch (error) {
      console.error('💥 Health check exception:', error);
      // Only set error for genuine connection issues
      return false;
    }
  }, []);

  // Environment validation with better error reporting
  const validateEnvironment = useCallback(() => {
    const supabaseUrl = 'https://ldbzarwjnnsoyoengheg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY';
    
    const envInfo = {
      supabaseUrl,
      supabaseKeyLength: supabaseKey?.length || 0,
      environment: import.meta.env.MODE || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔧 Environment validation:', envInfo);
    setDebugInfo(prev => ({ ...prev, environment: envInfo }));
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Missing Supabase configuration. Please check environment setup.');
      return false;
    }
    
    return true;
  }, []);

  const loadUserProfile = useCallback(async (userId: string, retries = 2): Promise<UserProfile | null> => {
    console.log(`🔍 Loading user profile for: ${userId} (attempts left: ${retries})`);
    
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      const queryTime = Date.now() - startTime;
      console.log(`📊 Profile query completed in ${queryTime}ms`);

      if (error) {
        console.error('❌ Error loading user profile:', error);
        
        // Handle specific error types
        if (error.code === 'PGRST116' || error.message.includes('policy')) {
          console.warn('RLS policy issue, but continuing...');
          return null;
        }
        
        // Retry on network or temporary errors
        if (retries > 0 && (
          error.code === 'PGRST301' || 
          error.message.includes('network') ||
          error.message.includes('timeout')
        )) {
          console.log(`🔄 Retrying profile load... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadUserProfile(userId, retries - 1);
        }
        
        // Don't throw for non-critical errors
        console.warn('Profile loading failed, continuing without profile');
        return null;
      }

      if (!data) {
        console.log('👤 No user profile found, will create one when needed');
        return null;
      }

      console.log('✅ Profile loaded successfully:', data);
      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      setUserProfile(typedProfile);
      return typedProfile;
    } catch (error: any) {
      console.error('💥 Failed to load user profile:', error);
      // Don't set error state for profile loading issues
      setUserProfile(null);
      return null;
    }
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (user?.id) {
      console.log('🔄 Refreshing user profile for:', user.id);
      setError(null);
      return await loadUserProfile(user.id);
    }
    console.log('⚠️ No user ID for profile refresh');
    return null;
  }, [user?.id, loadUserProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userProfile) {
      console.warn('No user profile to update');
      return null;
    }

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

      if (error) {
        console.error('❌ Error updating user profile:', error);
        throw error;
      }

      const typedProfile = {
        ...data,
        role: data.role as 'passenger' | 'driver' | null
      } as UserProfile;

      console.log('✅ Profile updated:', typedProfile);
      setUserProfile(typedProfile);
      setError(null);
      return typedProfile;
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      setError(`Profile update failed: ${error.message}`);
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
      setError(null);
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      // Don't set error for sign out issues, just clear state
      setUser(null);
      setSession(null);
      setUserProfile(null);
    }
  }, []);

  const retryInitialization = useCallback(async () => {
    console.log('🔄 Retrying initialization...');
    setLoading(true);
    setError(null);
    
    // Validate environment first
    if (!validateEnvironment()) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Error getting session:', error);
        // Don't set error for session retrieval issues
      } else {
        console.log('📱 Session retrieved:', session ? { id: session.user?.id, expires: session.expires_at } : 'null');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't await this to avoid blocking
          setTimeout(() => loadUserProfile(session.user.id), 0);
        }
      }
    } catch (error: any) {
      console.error('💥 Error in retry initialization:', error);
      // Don't set error, just continue
    } finally {
      setLoading(false);
    }
  }, [validateEnvironment, loadUserProfile]);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        setDebugInfo(prev => ({ ...prev, initStartTime: Date.now() }));
        
        // Validate environment
        if (!validateEnvironment()) {
          if (mounted) setLoading(false);
          return;
        }
        
        // Set timeout for initialization - but don't fail, just log
        initTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.warn('⏰ Initialization timeout - taking longer than expected');
            // Don't set error, just log warning
          }
        }, 8000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
          // Don't set error for initial session load
        } else if (mounted) {
          console.log('📱 Initial session:', session ? { id: session.user?.id, expires: session.expires_at } : 'null');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Don't await to avoid blocking
            setTimeout(() => {
              if (mounted) loadUserProfile(session.user.id);
            }, 0);
          }
        }
      } catch (error: any) {
        console.error('💥 Error in getInitialSession:', error);
        // Don't set error state, just log
      } finally {
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
        if (mounted) {
          setLoading(false);
          console.log('✅ Auth initialization complete');
          setDebugInfo(prev => ({ 
            ...prev, 
            initEndTime: Date.now(),
            initDuration: Date.now() - (prev.initStartTime || Date.now())
          }));
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
          setError(null);
          
          // Defer profile loading to prevent deadlocks
          if (session?.user) {
            setTimeout(() => {
              if (mounted) {
                loadUserProfile(session.user.id);
              }
            }, 0);
          } else {
            setUserProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
    };
  }, [loadUserProfile, validateEnvironment]);

  return {
    user,
    session,
    userProfile,
    loading,
    error,
    debugInfo,
    refreshUserProfile,
    updateUserProfile,
    signOut,
    retryInitialization
  };
};
