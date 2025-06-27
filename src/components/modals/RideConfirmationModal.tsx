
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, MessageSquare, Phone } from 'lucide-react';

interface RideConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    fare?: number;
  };
  onConfirm: (method: 'whatsapp' | 'call') => void;
}

const RideConfirmationModal: React.FC<RideConfirmationModalProps> = ({
  isOpen,
  onClose,
  trip,
  onConfirm
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'call' | null>(null);

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Ride</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Trip Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm">{trip.from_location}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm">{trip.to_location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm">{new Date(trip.scheduled_time).toLocaleString()}</span>
            </div>
            {trip.fare && (
              <div className="text-sm font-medium text-green-600">
                Fare: RWF {trip.fare.toLocaleString()}
              </div>
            )}
          </div>

          {/* Contact Method Selection */}
          <div>
            <h4 className="font-medium mb-3">How would you like to contact the driver?</h4>
            <div className="space-y-2">
              <Button
                variant={selectedMethod === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('whatsapp')}
                className="w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp Message
              </Button>
              <Button
                variant={selectedMethod === 'call' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('call')}
                className="w-full justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone Call
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedMethod}
              className="flex-1"
            >
              Confirm & Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RideConfirmationModal;
