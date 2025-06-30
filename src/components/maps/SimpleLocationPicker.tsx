import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapLocation } from '@/types';
import { Search, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { countryDetectionService } from '@/services/CountryDetectionService';

interface SimpleLocationPickerProps {
  onLocationSelect: (location: MapLocation) => void;
  placeholder?: string;
  selectedLocation?: MapLocation | null;
  showCurrentLocation?: boolean;
  type?: 'pickup' | 'destination';
}

// Common locations for testing without API
const getCommonLocations = (country: string) => {
  const locations: Record<string, Array<{name: string, lat: number, lng: number}>> = {
    'RW': [
      { name: 'Kigali City Centre', lat: -1.9441, lng: 30.0619 },
      { name: 'Kigali International Airport', lat: -1.9686, lng: 30.1395 },
      { name: 'Nyabugogo', lat: -1.9320, lng: 30.0445 },
      { name: 'Kimisagara', lat: -1.9555, lng: 30.0580 },
      { name: 'Remera', lat: -1.9470, lng: 30.1067 },
      { name: 'Gikondo', lat: -1.9761, lng: 30.0717 },
    ],
    'GH': [
      { name: 'Accra Central', lat: 5.5560, lng: -0.1969 },
      { name: 'Kumasi', lat: 6.6884, lng: -1.6244 },
      { name: 'Tema', lat: 5.6698, lng: -0.0166 },
    ],
    'TZ': [
      { name: 'Dar es Salaam Centre', lat: -6.7924, lng: 39.2083 },
      { name: 'Dodoma', lat: -6.1730, lng: 35.7419 },
      { name: 'Arusha', lat: -3.3869, lng: 36.6830 },
    ]
  };
  
  return locations[country] || locations['RW'];
};

export const SimpleLocationPicker = ({ 
  onLocationSelect, 
  placeholder = "Search for a location...",
  selectedLocation,
  showCurrentLocation = false,
  type = 'destination'
}: SimpleLocationPickerProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const [search, setSearch] = useState(selectedLocation?.address || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const userCountry = user?.country || 'RW';
  const countryInfo = countryDetectionService.getCountryByCode(userCountry);
  const commonLocations = getCommonLocations(userCountry);

  const filteredLocations = commonLocations.filter(location =>
    location.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLocationSelect = (location: {name: string, lat: number, lng: number}) => {
    const mapLocation: MapLocation = {
      lat: location.lat,
      lng: location.lng,
      address: location.name
    };
    
    setSearch(location.name);
    setShowSuggestions(false);
    onLocationSelect(mapLocation);
    
    toast({
      title: "Location Selected",
      description: location.name,
    });
  };

  const handleCurrentLocation = async () => {
    setIsDetectingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      const location: MapLocation = {
        ...coords,
        address: `Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
      };
      
      setSearch(location.address);
      onLocationSelect(location);
      
      toast({
        title: "Location Detected",
        description: "Current location set successfully",
      });
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

  const handleInputChange = (value: string) => {
    setSearch(value);
    setShowSuggestions(value.length > 0);
  };

  return (
    <div className="space-y-3">
      {/* Main Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(search.length > 0)}
          className="pl-10"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location, index) => (
                  <div 
                    key={index}
                    onClick={() => handleLocationSelect(location)} 
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-gray-500">
                        {countryInfo?.name} {countryInfo?.flag}
                      </div>
                    </div>
                  </div>
                ))
              ) : search.length > 0 ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="text-sm">No locations found for "{search}"</div>
                  <div className="text-xs mt-1">
                    Try: {commonLocations.slice(0, 3).map(l => l.name).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Popular locations:</div>
                  {commonLocations.slice(0, 5).map((location, index) => (
                    <div 
                      key={index}
                      onClick={() => handleLocationSelect(location)} 
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2"
                    >
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{location.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Location Button */}
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
          {isDetectingLocation ? 'Detecting Location...' : 'Use Current Location'}
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

      {/* Info Message */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
        💡 Showing popular locations for {countryInfo?.name || 'your country'}. 
        Google Maps integration will provide more precise search results.
      </div>
    </div>
  );
}; 