
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PushNotificationService {
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
  permissionStatus: NotificationPermission | null;
  registerToken: () => Promise<void>;
}

export const usePushNotifications = (): PushNotificationService => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [isSupported] = useState(() => 'Notification' in window && 'serviceWorker' in navigator);

  useEffect(() => {
    if (isSupported) {
      setPermissionStatus(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported on this device",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        await registerToken();
        toast({
          title: "Notifications enabled",
          description: "You'll receive updates about your trips and bookings",
        });
        return true;
      } else {
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings to get trip updates",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Permission error",
        description: "Failed to request notification permission",
        variant: "destructive"
      });
      return false;
    }
  };

  const registerToken = async (): Promise<void> => {
    if (!user || !isSupported || permissionStatus !== 'granted') return;

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Generate a simple token (in production, use Firebase Cloud Messaging)
      const token = `web_${user.id}_${Date.now()}`;
      
      // Save token to database
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          device_type: 'web',
          is_active: true
        }, {
          onConflict: 'token'
        });

      if (error) {
        console.error('Error saving push token:', error);
        throw error;
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
      toast({
        title: "Registration failed",
        description: "Failed to register for notifications",
        variant: "destructive"
      });
    }
  };

  return {
    requestPermission,
    isSupported,
    permissionStatus,
    registerToken
  };
};
