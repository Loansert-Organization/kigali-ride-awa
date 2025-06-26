
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        // Check if Google Maps is available
        if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps Places API not available');
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'rw' }, // Restrict to Rwanda
          fields: ['place_id', 'formatted_address', 'geometry', 'name']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address && place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            onChange(place.formatted_address, { lat, lng });
          } else if (place.name) {
            onChange(place.name);
          }
        });

        autocompleteRef.current = autocomplete;
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.warn('Google Places autocomplete initialization failed:', err);
        setError('Location autocomplete unavailable');
        setIsLoaded(false);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      initializeAutocomplete();
    } else {
      // Wait for Google Maps to load with a reasonable timeout
      const checkGoogleMaps = () => {
        if (window.google?.maps?.places) {
          clearTimeout(timeoutId);
          initializeAutocomplete();
        } else {
          timeoutId = setTimeout(checkGoogleMaps, 500);
        }
      };
      
      checkGoogleMaps();

      // Set a maximum timeout of 10 seconds
      const maxTimeout = setTimeout(() => {
        clearTimeout(timeoutId);
        if (!isLoaded) {
          setError('Location services temporarily unavailable');
          setIsLoaded(false);
        }
      }, 10000);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(maxTimeout);
      };
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={error ? "Enter location manually..." : placeholder}
        className={className}
      />
      {error && (
        <p className="text-xs text-orange-600 mt-1">
          ℹ️ {error} - manual entry enabled
        </p>
      )}
    </div>
  );
};

export default GooglePlacesInput;
