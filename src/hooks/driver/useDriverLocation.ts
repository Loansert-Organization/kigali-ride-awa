
import { useState, useEffect } from 'react';

export const useDriverLocation = () => {
  const [driverLocation, setDriverLocation] = useState<{lat: number; lng: number} | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          setDriverLocation({
            lat: -1.9441,
            lng: 30.0619
          });
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    driverLocation,
    getCurrentLocation
  };
};
