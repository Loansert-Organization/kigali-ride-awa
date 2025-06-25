
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: (position?: GeolocationPosition) => void;
  onPermissionDenied: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const requestLocation = async () => {
    setIsRequesting(true);
    
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionStatus('granted');
        setIsRequesting(false);
        onPermissionGranted(position);
        setTimeout(() => onClose(), 1000);
      },
      (error) => {
        console.error('Location error:', error);
        setPermissionStatus('denied');
        setIsRequesting(false);
        onPermissionDenied();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleManualEntry = () => {
    onPermissionDenied();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Permission
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {permissionStatus === 'idle' && (
            <>
              <div className="text-center py-4">
                <MapPin className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enable Location</h3>
                <p className="text-gray-600 text-sm">
                  We need your location to find nearby drivers and provide accurate pickup points.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Why we need this:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Find drivers near you</li>
                  <li>• Auto-fill pickup location</li>
                  <li>• Show accurate distances</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleManualEntry}
                  className="flex-1"
                >
                  Manual Entry
                </Button>
                <Button
                  onClick={requestLocation}
                  disabled={isRequesting}
                  className="flex-1"
                >
                  {isRequesting ? 'Requesting...' : 'Allow Location'}
                </Button>
              </div>
            </>
          )}

          {permissionStatus === 'granted' && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-900">Permission Granted!</h3>
              <p className="text-gray-600 text-sm">Your location has been detected successfully.</p>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="text-center py-4">
              <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-orange-900">Location Unavailable</h3>
              <p className="text-gray-600 text-sm mb-4">
                You can still use the app by entering locations manually.
              </p>
              <Button onClick={onClose} className="w-full">
                Continue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
