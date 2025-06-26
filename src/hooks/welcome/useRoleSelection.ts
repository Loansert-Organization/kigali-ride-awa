
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRoleSelection = () => {
  const { user, refreshUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);

  const handleRoleSelect = async (
    role: 'passenger' | 'driver',
    selectedLanguage: string,
    urlPromo: string | null,
    promoCode: string,
    setIsProcessing: (processing: boolean) => void
  ) => {
    console.log('Role selection clicked:', role);
    
    setSelectedRole(role);
    setIsProcessing(true);

    try {
      // First ensure we have an authenticated user
      let currentUser = user;
      if (!currentUser) {
        console.log('No authenticated user, signing in anonymously...');
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          console.error('Error with anonymous sign in:', authError);
          throw new Error('Failed to authenticate. Please try again.');
        }
        
        currentUser = authData.user;
        
        // Wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Using edge function to create/update user profile for user:', currentUser?.id);

      // Store role in localStorage as backup
      localStorage.setItem('user_role', role);

      // Use the edge function to create or update user profile
      const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
        body: {
          profileData: {
            role: role,
            language: selectedLanguage,
            location_enabled: false,
            notifications_enabled: false,
            onboarding_completed: false,
            referred_by: urlPromo || promoCode || null
          }
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Profile setup failed: ${error.message}`);
      }

      console.log('Profile created/updated successfully:', data);

      // Refresh the user profile to get the updated data
      await refreshUserProfile();
      
      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });

      return true;

    } catch (error: any) {
      console.error('Role selection error:', error);
      setSelectedRole(null);
      
      toast({
        title: "Setup Error",
        description: error.message || "Please try again",
        variant: "destructive"
      });

      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedRole,
    handleRoleSelect
  };
};
