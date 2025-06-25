
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { googleMapsService } from '@/services/GoogleMapsService';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  placeholder?: string;
  height?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a location",
  height = "400px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    if (!mapRef.current || !searchInputRef.current) return;

    try {
      setIsLoading(true);

      const center = initialLocation || { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
      
      const map = await googleMapsService.initializeMap(mapRef.current, {
        center,
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(-2.5, 28.8), // SW bounds for Rwanda
          new window.google.maps.LatLng(-1.0, 31.2)  // NE bounds for Rwanda
        ),
        strictBounds: false,
        types: ['establishment', 'geocode']
      });

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.geometry && place.geometry.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || ''
          };
          
          updateSelectedLocation(location);
          map.setCenter(location);
          map.setZoom(16);
        }
      });

      // Listen for map clicks
      map.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          try {
            const address = await googleMapsService.geocodeLocation(event.latLng);
            const location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              address
            };
            
            updateSelectedLocation(location);
            setSearchValue(address);
          } catch (error) {
            toast({
              title: "Geocoding Error",
              description: "Could not get address for this location",
              variant: "destructive"
            });
          }
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing location picker:', error);
      setIsLoading(false);
      toast({
        title: "Map Error",
        description: "Could not initialize location picker",
        variant: "destructive"
      });
    }
  };

  const updateSelectedLocation = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);

    // Update marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    if (mapInstanceRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzggNCA2IDcgNiAxMGMwIDUgNiAxMSA2IDExczYtNiA2LTExYzAtMy0yLTYtNi04WiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iIzhCNUNGNiIvPgo8L3N2Zz4KPC9zdmc+',
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        animation: window.google.maps.Animation.DROP,
        title: location.address
      });
    }
  };

  const useCurrentLocation = async () => {
    try {
      const location = await googleMapsService.getCurrentLocation();
      const address = await googleMapsService.geocodeLocation(
        new window.google.maps.LatLng(location.lat, location.lng)
      );
      
      const locationData = { ...location, address };
      updateSelectedLocation(locationData);
      setSearchValue(address);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(16);
      }
      
      toast({
        title: "Location Found",
        description: "Using your current location"
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location",
        variant: "destructive"
      });
    }
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      toast({
        title: "Location Selected",
        description: selectedLocation.address
      });
    }
  };

  return (
    <Card style={{ height }} className="relative overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Search header */}
        <div className="p-4 border-b bg-white">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10"
              />
            </div>
            <Button
              onClick={useCurrentLocation}
              variant="outline"
              size="sm"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse text-purple-600" />
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Cross-hair indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 border-2 border-purple-600 rounded-full bg-white/80"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Selection confirmation */}
        {selectedLocation && (
          <div className="p-4 border-t bg-white">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                onClick={confirmSelection}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Select
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
