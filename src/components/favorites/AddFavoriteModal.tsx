
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import LocationPicker from '@/components/maps/LocationPicker';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { label: string; address: string; lat?: number; lng?: number }) => void;
}

const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setLabel('');
    setAddress('');
    setCoordinates(null);
    setShowMapPicker(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleMapSelection = (location: { lat: number; lng: number; address: string }) => {
    setAddress(location.address);
    setCoordinates({ lat: location.lat, lng: location.lng });
    setShowMapPicker(false);
  };

  const handleSave = async () => {
    if (!label.trim() || !address.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        label: label.trim(),
        address: address.trim(),
        lat: coordinates?.lat,
        lng: coordinates?.lng
      });
      handleReset();
    } catch (error) {
      console.error('Error saving favorite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuggestedLabels = () => [
    '🏠 Home',
    '🏢 Work',
    '⛪ Church',
    '🛒 Market',
    '🎓 School',
    '🏥 Hospital',
    '💪 Gym',
    '🍽️ Restaurant'
  ];

  if (showMapPicker) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>📍 Pick Location on Map</DialogTitle>
          </DialogHeader>
          <LocationPicker
            onLocationSelect={handleMapSelection}
            placeholder="Search for a location..."
            height="60vh"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowMapPicker(false)}>
              ← Back to Form
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>➕ Add New Favorite</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Label Input */}
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Home, Work, Church"
              className="mt-1"
            />
            
            {/* Quick label suggestions */}
            <div className="mt-2 flex flex-wrap gap-1">
              {getSuggestedLabels().map((suggestedLabel) => (
                <Button
                  key={suggestedLabel}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLabel(suggestedLabel)}
                  className="text-xs h-6 px-2 text-gray-600 hover:bg-gray-100"
                >
                  {suggestedLabel}
                </Button>
              ))}
            </div>
          </div>

          {/* Address Input */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter the full address"
              className="mt-1"
            />
          </div>

          {/* Map Picker Button */}
          <Button
            variant="outline"
            onClick={() => setShowMapPicker(true)}
            className="w-full justify-start"
          >
            <MapPin className="w-4 h-4 mr-2" />
            🗺️ Pick on Map
          </Button>

          {/* Coordinates Display */}
          {coordinates && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">📍 Location Selected</p>
              <p className="text-xs text-green-600">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!label.trim() || !address.trim() || isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Saving...' : '⭐ Save Favorite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFavoriteModal;
