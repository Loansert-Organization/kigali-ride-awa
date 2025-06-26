
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useLocationPermission = () => {
  const navigate = useNavigate();
  const [locationGranted, setLocationGranted] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      setLocationGranted(true);
      
      toast({
        title: "Location enabled! 📍",
        description: "Perfect! Now we can find rides near you",
      });

      navigateToOnboarding();
      
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      
      navigateToOnboarding();
    }
  };

  const navigateToOnboarding = () => {
    const role = localStorage.getItem('user_role') as 'passenger' | 'driver';
    
    if (role === 'passenger') {
      navigate('/onboarding/passenger');
    } else if (role === 'driver') {
      navigate('/onboarding/driver');
    } else {
      console.error('No role found for navigation');
      toast({
        title: "Error",
        description: "Please select your role first",
        variant: "destructive"
      });
    }
  };

  const skipLocation = () => {
    navigateToOnboarding();
  };

  return {
    locationGranted,
    requestLocationPermission,
    skipLocation
  };
};
