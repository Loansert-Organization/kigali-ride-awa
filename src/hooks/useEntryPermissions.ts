import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useEntryPermissions = () => {
  const [locationGranted, setLocationGranted] = useState<boolean>(() => {
    return localStorage.getItem('locationGranted') === 'true';
  });
  const [notificationGranted, setNotificationGranted] = useState<boolean>(() => {
    return localStorage.getItem('notificationGranted') === 'true';
  });

  const requestLocation = useCallback(async () => {
    // Check if we're in a secure context (HTTPS)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      toast({
        title: "Secure connection required",
        description: "Location access requires HTTPS. Please use a secure connection.",
      });
      console.warn('Geolocation requires a secure context (HTTPS)');
      return false;
    }
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Try permissions API first (not all browsers support it)
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'granted') {
            setLocationGranted(true);
            localStorage.setItem('locationGranted', 'true');
            return true;
          } else if (permission.state === 'denied') {
            // Permission was explicitly denied
            toast({
              title: "Location access denied",
              description: "You can still use the app, but you'll need to enter locations manually",
            });
            return false;
          }
        } catch (permError) {
          console.log('Permissions API not fully supported, falling back to direct request');
        }
      }
      
      // Direct geolocation request
      return new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.log('Location request timed out');
          toast({
            title: "Location request timed out",
            description: "You can continue without location access",
          });
          resolve(false);
        }, 15000); // 15 second timeout
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            console.log('Location granted:', position.coords);
            setLocationGranted(true);
            localStorage.setItem('locationGranted', 'true');
            toast({
              title: "Location enabled",
              description: "We can now find rides near you"
            });
            resolve(true);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error('Location error:', error);
            
            // Different messages for different error types
            let message = "You can still use the app, but you'll need to enter locations manually";
            if (error.code === error.PERMISSION_DENIED) {
              message = "Location access denied. You can enable it later in settings.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              message = "Location unavailable. Please try again later.";
            } else if (error.code === error.TIMEOUT) {
              message = "Location request timed out. You can try again later.";
            }
            
            toast({
              title: "Location not available",
              description: message,
            });
            resolve(false);
          },
          {
            enableHighAccuracy: false, // Start with low accuracy for faster response
            timeout: 10000,
            maximumAge: 300000 // Accept cached position up to 5 minutes old
          }
        );
      });
    } catch (error) {
      console.error('Unexpected error in requestLocation:', error);
      toast({
        title: "Unexpected error",
        description: "You can continue without location access",
      });
      return false;
    }
  }, []);

  const requestNotification = useCallback(async () => {
    // Check if we're in a secure context (HTTPS)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      toast({
        title: "Secure connection required",
        description: "Notifications require HTTPS. Please use a secure connection.",
      });
      console.warn('Notifications require a secure context (HTTPS)');
      return false;
    }
    
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support push notifications",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      if (granted) {
        setNotificationGranted(true);
        localStorage.setItem('notificationGranted', 'true');
        toast({
          title: "Notifications enabled",
          description: "You'll receive updates about your rides"
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You won't receive push notifications",
          variant: "destructive"
        });
      }
      return granted;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }, []);

  return {
    locationGranted,
    notificationGranted,
    requestLocation,
    requestNotification,
  };
}; 