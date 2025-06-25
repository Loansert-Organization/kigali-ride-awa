
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from './useErrorHandler';

interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'trip_matched' | 'booking_confirmed' | 'trip_reminder' | 'general';
}

export const useNotificationService = () => {
  const { handleError } = useErrorHandler();

  const sendNotification = useCallback(async (
    userId: string,
    options: NotificationOptions
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          ...options
        }
      });

      if (error) throw error;

      return data.success;
    } catch (error) {
      await handleError(error, 'NotificationService.sendNotification', {
        userId,
        options
      });
      return false;
    }
  }, [handleError]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  return {
    sendNotification,
    requestPermission
  };
};
