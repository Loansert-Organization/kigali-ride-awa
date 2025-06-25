
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Navigation, Map, Plus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import LocationPicker from '@/components/maps/LocationPicker';
import { googleMapsService } from '@/services/GoogleMapsService';

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface LocationInputBlockProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  favorites?: Favorite[];
  showGPS?: boolean;
  showMapPicker?: boolean;
  placeholder?: string;
}

const LocationInputBlock: React.FC<LocationInputBlockProps> = ({
  label,
  value,
  onChange,
  favorites = [],
  showGPS = true,
  showMapPicker = true,
  placeholder = "Enter location"
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [showMapPickerDialog, setShowMapPickerDialog] = useState(false);

  const handleUseMyLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await googleMapsService.getCurrentLocation();
      const address = await googleMapsService.geocodeLocation(
        new window.google.maps.LatLng(location.lat, location.lng)
      );
      
      onChange(address, location);
      
      toast({
        title: "Location detected",
        description: "Using your current location",
      });
    } catch (error) {
      toast({
        title: "Location not available",
        description: "Please enter your location manually",
        variant: "destructive"
      });
      setManualInput(true);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleFavoriteSelect = (favorite: Favorite) => {
    onChange(favorite.address, favorite.lat && favorite.lng ? {
      lat: favorite.lat,
      lng: favorite.lng
    } : undefined);
  };

  const handleMapSelection = (location: { lat: number; lng: number; address: string }) => {
    onChange(location.address, { lat: location.lat, lng: location.lng });
    setShowMapPickerDialog(false);
  };

  const getEmojiForLabel = (label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (lowercaseLabel.includes('home') || lowercaseLabel.includes('house')) return '🏠';
    if (lowercaseLabel.includes('work') || lowercaseLabel.includes('office')) return '🏢';
    if (lowercaseLabel.includes('church') || lowercaseLabel.includes('cathedral')) return '⛪';
    if (lowercaseLabel.includes('market') || lowercaseLabel.includes('shop')) return '🛒';
    if (lowercaseLabel.includes('school') || lowercaseLabel.includes('university')) return '🎓';
    if (lowercaseLabel.includes('hospital') || lowercaseLabel.includes('clinic')) return '🏥';
    if (lowercaseLabel.includes('gym') || lowercaseLabel.includes('fitness')) return '💪';
    if (lowercaseLabel.includes('restaurant') || lowercaseLabel.includes('cafe')) return '🍽️';
    return '⭐';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{label}</h3>
        
        {!manualInput ? (
          <div className="space-y-3">
            {showGPS && (
              <Button
                onClick={handleUseMyLocation}
                disabled={isGettingLocation}
                className="w-full justify-start h-12"
                variant="outline"
              >
                <Navigation className="w-5 h-5 mr-3" />
                {isGettingLocation ? "Getting location..." : "📍 Use my location"}
              </Button>
            )}
            
            {showMapPicker && (
              <Dialog open={showMapPickerDialog} onOpenChange={setShowMapPickerDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start h-12"
                    variant="outline"
                  >
                    <Map className="w-5 h-5 mr-3" />
                    🗺️ Pick on map
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Select Location on Map</DialogTitle>
                  </DialogHeader>
                  <LocationPicker
                    onLocationSelect={handleMapSelection}
                    placeholder="Search for a location..."
                    height="60vh"
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              onClick={() => setManualInput(true)}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <Plus className="w-5 h-5 mr-3" />
              ⌨️ Type manually
            </Button>
            
            {favorites.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">⭐ Your Favorites</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/favorites', '_blank')}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Manage →
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {favorites.slice(0, 4).map((favorite) => (
                    <Button
                      key={favorite.id}
                      onClick={() => handleFavoriteSelect(favorite)}
                      className="w-full justify-start h-auto p-3 text-left"
                      variant="ghost"
                    >
                      <span className="text-lg mr-2">{getEmojiForLabel(favorite.label)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{favorite.label}</p>
                        <p className="text-xs text-gray-500 truncate">{favorite.address}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-12"
            />
            <Button
              onClick={() => setManualInput(false)}
              variant="ghost"
              size="sm"
            >
              ← Back to options
            </Button>
          </div>
        )}
        
        {value && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm font-medium text-green-800">{value}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationInputBlock;
