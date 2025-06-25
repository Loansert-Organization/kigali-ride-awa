
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import LocationPicker from '@/components/maps/LocationPicker';

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

interface EditFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { label: string; address: string; lat?: number; lng?: number }) => void;
  favorite: Favorite | null;
}

const EditFavoriteModal: React.FC<EditFavoriteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  favorite
}) => {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (favorite) {
      setLabel(favorite.label);
      setAddress(favorite.address);
      setCoordinates(favorite.lat && favorite.lng ? { lat: favorite.lat, lng: favorite.lng } : null);
    }
  }, [favorite]);

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
      console.error('Error updating favorite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showMapPicker) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>📍 Update Location on Map</DialogTitle>
          </DialogHeader>
          <LocationPicker
            onLocationSelect={handleMapSelection}
            placeholder="Search for a location..."
            height="60vh"
            initialLocation={coordinates || undefined}
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
          <DialogTitle>✏️ Edit Favorite</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Label Input */}
          <div>
            <Label htmlFor="edit-label">Label</Label>
            <Input
              id="edit-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Home, Work, Church"
              className="mt-1"
            />
          </div>

          {/* Address Input */}
          <div>
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
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
            🗺️ Update Location on Map
          </Button>

          {/* Coordinates Display */}
          {coordinates && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">📍 Current Location</p>
              <p className="text-xs text-blue-600">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Updating...' : '💾 Update Favorite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFavoriteModal;
