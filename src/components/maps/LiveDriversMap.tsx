
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { googleMapsService } from '@/services/GoogleMapsService';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  vehicle_type: string;
  is_online: boolean;
  name?: string;
}

interface LiveDriversMapProps {
  drivers: Driver[];
  currentLocation: { lat: number; lng: number } | null;
  onDriverSelect?: (driver: Driver) => void;
  height?: string;
  showControls?: boolean;
}

const LiveDriversMap: React.FC<LiveDriversMapProps> = ({
  drivers,
  currentLocation,
  onDriverSelect,
  height = "400px",
  showControls = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateDriverMarkers();
    }
  }, [drivers]);

  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      updateUserLocation();
    }
  }, [currentLocation]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const center = currentLocation || { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
      
      const map = await googleMapsService.initializeMap(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e6f3ff' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      
      if (currentLocation) {
        updateUserLocation();
      }
      
      updateDriverMarkers();
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
      setIsLoading(false);
      toast({
        title: "Map Error",
        description: "Could not load the map. Please check your internet connection.",
        variant: "destructive"
      });
    }
  };

  const updateUserLocation = () => {
    if (!mapInstanceRef.current || !currentLocation) return;

    // Add user location marker
    new window.google.maps.Marker({
      position: currentLocation,
      map: mapInstanceRef.current,
      icon: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      },
      title: 'Your Location',
      zIndex: 1000
    });

    // Center map on user location
    mapInstanceRef.current.setCenter(currentLocation);
  };

  const updateDriverMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new driver markers
    drivers.forEach(driver => {
      if (driver.is_online) {
        const marker = new window.google.maps.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map: mapInstanceRef.current,
          icon: {
            url: getVehicleIconDataUrl(driver.vehicle_type),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          },
          title: `${driver.vehicle_type} Driver${driver.name ? ` - ${driver.name}` : ''}`,
          animation: window.google.maps.Animation.DROP
        });

        // Add click listener
        marker.addListener('click', () => {
          if (onDriverSelect) {
            onDriverSelect(driver);
          }
        });

        markersRef.current.push(marker);
      }
    });
  };

  const getVehicleIconDataUrl = (vehicleType: string): string => {
    const colors = {
      moto: '#FF9500',
      car: '#10B981',
      tuktuk: '#8B5CF6',
      minibus: '#06B6D4'
    };

    const color = colors[vehicleType as keyof typeof colors] || colors.car;
    
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${color}"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
        <text x="20" y="26" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">
          ${vehicleType === 'moto' ? '🛵' : vehicleType === 'car' ? '🚗' : vehicleType === 'tuktuk' ? '🛺' : '🚐'}
        </text>
      </svg>
    `;

    return 'data:image/svg+xml;base64,' + btoa(svg);
  };

  const handleRefresh = () => {
    initializeMap();
    toast({
      title: "Map Refreshed",
      description: "Updated driver locations"
    });
  };

  const centerOnUser = async () => {
    if (!mapInstanceRef.current) return;

    try {
      const location = await googleMapsService.getCurrentLocation();
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(15);
      
      toast({
        title: "Location Found",
        description: "Centered map on your location"
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <Card style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">Failed to load map</p>
            <Button onClick={initializeMap} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ height }} className="relative overflow-hidden">
      <CardContent className="p-0 h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {showControls && (
          <div className="absolute top-4 right-4 space-y-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={centerOnUser}
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Driver count overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {drivers.filter(d => d.is_online).length} drivers online
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveDriversMap;
