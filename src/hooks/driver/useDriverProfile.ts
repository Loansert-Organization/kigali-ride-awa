
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export const useDriverProfile = () => {
  const navigate = useNavigate();
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  const loadDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data: profile } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', userRecord.id)
            .single();
          
          if (profile) {
            setDriverProfile(profile);
            setIsOnline(profile.is_online);
          } else {
            navigate('/onboarding/driver');
          }
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  useEffect(() => {
    loadDriverProfile();
  }, []);

  return {
    driverProfile,
    isOnline,
    setIsOnline,
    loadDriverProfile
  };
};
