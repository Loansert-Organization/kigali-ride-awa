
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
  const { user, refreshUserProfile, createUserProfile } = useAuth();
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
      clearProcessingState();
      throw new Error('Role selection is taking longer than expected. Please try again.');
    }, 10000);
    setProcessingTimeout(timeout);

    try {
      // First ensure we have an authenticated user
      let currentUser = user;
      if (!currentUser) {
        console.log('🔐 No authenticated user, signing in anonymously...');
        
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          console.error('❌ Anonymous auth failed:', authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }
        
        console.log('✅ Anonymous auth successful:', authData.user?.id);
        currentUser = authData.user;
        
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!currentUser) {
        throw new Error('Authentication failed - no user available');
      }

      console.log('📝 Creating user profile...');

      // Store role in localStorage as backup
      localStorage.setItem('user_role', role);

      // Prepare profile data with proper validation
      const profileData = {
        role: role, // This should be a valid 'passenger' | 'driver' string
        language: selectedLanguage,
        location_enabled: false,
        notifications_enabled: false,
        onboarding_completed: false,
        referred_by: urlPromo || promoCode || null
      };

      console.log('🚀 Creating profile with validated data:', profileData);

      // Use the auth manager's create profile method
      const profile = await createUserProfile(profileData);
      
      if (!profile) {
        throw new Error('Profile creation returned null');
      }

      // Clear timeout and show success
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }

      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });

      console.log('✅ Role selection completed successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Role selection error:', error);
      
      clearProcessingState();
      
      // Provide user-friendly error messages
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Could not authenticate. Please try again.';
      } else if (error.message.includes('Invalid role')) {
        errorMessage = 'Role validation failed. Please try again.';
      } else if (error.message.includes('Profile creation failed')) {
        errorMessage = 'Could not create your profile. Please try again.';
      } else if (error.message.includes('timeout') || error.message.includes('longer than expected')) {
        errorMessage = 'Setup is taking too long. Please check your connection and try again.';
      }
      
      toast({
        title: "Setup Error",
        description: errorMessage,
        variant: "destructive"
      });

      throw new Error(errorMessage);
    }
  };

  return {
    selectedRole,
    isProcessing,
    handleRoleSelect,
    clearProcessingState
  };
};
