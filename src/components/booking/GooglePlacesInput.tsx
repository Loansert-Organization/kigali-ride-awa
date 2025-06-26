
import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!inputRef.current) {
      console.warn('⚠️ GooglePlacesInput: Input ref not available');
      return;
    }

    if (!window.google?.maps?.places) {
      console.warn('⚠️ GooglePlacesInput: Google Maps Places not available yet');
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
          fields: ['formatted_address', 'geometry']
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
        } else {
          console.warn('⚠️ Invalid place selected - missing address or geometry');
        }
      });

      console.log('✅ Google Places Autocomplete initialized');
      
      return () => {
        console.log('🧹 Cleaning up Google Places listener');
        if (listener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('❌ Failed to initialize Google Places Autocomplete:', error);
    }
  }, [onChange]);

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
        placeholder={placeholder}
        className={`pl-10 h-12 text-base ${className}`}
      />
    </div>
  );
};

export default GooglePlacesInput;
