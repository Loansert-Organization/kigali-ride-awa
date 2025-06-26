
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
    if (!inputRef.current || !window.google?.maps?.places) return;

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
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address && place?.geometry?.location) {
        onChange(
          place.formatted_address,
          {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        );
      }
    });

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 h-12 text-base ${className}`}
      />
    </div>
  );
};

export default GooglePlacesInput;
