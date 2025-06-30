import { useState, useEffect } from 'react';
import { googleMapsService } from '@/services/GoogleMapsService';
import { MapLocation } from '@/types';

interface UseGeoReturn {
  currentLocation: MapLocation | null;
  loading: boolean;
  error: Error | null;
  requestLocation: () => void;
}

/**
 * Coded by Gemini
 * 
 * Provides geolocation services, including fetching the user's current
 * position and continuously watching for updates.
 */
export const useGeo = (watch: boolean = false): UseGeoReturn => {
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handlePositionSuccess = (position: GeolocationPosition) => {
    const newLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setCurrentLocation(newLocation);
    setLoading(false);
    setError(null);
  };

  const handlePositionError = (geoError: GeolocationPositionError) => {
    console.error("Geolocation error:", geoError);
    setError(new Error(geoError.message));
    setLoading(false);
  };

  const requestLocation = () => {
    setLoading(true);
    googleMapsService.getCurrentPosition()
      .then(handlePositionSuccess)
      .catch(handlePositionError);
  };

  useEffect(() => {
    requestLocation(); // Initial request

    if (watch) {
      const id = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      return () => {
        if (id) {
          navigator.geolocation.clearWatch(id);
        }
      };
    }
  }, [watch]);

  return { currentLocation, loading, error, requestLocation };
}; 