
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (position: GeolocationPosition) => void;
  onLocationDenied: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationGranted,
  onLocationDenied
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsRequesting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        onLocationGranted(position);
        onClose();
      },
      (error) => {
        setIsRequesting(false);
        let errorMessage = "Unable to access your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const skipLocation = () => {
    onLocationDenied();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
            Enable Location Access
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Find Better Rides Near You</h3>
            <p className="text-gray-600 text-sm">
              Allow location access to see nearby drivers and get accurate pickup estimates.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={requestLocation}
              disabled={isRequesting}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isRequesting ? 'Getting Location...' : 'Allow Location Access'}
            </Button>

            <Button
              onClick={skipLocation}
              variant="outline"
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>🔒 Your location is only used to improve your ride experience</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
