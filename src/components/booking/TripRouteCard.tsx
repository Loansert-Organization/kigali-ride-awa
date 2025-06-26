
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Map } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import GooglePlacesInput from './GooglePlacesInput';

interface TripRouteCardProps {
  fromLocation: string;
  toLocation: string;
  onFromChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onToChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onPickupMapOpen?: () => void;
  onDestinationMapOpen?: () => void;
}

const TripRouteCard: React.FC<TripRouteCardProps> = ({
  fromLocation,
  toLocation,
  onFromChange,
  onToChange,
  onPickupMapOpen,
  onDestinationMapOpen
}) => {
  const handleUseCurrentLocation = async () => {
    console.log('📍 Requesting current location...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      toast({
        title: "Location not available",
        description: "Your device doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔍 Getting position...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      console.log('✅ Position obtained:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      // Reverse geocode to get address
      if (window.google?.maps) {
        console.log('🗺️ Reverse geocoding...');
        const geocoder = new window.google.maps.Geocoder();
        const latLng = new window.google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );

        geocoder.geocode({ location: latLng }, (results, status) => {
          console.log('📍 Geocoding result:', { status, results: results?.length });
          
          if (status === 'OK' && results && results[0]) {
            console.log('✅ Address found:', results[0].formatted_address);
            onFromChange(results[0].formatted_address, {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            toast({
              title: "Location detected! 📍",
              description: "Using your current location as pickup point"
            });
          } else {
            console.warn('⚠️ Geocoding failed, using coordinates only');
            onFromChange('Current Location', {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            toast({
              title: "Location detected! 📍",
              description: "Using your current coordinates"
            });
          }
        });
      } else {
        console.warn('⚠️ Google Maps not available, using coordinates only');
        onFromChange('Current Location', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast({
          title: "Location detected! 📍",
          description: "Using your current coordinates"
        });
      }
    } catch (error) {
      console.error('❌ Geolocation error:', error);
      const errorMsg = error instanceof GeolocationPositionError 
        ? `Location error: ${error.message}` 
        : 'Failed to get location';
      
      toast({
        title: "Location access denied",
        description: "Please enter your pickup location manually or enable location permissions",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">📍 Trip Route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting from
          </label>
          <GooglePlacesInput
            value={fromLocation}
            onChange={onFromChange}
            placeholder="Enter pickup location"
            className="mb-3"
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              className="flex-1 h-10"
            >
              <Navigation className="w-4 h-4 mr-2" />
              📍 Use Current Location
            </Button>
            {onPickupMapOpen && (
              <Button
                type="button"
                variant="outline"
                onClick={onPickupMapOpen}
                className="px-3 h-10"
              >
                <Map className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Going to
          </label>
          <GooglePlacesInput
            value={toLocation}
            onChange={onToChange}
            placeholder="Enter destination"
            className="mb-3"
          />
          
          {onDestinationMapOpen && (
            <Button
              type="button"
              variant="outline"
              onClick={onDestinationMapOpen}
              className="w-full h-10"
            >
              <Map className="w-4 h-4 mr-2" />
              📍 Pick on Map
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripRouteCard;
