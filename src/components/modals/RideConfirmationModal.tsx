
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, MessageCircle, Phone, Navigation } from 'lucide-react';

interface RideConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    vehicle_type: string;
    fare?: number;
    description?: string;
  };
  driver?: {
    promo_code: string;
    phone_number?: string;
    vehicle_type: string;
    plate_number?: string;
  };
  onWhatsAppContact: () => void;
  onPhoneContact: () => void;
  onOpenMaps: () => void;
}

export const RideConfirmationModal: React.FC<RideConfirmationModalProps> = ({
  isOpen,
  onClose,
  trip,
  driver,
  onWhatsAppContact,
  onPhoneContact,
  onOpenMaps
}) => {
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (vehicleType: string) => {
    const icons = {
      moto: '🛵',
      car: '🚗',
      tuktuk: '🛺',
      minibus: '🚐'
    };
    return icons[vehicleType as keyof typeof icons] || '🚗';
  };

  const handleContact = (method: 'whatsapp' | 'phone') => {
    setContactMethod(method);
    if (method === 'whatsapp') {
      onWhatsAppContact();
    } else {
      onPhoneContact();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600">
            🎉 Ride Confirmed!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Trip Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getVehicleIcon(trip.vehicle_type)}</span>
                <div>
                  <p className="font-semibold text-green-800">Your ride is confirmed</p>
                  <p className="text-sm text-green-600">Trip ID: {trip.id.slice(0, 8)}</p>
                </div>
              </div>
              <Badge className="bg-green-600">
                <Clock className="w-3 h-3 mr-1" />
                {formatDateTime(trip.scheduled_time)}
              </Badge>
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Pickup</p>
                <p className="text-gray-900">{trip.from_location}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Destination</p>
                <p className="text-gray-900">{trip.to_location}</p>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {driver && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Driver: {driver.promo_code}</p>
                  {driver.plate_number && (
                    <p className="text-sm text-gray-600">Vehicle: {driver.plate_number}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fare */}
          {trip.fare && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Estimated Fare</p>
              <p className="text-2xl font-bold text-purple-600">
                RWF {trip.fare.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Pay driver directly in cash or MoMo</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleContact('whatsapp')}
                className="bg-green-600 hover:bg-green-700"
                disabled={!driver?.phone_number}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                onClick={() => handleContact('phone')}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                disabled={!driver?.phone_number}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>

            <Button
              onClick={onOpenMaps}
              variant="outline"
              className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Next Steps:</strong> Contact your driver to coordinate pickup details and confirm your location
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
