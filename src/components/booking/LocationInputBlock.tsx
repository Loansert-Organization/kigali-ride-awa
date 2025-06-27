
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Search } from 'lucide-react';
import { createLocationHelpers } from '@/utils/locationHelpers';

interface LocationInputBlockProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  apiKey?: string;
}

const LocationInputBlock: React.FC<LocationInputBlockProps> = ({
  title,
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter location",
  apiKey = ""
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const locationHelpers = createLocationHelpers(apiKey);

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await locationHelpers.getCurrentLocation();
      const address = `Current Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
      onChange(address);
      onLocationSelect?.({
        lat: location.lat,
        lng: location.lng,
        address
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleGeocodeLocation = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      const location = await locationHelpers.geocodeLocation(address);
      onLocationSelect?.({
        lat: location.lat,
        lng: location.lng,
        address
      });
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Simulate location suggestions
    if (newValue.length > 2) {
      const mockSuggestions = [
        `${newValue} - Kigali City`,
        `${newValue} - Nyabugogo`,
        `${newValue} - Remera`,
        `${newValue} - Kimisagara`
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    handleGeocodeLocation(suggestion);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`location-${title}`}>Location</Label>
          <div className="relative">
            <Input
              id={`location-${title}`}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          
          {suggestions.length > 0 && (
            <div className="bg-white border rounded-md shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="w-full"
        >
          {isLoadingLocation ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Getting location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationInputBlock;
