
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartMap } from '@/components/maps/SmartMap';
import { supabase } from "@/integrations/supabase/client";

interface SecureLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  initialCenter?: google.maps.LatLngLiteral;
}

export const SecureLocationPicker: React.FC<SecureLocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  placeholder = "Search for a location...",
  initialCenter = { lat: -1.9441, lng: 30.0619 } // Kigali
}) => {
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setSelectedLocation({ lat, lng });
    setIsGeocodingLoading(true);

    try {
      // Use Supabase edge function for reverse geocoding
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: { lat, lng }
      });

      if (error) {
        console.error('Geocoding error:', error);
        setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else if (data?.result?.formatted_address) {
        setAddress(data.result.formatted_address);
      } else {
        setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocodingLoading(false);
    }
  }, []);

  const handleConfirm = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setAddress('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>📍 Select Location on Map</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          <Input
            placeholder={placeholder}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full"
          />
          
          <div className="flex-1 rounded-lg overflow-hidden border">
            <SmartMap
              center={selectedLocation || initialCenter}
              zoom={15}
              height="100%"
              width="100%"
              markers={selectedLocation ? [selectedLocation] : []}
              onMapClick={handleMapClick}
            />
          </div>
          
          {isGeocodingLoading && (
            <p className="text-sm text-gray-600 text-center">
              🔄 Getting address...
            </p>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedLocation || !address}
              className="bg-purple-600 hover:bg-purple-700"
            >
              📍 Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
