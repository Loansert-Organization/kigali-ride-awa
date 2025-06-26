
import React, { useRef, useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from 'lucide-react';

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  className?: string;
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder,
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places) {
        console.log('✅ Google Maps Places API loaded');
        setIsGoogleLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    // If not loaded immediately, check periodically
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 500);

    // Clean up after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('⚠️ Google Maps Places API not loaded within 10 seconds');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!inputRef.current || !isGoogleLoaded) {
      return;
    }

    try {
      console.log('🔧 Initializing Google Places Autocomplete...');
      
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'rw' }, // Restrict to Rwanda
          fields: ['formatted_address', 'geometry', 'name']
        }
      );

      // Listen for place selection
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        console.log('📍 Place changed event triggered');
        const place = autocompleteRef.current?.getPlace();
        
        console.log('🔍 Place details:', {
          hasAddress: !!place?.formatted_address,
          hasGeometry: !!place?.geometry?.location,
          place: place
        });
        
        if (place?.formatted_address && place?.geometry?.location) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          console.log('✅ Valid place selected:', {
            address: place.formatted_address,
            coordinates
          });
          
          onChange(place.formatted_address, coordinates);
        } else if (place?.name && place?.geometry?.location) {
          // Fallback to place name if formatted_address is not available
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          console.log('✅ Place selected with name:', {
            name: place.name,
            coordinates
          });
          
          onChange(place.name, coordinates);
        } else {
          console.warn('⚠️ Invalid place selected - missing address or geometry');
        }
      });

      console.log('✅ Google Places Autocomplete initialized');
      
      return () => {
        console.log('🧹 Cleaning up Google Places listener');
        if (listener && window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('❌ Failed to initialize Google Places Autocomplete:', error);
    }
  }, [onChange, isGoogleLoaded]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          console.log('✏️ Manual input change:', e.target.value);
          onChange(e.target.value);
        }}
        placeholder={isGoogleLoaded ? placeholder : `${placeholder} (Loading...)`}
        className={`pl-10 h-12 text-base ${className}`}
        disabled={!isGoogleLoaded}
      />
      {!isGoogleLoaded && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesInput;
