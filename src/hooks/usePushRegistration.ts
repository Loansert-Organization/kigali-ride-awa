import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export const usePushRegistration = () => {
  const { user } = useCurrentUser();

  const register = async () => {
    if (!('serviceWorker' in navigator) || !user) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(import.meta.env.VITE_VAPID_PUB!)
    });

    const { endpoint, keys } = sub.toJSON() as any;
    await supabase.from('user_push_subscriptions').upsert({
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth
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