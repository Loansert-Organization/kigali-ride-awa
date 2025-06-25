
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, DollarSign, MessageCircle, Phone } from 'lucide-react';
import { useBookingFlow } from '@/hooks/useBookingFlow';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengerTrip?: any;
  driverTrip?: any;
  userRole: 'passenger' | 'driver';
  onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  passengerTrip,
  driverTrip,
  userRole,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createBooking, confirmBooking, launchWhatsApp, isLoading } = useBookingFlow();

  const trip = userRole === 'passenger' ? driverTrip : passengerTrip;
  
  if (!trip) return null;

  const handleCreateBooking = async () => {
    if (!passengerTrip || !driverTrip) return;
    
    setIsProcessing(true);
    const success = await createBooking(passengerTrip.id, driverTrip.id);
    if (success) {
      onSuccess?.();
      onClose();
    }
    setIsProcessing(false);
  };

  const handleConfirmBooking = async () => {
    if (!trip.booking_id) return;
    
    setIsProcessing(true);
    const success = await confirmBooking(trip.booking_id);
    if (success) {
      onSuccess?.();
      onClose();
    }
    setIsProcessing(false);
  };

  const handleWhatsAppLaunch = () => {
    launchWhatsApp(trip.contact_phone, trip);
  };

  const isDriver = userRole === 'driver';
  const canConfirm = isDriver && trip.booking_id && !trip.confirmed;
  const isConfirmed = trip.confirmed;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isDriver ? '🚖 Passenger Request' : '🧑‍🦱 Driver Trip'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Details */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">From</p>
                <p className="text-gray-600">{trip.from_location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">To</p>
                <p className="text-gray-600">{trip.to_location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Time</p>
                <p className="text-gray-600">
                  {new Date(trip.scheduled_time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Vehicle & Seats</p>
                <p className="text-gray-600">
                  {trip.vehicle_type} • {trip.seats_available} seats
                </p>
              </div>
            </div>

            {trip.fare && (
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Fare</p>
                  <p className="text-gray-600">
                    {trip.fare} RWF {trip.is_negotiable && '(Negotiable)'}
                  </p>
                </div>
              </div>
            )}

            {trip.description && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{trip.description}</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant={isConfirmed ? 'default' : 'secondary'}>
              {isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!trip.booking_id && (
              <Button 
                onClick={handleCreateBooking}
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                {isProcessing ? 'Creating...' : `${isDriver ? 'Accept Request' : 'Request This Trip'}`}
              </Button>
            )}

            {canConfirm && (
              <Button 
                onClick={handleConfirmBooking}
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                {isProcessing ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            )}

            {isConfirmed && (
              <div className="space-y-2">
                <Button 
                  onClick={handleWhatsAppLaunch}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                </Button>
                
                {trip.contact_phone && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`tel:${trip.contact_phone}`)}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call {trip.contact_phone}
                  </Button>
                )}
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
