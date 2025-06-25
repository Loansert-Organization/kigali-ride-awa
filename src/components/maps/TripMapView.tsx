
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, ExternalLink } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { googleMapsService } from '@/services/GoogleMapsService';

interface TripMapViewProps {
  fromLocation: { lat: number; lng: number; address: string };
  toLocation: { lat: number; lng: number; address: string };
  showRoute?: boolean;
  showNavigationButton?: boolean;
  height?: string;
  interactive?: boolean;
}

const TripMapView: React.FC<TripMapViewProps> = ({
  fromLocation,
  toLocation,
  showRoute = true,
  showNavigationButton = true,
  height = "300px",
  interactive = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMap();
  }, [fromLocation, toLocation]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);

      // Calculate center point between from and to
      const centerLat = (fromLocation.lat + toLocation.lat) / 2;
      const centerLng = (fromLocation.lng + toLocation.lng) / 2;

      const map = await googleMapsService.initializeMap(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 12,
        gestureHandling: interactive ? 'auto' : 'none',
        zoomControl: interactive,
        disableDefaultUI: !interactive
      });

      mapInstanceRef.current = map;

      // Add pickup marker
      new window.google.maps.Marker({
        position: fromLocation,
        map: map,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzggNCA2IDcgNiAxMGMwIDUgNiAxMSA2IDExczYtNiA2LTExYzAtMy0yLTYtNi04WiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4KPC9zdmc+',
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        title: `Pickup: ${fromLocation.address}`
      });

      // Add destination marker
      new window.google.maps.Marker({
        position: toLocation,
        map: map,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFRjQ0NDQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzggNCA2IDcgNiAxMGMwIDUgNiAxMSA2IDExczYtNiA2LTExYzAtMy0yLTYtNi04WiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iI0VGNDQzNCIvPgo8L3N2Zz4KPC9zdmc+',
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        title: `Destination: ${toLocation.address}`
      });

      if (showRoute) {
        // Calculate and display route
        try {
          await googleMapsService.calculateAndDisplayRoute(
            new window.google.maps.LatLng(fromLocation.lat, fromLocation.lng),
            new window.google.maps.LatLng(toLocation.lat, toLocation.lng)
          );
        } catch (error) {
          console.error('Error calculating route:', error);
        }
      }

      // Fit bounds to show both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(fromLocation);
      bounds.extend(toLocation);
      map.fitBounds(bounds);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing trip map:', error);
      setIsLoading(false);
      toast({
        title: "Map Error",
        description: "Could not load trip map",
        variant: "destructive"
      });
    }
  };

  const openInGoogleMaps = () => {
    const url = googleMapsService.getNavigationUrl(fromLocation, toLocation);
    window.open(url, '_blank');
    
    toast({
      title: "Opening Navigation",
      description: "Launching Google Maps with directions"
    });
  };

  return (
    <Card style={{ height }} className="relative overflow-hidden">
      <CardContent className="p-0 h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">Loading route...</p>
            </div>
          </div>
        )}

        {showNavigationButton && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={openInGoogleMaps}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navigate
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Trip info overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium truncate">{fromLocation.address}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium truncate">{toLocation.address}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripMapView;
