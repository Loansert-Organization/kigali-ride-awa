
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const registerToken = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('push_tokens').upsert({
        user_id: user.id,
        token,
        device_type: 'web',
        is_active: true
      });
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    registerToken
  };
};
