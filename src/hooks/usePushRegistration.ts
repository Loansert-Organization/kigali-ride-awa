import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export const usePushRegistration = () => {
  const { user } = useCurrentUser();

  const register = async () => {
    if (!('serviceWorker' in navigator) || !user) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;
    // Skip push subscription for now - needs VAPID configuration
    console.log('Push notifications available but not configured');
    
    // Store basic token in push_tokens table instead
    await supabase.from('push_tokens').upsert({
      user_id: user.id,
      token: `web_${Date.now()}`, // Simple web token for now
      device_type: 'web',
      is_active: true
    });
  };

  return { register };
};

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
} 