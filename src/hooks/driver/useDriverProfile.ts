
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DriverProfile {
  user_id: string;
  vehicle_type: string;
  plate_number: string;
  preferred_zone?: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export const useDriverProfile = () => {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const loadDriverProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // First get the user's profile from the users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) {
        console.error('Error loading user profile:', userError);
        setError('Failed to load user profile');
        return;
      }

      if (!userProfile) {
        setError('User profile not found');
        return;
      }

      // Then get the driver profile using the user's ID
      const { data: profile, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading driver profile:', profileError);
        setError('Failed to load driver profile');
        return;
      }

      setDriverProfile(profile);
      setIsOnline(profile?.is_online || false);
    } catch (err) {
      console.error('Error in loadDriverProfile:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDriverProfile = async (updates: Partial<DriverProfile>) => {
    if (!user) return;

    try {
      // Get the user's profile first
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userProfile) {
        throw new Error('User profile not found');
      }

      // Prepare the upsert data - exclude updated_at as it's auto-generated
      const upsertData = {
        user_id: userProfile.id,
        vehicle_type: updates.vehicle_type || driverProfile?.vehicle_type || '',
        plate_number: updates.plate_number || driverProfile?.plate_number || '',
        preferred_zone: updates.preferred_zone || driverProfile?.preferred_zone,
        is_online: updates.is_online !== undefined ? updates.is_online : (driverProfile?.is_online || false)
      };

      const { data, error } = await supabase
        .from('driver_profiles')
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      setDriverProfile(data);
      setIsOnline(data.is_online);
      
      toast({
        title: "Profile updated",
        description: "Your driver profile has been updated successfully",
      });

      return data;
    } catch (err) {
      console.error('Error updating driver profile:', err);
      toast({
        title: "Error",
        description: "Failed to update driver profile",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleOnlineStatus = async () => {
    if (!driverProfile) return;

    const newStatus = !isOnline;
    
    try {
      await updateDriverProfile({ is_online: newStatus });
      
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus ? "You'll receive ride requests" : "You won't receive ride requests",
      });
    } catch (err) {
      console.error('Error toggling online status:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadDriverProfile();
    }
  }, [user]);

  return {
    driverProfile,
    isLoading,
    error: error || '',
    isOnline,
    setIsOnline,
    updateDriverProfile,
    toggleOnlineStatus,
    refetch: loadDriverProfile
  };
};
