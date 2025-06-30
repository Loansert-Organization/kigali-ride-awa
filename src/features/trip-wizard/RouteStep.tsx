import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { TripDraft } from './TripWizard';
import { ArrowUpDown, MapPin, Navigation, Clock } from 'lucide-react';
import { googleMapsService } from '@/services/GoogleMapsService';
import { useToast } from '@/hooks/use-toast';

interface RouteStepProps {
  draft: TripDraft;
  onUpdate: (updates: Partial<TripDraft>) => void;
}

export const RouteStep = ({ draft, onUpdate }: RouteStepProps) => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    estimatedPrice?: number;
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: -1.9441, lng: 30.0619 }, // Kigali center
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      };

      googleMapsService.initializeMap(mapRef.current, mapOptions)
        .then((mapInstance) => {
          setMap(mapInstance);
          
          // Initialize directions renderer
          const renderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#3D7DFF',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });
          renderer.setMap(mapInstance);
          setDirectionsRenderer(renderer);
        })
        .catch(console.error);
    }
  }, []);

  // Calculate route when both locations are selected
  useEffect(() => {
    if (draft.origin && draft.destination && map && directionsRenderer) {
      calculateRoute();
    }
  }, [draft.origin, draft.destination, map, directionsRenderer]);

  const calculateRoute = async () => {
    if (!draft.origin || !draft.destination || !directionsRenderer) return;
    
    setIsCalculatingRoute(true);
    
    try {
      const directionsService = new google.maps.DirectionsService();
      
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(draft.origin.lat, draft.origin.lng),
        destination: new google.maps.LatLng(draft.destination.lat, draft.destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: true
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Update route info
          const routeData = {
            distance: leg.distance?.text || 'Unknown',
            duration: leg.duration?.text || 'Unknown'
          };
          
          // Calculate estimated price
          if (leg.distance?.value) {
            const distanceKm = leg.distance.value / 1000;
            const estimatedPrice = Math.round(distanceKm * 150 * draft.seats); // 150 RWF per km
            routeData.estimatedPrice = estimatedPrice;
            onUpdate({ estimatedPrice });
          }
          
          setRouteInfo(routeData);
          
          // Auto-zoom to fit route
          if (map) {
            map.fitBounds(route.bounds);
          }
        } else {
          console.error('Directions request failed:', status);
          toast({
            title: "Route Error",
            description: "Unable to calculate route between these locations",
            variant: "destructive"
          });
        }
        setIsCalculatingRoute(false);
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      setIsCalculatingRoute(false);
    }
  };

  const handleSwapLocations = () => {
    if (draft.origin && draft.destination) {
      onUpdate({
        origin: draft.destination,
        destination: draft.origin
      });
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleOriginSelect = (location: { lat: number; lng: number; address: string }) => {
    onUpdate({ 
      origin: location 
    });
  };

  const handleDestinationSelect = (location: { lat: number; lng: number; address: string }) => {
    onUpdate({ 
      destination: location 
    });
  };

  return (
    <div className="space-y-6">
      {/* Location Inputs */}
      <div className="space-y-4">
        <LocationPicker
          title="Pickup Location"
          placeholder="Where should we pick you up?"
          selectedLocation={draft.origin ? {
            lat: draft.origin.lat,
            lng: draft.origin.lng,
            address: draft.origin.address
          } : null}
          onLocationSelect={handleOriginSelect}
          showCurrentLocation={draft.role === 'passenger'}
          type="pickup"
        />
        
        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLocations}
            disabled={!draft.origin || !draft.destination}
            className="rounded-full w-10 h-10 p-0"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
        
        <LocationPicker
          title="Destination"
          placeholder="Where are you going?"
          selectedLocation={draft.destination ? {
            lat: draft.destination.lat,
            lng: draft.destination.lng,
            address: draft.destination.address
          } : null}
          onLocationSelect={handleDestinationSelect}
          type="destination"
        />
      </div>

      {/* Map Preview */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg"
            style={{ minHeight: '256px' }}
          />
          
          {/* Route Information Overlay */}
          {routeInfo && (
            <div className="p-4 bg-white border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{routeInfo.distance}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{routeInfo.duration}</span>
                  </div>
                </div>
                
                {routeInfo.estimatedPrice && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {routeInfo.estimatedPrice.toLocaleString()} RWF
                    </div>
                    <div className="text-xs text-gray-500">Estimated cost</div>
                  </div>
                )}
              </div>
              
              {isCalculatingRoute && (
                <div className="mt-2 text-xs text-blue-600">
                  Calculating best route...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Routes (Future Enhancement) */}
      {/* TODO: Implement localStorage-cached frequent routes */}
      
      {/* Helpful Tips */}
      {!draft.origin && !draft.destination && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Quick Tips</h4>
                <ul className="text-xs text-blue-800 mt-1 space-y-1">
                  <li>• Use "Current Location" for pickup if you're ready now</li>
                  <li>• Type landmarks, hotels, or addresses for precise locations</li>
                  <li>• Tap the map icon to select exact spots visually</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 