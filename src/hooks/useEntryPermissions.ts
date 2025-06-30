import { useState, useCallback } from 'react';

export const useEntryPermissions = () => {
  const [locationGranted, setLocationGranted] = useState<boolean>(() => {
    return localStorage.getItem('locationGranted') === 'true';
  });
  const [notificationGranted, setNotificationGranted] = useState<boolean>(() => {
    return localStorage.getItem('notificationGranted') === 'true';
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return Promise.reject('unsupported');
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationGranted(true);
          localStorage.setItem('locationGranted', 'true');
          resolve(true);
        },
        () => resolve(false)
      );
    });
  }, []);

  const requestNotification = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    if (granted) {
      setNotificationGranted(true);
      localStorage.setItem('notificationGranted', 'true');
    }
    return granted;
  }, []);

  return {
    locationGranted,
    notificationGranted,
    requestLocation,
    requestNotification,
  };
}; 