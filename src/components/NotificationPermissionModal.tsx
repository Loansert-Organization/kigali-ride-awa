
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { requestPermission, isSupported } = usePushNotifications();

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Enable Notifications
          </DialogTitle>
          <DialogDescription className="text-left">
            Stay updated with real-time notifications about:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Trip confirmations and matches</li>
              <li>Driver updates and messages</li>
              <li>Booking status changes</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-3 mt-4">
          <Button 
            onClick={handleEnable} 
            disabled={isLoading}
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="w-full"
          >
            <BellOff className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionModal;
