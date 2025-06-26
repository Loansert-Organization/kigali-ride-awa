
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from '@/types/user';

export const useUserProfileManager = (updateState: (updates: any) => void) => {
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

  const updateUserProfile = useCallback(async (userProfile: UserProfile | null, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userProfile) {
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
        .eq('id', userProfile.id)
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
  }, [updateState]);

  return { loadUserProfile, updateUserProfile };
};
