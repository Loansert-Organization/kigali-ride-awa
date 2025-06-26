
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LanguageCode } from '@/constants/languages';

export const useRoleSelection = (
  selectedLanguage: LanguageCode,
  urlPromo: string | null,
  promoCode: string
) => {
  const { user, refreshUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  const clearProcessingState = () => {
    setIsProcessing(false);
    setSelectedRole(null);
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
  };

  const handleRoleSelect = async (role: 'passenger' | 'driver') => {
    console.log('🔄 Role selection started:', role);
    
    if (isProcessing) {
      console.log('⚠️ Already processing, ignoring click');
      return;
    }
    
    setSelectedRole(role);
    setIsProcessing(true);

    // Set processing timeout
    const timeout = setTimeout(() => {
      console.warn('⏰ Role selection timeout');
      throw new Error('Setup is taking longer than expected. Please try again.');
    }, 10000);
    setProcessingTimeout(timeout);

    try {
      // First ensure we have an authenticated user
      let currentUser = user;
      if (!currentUser) {
        console.log('🔐 No authenticated user, signing in anonymously...');
        
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          console.error('❌ Error with anonymous sign in:', authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }
        
        console.log('✅ Anonymous auth successful:', authData.user?.id);
        currentUser = authData.user;
        
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (!currentUser) {
        throw new Error('Authentication failed - no user available');
      }

      console.log('📝 Creating/updating user profile for user:', currentUser.id);

      // Store role in localStorage as backup
      localStorage.setItem('user_role', role);

      // Use the edge function to create or update user profile
      const requestPayload = {
        profileData: {
          role: role,
          language: selectedLanguage,
          location_enabled: false,
          notifications_enabled: false,
          onboarding_completed: false,
          referred_by: urlPromo || promoCode || null
        }
      };

      console.log('🚀 Calling edge function with data:', requestPayload);

      const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
        body: requestPayload
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw new Error(`Profile setup failed: ${error.message || 'Unknown error from server'}`);
      }

      console.log('✅ Profile created/updated successfully:', data);

      // Refresh the user profile to get the updated data
      console.log('🔄 Refreshing user profile...');
      const updatedProfile = await refreshUserProfile();
      
      if (!updatedProfile) {
        throw new Error('Profile was created but could not be retrieved');
      }
      
      // Clear timeout and return success
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }

      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });

      return { success: true };

    } catch (error: any) {
      console.error('❌ Role selection error:', error);
      
      clearProcessingState();
      
      toast({
        title: "Setup Error",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive"
      });

      throw error;
    }
  };

  return {
    selectedRole,
    isProcessing,
    handleRoleSelect,
    clearProcessingState
  };
};
