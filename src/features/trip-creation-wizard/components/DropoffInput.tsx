import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { googleMapsService } from '@/services/GoogleMapsService';
import { countryDetectionService } from '@/services/CountryDetectionService';
import { MapLocation } from '@/types';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface DropoffInputProps {
  label: string;
  placeholder: string;
  onSelect: (location: MapLocation) => void;
  value?: MapLocation | null;
  pickupLocation?: MapLocation | null;
}

export const DropoffInput = ({ 
  label, 
  placeholder, 
  onSelect,
  value,
  pickupLocation 
}: DropoffInputProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  
  const [search, setSearch] = useState(value?.address || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const userCountry = user?.country || 'RW';
  const countryInfo = countryDetectionService.getCountryByCode(userCountry);
  const mapCenter = countryInfo?.center || { lat: -1.9441, lng: 30.0619 };

  const validateSelection = (location: MapLocation): boolean => {
    if (pickupLocation && location.address === pickupLocation.address) {
      setValidationError("Pickup and drop-off must be different.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    setValidationError(null);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const results = await googleMapsService.getCountryAutocomplete(
            query,
            userCountry,
            mapCenter,
            100000
          );
          setPredictions(results);
        } catch (error) {
          console.error("Autocomplete failed", error);
          setPredictions([]);
        }
      }, 300);
      
      setSearchTimeout(timeout);
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      setPredictions([]);
      setSearch(prediction.description);
      
      const placesService = await googleMapsService.getPlacesService();
      
      placesService.getDetails({ 
        placeId: prediction.place_id, 
        fields: ['geometry', 'formatted_address', 'name'] 
      }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location: MapLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || prediction.description
          };
          
          if (validateSelection(location)) {
            onSelect(location);
          } else {
            setSearch('');
          }
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

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center gap-2">
        📍 {label}
      </Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className={`pl-10 h-12 text-base ${validationError ? 'border-destructive' : ''}`}
        />
        
        {predictions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {predictions.map(prediction => (
                <div 
                  key={prediction.place_id} 
                  onClick={() => handlePredictionSelect(prediction)} 
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting?.secondary_text || ''}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {validationError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {validationError}
        </div>
      )}

      {value && !validationError && (
        <div className="text-sm text-muted-foreground bg-accent p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-red-600" />
            <span className="flex-1">{value.address}</span>
          </div>
        </div>
      )}
    </div>
  );
};