import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { googleMapsService } from '@/services/GoogleMapsService';
import { countryDetectionService } from '@/services/CountryDetectionService';
import { MapLocation } from '@/types';
import { Search, MapPin, Crosshair, Map, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface LocationPickerProps {
  onLocationSelect: (location: MapLocation) => void;
  title?: string;
  placeholder?: string;
  selectedLocation?: MapLocation | null;
  showCurrentLocation?: boolean;
  type?: 'pickup' | 'destination';
}

export const LocationPicker = ({ 
  onLocationSelect, 
  title, 
  placeholder = "Search for a location...",
  selectedLocation,
  showCurrentLocation = false,
  type = 'destination'
}: LocationPickerProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const mapRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [search, setSearch] = useState(selectedLocation?.address || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [currentLocationDetected, setCurrentLocationDetected] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get user's country for location biasing
  const userCountry = user?.country || 'RW'; // Default to Rwanda
  const countryInfo = countryDetectionService.getCountryByCode(userCountry);
  const mapCenter = countryInfo?.center || { lat: -1.9441, lng: 30.0619 };

  // Debug logging
  useEffect(() => {
    console.log('LocationPicker mounted:', { type, userCountry, mapCenter });
  }, []);

  // Initialize Map when dialog opens
  useEffect(() => {
    if (isMapOpen && mapRef.current && !map) {
      console.log('Initializing map...');
      setIsMapLoading(true);
      
      const mapOptions: google.maps.MapOptions = {
        center: selectedLocation ? 
          { lat: selectedLocation.lat, lng: selectedLocation.lng } : 
          mapCenter,
        zoom: selectedLocation ? 16 : 13,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy',
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
          console.log('Map initialized successfully');
          setMap(mapInstance);
          setIsMapLoading(false);
          
          // If there's a selected location, add marker immediately
          if (selectedLocation) {
            addMapMarker({ lat: selectedLocation.lat, lng: selectedLocation.lng });
          }
        })
        .catch((error) => {
          console.error('Failed to initialize map:', error);
          setIsMapLoading(false);
          toast({
            title: "Map Error",
            description: "Failed to load map. Please check your internet connection.",
            variant: "destructive"
          });
        });
    }
  }, [isMapOpen, selectedLocation, mapCenter]);

  // Add map click listener
  useEffect(() => {
    if (!map) return;
    
    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        console.log('Map clicked:', e.latLng.lat(), e.latLng.lng());
        handleMapLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });
    
    return () => google.maps.event.removeListener(clickListener);
  }, [map]);

  const addMapMarker = (position: { lat: number, lng: number }) => {
    if (!map) return;
    
    console.log('Adding marker at:', position);
    
    // Remove existing marker
    if (marker) {
      marker.setMap(null);
    }
    
    // Create new marker
    const newMarker = new google.maps.Marker({ 
      position, 
      map, 
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: type === 'pickup' ? '#22c55e' : '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      title: type === 'pickup' ? 'Pickup Location' : 'Destination',
      draggable: true,
      animation: google.maps.Animation.DROP
    });
    
    // Make marker draggable
    newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        console.log('Marker dragged to:', e.latLng.lat(), e.latLng.lng());
        handleMapLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });
    
    setMarker(newMarker);
    map.panTo(position);
  };

  const handleMapLocationSelect = async (coords: { lat: number; lng: number }) => {
    console.log('Handling map location select:', coords);
    addMapMarker(coords);
    
    try {
      const results = await googleMapsService.geocode({ location: coords });
      if (results.length > 0) {
        const location: MapLocation = { 
          ...coords, 
          address: results[0].formatted_address 
        };
        console.log('Geocoded location:', location);
        setSearch(location.address || '');
        onLocationSelect(location);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      toast({
        title: "Location Error",
        description: "Unable to get address for this location",
        variant: "destructive"
      });
    }
  };

  const handleCurrentLocation = async () => {
    console.log('Getting current location...');
    setIsDetectingLocation(true);
    
    try {
      const position = await googleMapsService.getCurrentPosition();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log('Current position:', coords);
      
      const results = await googleMapsService.geocode({ location: coords });
      if (results.length > 0) {
        const location: MapLocation = {
          ...coords,
          address: results[0].formatted_address
        };
        
        console.log('Current location geocoded:', location);
        setSearch(location.address || '');
        setCurrentLocationDetected(true);
        onLocationSelect(location);
        
        toast({
          title: "Location Detected",
          description: "Current location set successfully",
        });
      }
    } catch (error) {
      console.error("Location detection failed", error);
      toast({
        title: "Location Error",
        description: "Unable to detect current location. Please enable location permissions.",
        variant: "destructive"
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSearch = async (query: string) => {
    console.log('Search input:', query);
    setSearch(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length > 2) {
      // Debounce search
      const timeout = setTimeout(async () => {
        try {
          console.log('Performing autocomplete search...');
          const autocompleteService = await googleMapsService.getAutocompleteService();
          
          // Enhanced search with country-specific biasing
          const request: google.maps.places.AutocompletionRequest = {
            input: query,
            componentRestrictions: { country: userCountry.toLowerCase() },
            location: new google.maps.LatLng(mapCenter.lat, mapCenter.lng),
            radius: 100000, // 100km radius around country center
            types: ['establishment', 'geocode'], // Include businesses and addresses
          };
          
          autocompleteService.getPlacePredictions(request, (preds, status) => {
            console.log('Autocomplete result:', status, preds?.length || 0, 'predictions');
            
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
              // Sort predictions to prioritize local results
              const sortedPreds = preds.sort((a, b) => {
                const countryName = countryInfo?.name.toLowerCase() || '';
                const aInCountry = a.description.toLowerCase().includes(countryName);
                const bInCountry = b.description.toLowerCase().includes(countryName);
                
                if (aInCountry && !bInCountry) return -1;
                if (!aInCountry && bInCountry) return 1;
                
                // If both mention country or neither, sort by relevance (Google's default order)
                return 0;
              });
              
              setPredictions(sortedPreds);
            } else {
              console.log('No predictions found or error:', status);
              setPredictions([]);
            }
          });
        } catch (error) {
          console.error("Autocomplete failed", error);
          setPredictions([]);
          toast({
            title: "Search Error",
            description: "Unable to search locations. Please check your internet connection.",
            variant: "destructive"
          });
        }
      }, 300); // 300ms debounce
      
      setSearchTimeout(timeout);
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    console.log('Prediction selected:', prediction.description);
    
    try {
      // Close predictions immediately for better UX
      setPredictions([]);
      setSearch(prediction.description);
      
      // Get places service
      const placesService = await googleMapsService.getPlacesService(map || undefined);
      
      placesService.getDetails({ 
        placeId: prediction.place_id, 
        fields: ['geometry', 'formatted_address', 'name', 'place_id'] 
      }, (place, status) => {
        console.log('Place details result:', status, place);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || place.name || prediction.description;
          const location: MapLocation = { lat, lng, address };
          
          console.log('Selected location:', location);
          onLocationSelect(location);
          
          // Update map marker if map is open
          if (map) {
            addMapMarker({ lat, lng });
          }
        } else {
          console.error('Place details failed:', status);
          toast({
            title: "Location Error",
            description: "Unable to get details for this location",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Place details failed", error);
      toast({
        title: "Location Error",
        description: "Unable to select this location",
        variant: "destructive"
      });
    }
  };

  const confirmMapSelection = () => {
    setIsMapOpen(false);
    toast({
      title: "Location Selected",
      description: "Location has been set from map",
    });
  };

  return (
    <div className="space-y-3">
      {title && <h3 className="font-semibold text-lg">{title}</h3>}
      
      {/* Main Input Row */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            data-destination-input={type === 'destination'}
          />
          
          {/* Autocomplete Dropdown */}
          {predictions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {predictions.map(prediction => (
                  <div 
                    key={prediction.place_id} 
                    onClick={() => handlePredictionSelect(prediction)} 
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {prediction.structured_formatting?.secondary_text || ''}
                      </div>
                      {countryInfo && prediction.description.toLowerCase().includes(countryInfo.name.toLowerCase()) && (
                        <div className="text-xs text-green-600 font-medium">
                          {countryInfo.flag} {countryInfo.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Picker Button */}
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Map className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Select {type === 'pickup' ? 'Pickup' : 'Destination'} Location
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 relative">
              {isMapLoading ? (
                <div className="w-full h-96 rounded-lg border flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Loading map...</span>
                </div>
              ) : (
                <div ref={mapRef} className="w-full h-96 rounded-lg border" />
              )}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Click on the map or drag the marker to select precise location
                </p>
                <Button onClick={confirmMapSelection} disabled={isMapLoading}>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Location Button (for pickup only) */}
      {showCurrentLocation && type === 'pickup' && (
        <Button 
          variant="outline" 
          onClick={handleCurrentLocation}
          disabled={isDetectingLocation}
          className="w-full"
        >
          {isDetectingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4 mr-2" />
          )}
          {isDetectingLocation ? 'Detecting Location...' : 
           currentLocationDetected ? 'Current Location ✓' : 'Use Current Location'}
        </Button>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
          <div className="flex items-start gap-2">
            <MapPin className={`w-4 h-4 mt-0.5 ${type === 'pickup' ? 'text-green-600' : 'text-red-600'}`} />
            <span className="flex-1">{selectedLocation.address}</span>
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {import.meta.env.MODE === 'development' && (
        <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
          <div>Country: {userCountry} ({countryInfo?.name})</div>
          <div>Search results: {predictions.length}</div>
          <div>Map center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
}; 