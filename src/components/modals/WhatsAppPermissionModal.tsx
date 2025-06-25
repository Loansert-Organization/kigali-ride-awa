
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink, AlertTriangle } from 'lucide-react';

interface WhatsAppPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppLaunch: () => void;
  driverName?: string;
  tripDetails?: string;
}

export const WhatsAppPermissionModal: React.FC<WhatsAppPermissionModalProps> = ({
  isOpen,
  onClose,
  onWhatsAppLaunch,
  driverName = "Driver",
  tripDetails = "your ride"
}) => {
  const [hasLaunched, setHasLaunched] = useState(false);

  const handleLaunchWhatsApp = () => {
    onWhatsAppLaunch();
    setHasLaunched(true);
    setTimeout(() => {
      onClose();
      setHasLaunched(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Contact via WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!hasLaunched ? (
            <>
              <div className="text-center py-4">
                <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Connect</h3>
                <p className="text-gray-600 text-sm">
                  You're about to contact <strong>{driverName}</strong> about {tripDetails}.
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <MessageCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">WhatsApp will open with:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Pre-filled trip details</li>
                      <li>• Your pickup location</li>
                      <li>• Scheduled time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Make sure WhatsApp is installed on your device.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleLaunchWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-green-900">Opening WhatsApp...</h3>
              <p className="text-gray-600 text-sm">Please check your device for the WhatsApp app.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
