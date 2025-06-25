
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import LocationPicker from './LocationPicker';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  title?: string;
  initialLocation?: { lat: number; lng: number };
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  title = "Select Location",
  initialLocation
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
      toast({
        title: "Location Selected",
        description: selectedLocation.address
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-0">
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
            height="60vh"
          />
        </div>

        {selectedLocation && (
          <div className="p-6 pt-0 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium">Location Selected</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{selectedLocation.address}</p>
              </div>
              <div className="flex space-x-3 ml-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-700">
                  Confirm Location
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
