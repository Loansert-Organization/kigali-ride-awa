
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation } from 'lucide-react';
import SmartMap from '@/components/maps/SmartMap';

interface SecureLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onClose: () => void;
  title?: string;
}

const SecureLocationPicker: React.FC<SecureLocationPickerProps> = ({
  onLocationSelect,
  onClose,
  title = "Select Location"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleMapLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      const address = searchQuery || `Location (${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)})`;
      onLocationSelect({
        ...selectedLocation,
        address
      });
      onClose();
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setSelectedLocation(location);
      setSearchQuery('Current Location');
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {title}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          <Button
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        </div>

        <SmartMap
          className="h-64"
          onLocationSelect={handleMapLocationSelect}
          markers={selectedLocation ? [{ ...selectedLocation, title: 'Selected Location' }] : []}
        />

        {selectedLocation && (
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Selected Location</p>
              <p className="text-xs text-gray-600">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
            <Button onClick={handleConfirmLocation}>
              Confirm Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecureLocationPicker;
