
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Map } from 'lucide-react';
import DateTimeBlock from './DateTimeBlock';
import { TripData } from '@/types/api';

interface RouteInputBlockProps {
  fromLocation: string;
  toLocation: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  scheduledTime: string;
  onUpdate: (updates: Partial<TripData>) => void;
  onPickupMapOpen?: () => void;
  onDestinationMapOpen?: () => void;
  quickStartLocation?: { lat: number; lng: number };
}

const RouteInputBlock: React.FC<RouteInputBlockProps> = ({
  fromLocation,
  toLocation,
  scheduledTime,
  onUpdate,
  onPickupMapOpen,
  onDestinationMapOpen,
  quickStartLocation
}) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(!!fromLocation.includes('Current'));

  const handleUseCurrentLocation = async () => {
    if (quickStartLocation) {
      onUpdate({
        from_location: 'Current Location',
        from_lat: quickStartLocation.lat,
        from_lng: quickStartLocation.lng
      });
      setUseCurrentLocation(true);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onUpdate({
            from_location: 'Current Location',
            from_lat: position.coords.latitude,
            from_lng: position.coords.longitude
          });
          setUseCurrentLocation(true);
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">📍 Trip Route</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting from
              </label>
              {useCurrentLocation ? (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Navigation className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">📍 Current Location</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCurrentLocation(false);
                      onUpdate({ from_location: '', from_lat: undefined, from_lng: undefined });
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-600" />
                      <Input
                        placeholder="Enter pickup location"
                        value={fromLocation}
                        onChange={(e) => onUpdate({ from_location: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    {onPickupMapOpen && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPickupMapOpen}
                        className="px-3"
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    className="w-full"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    📍 Use Current Location
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Going to
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-600" />
                  <Input
                    placeholder="Enter destination"
                    value={toLocation}
                    onChange={(e) => onUpdate({ to_location: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {onDestinationMapOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDestinationMapOpen}
                    className="px-3"
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DateTimeBlock
        scheduledTime={scheduledTime}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default RouteInputBlock;
