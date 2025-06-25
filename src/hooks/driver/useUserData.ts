
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserData = () => {
  const [user, setUser] = useState<any>(null);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    user,
    loadUserData
  };
};
