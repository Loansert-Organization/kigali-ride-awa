
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation({
        ...initialLocation,
        address: 'Selected location'
      });
    }
  }, [initialLocation]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Select Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Map will be implemented here</p>
          </div>
          
          {selectedLocation && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedLocation}>
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapPickerModal;
