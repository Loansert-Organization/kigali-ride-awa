
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Car, Phone, MessageCircle } from 'lucide-react';
import type { TripWithBooking } from '@/types/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripWithBooking | null;
  onConfirmBooking?: (tripId: string) => void;
  onWhatsAppContact?: (trip: TripWithBooking) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  trip,
  onConfirmBooking,
  onWhatsAppContact
}) => {
  if (!trip) return null;

  const handleConfirmBooking = () => {
    onConfirmBooking?.(trip.id);
  };

  const handleWhatsAppContact = () => {
    onWhatsAppContact?.(trip);
  };

  const formatScheduledTime = (timeString?: string) => {
    if (!timeString) return 'Not specified';
    
    try {
      return new Date(timeString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trip Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">From</p>
                    <p className="font-medium">{trip.from_location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">To</p>
                    <p className="font-medium">{trip.to_location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-1 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Departure</p>
                    <p className="font-medium">{formatScheduledTime(trip.scheduled_time)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{trip.vehicle_type || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">{trip.seats_available || 1} seats</span>
                  </div>
                </div>

                {trip.fare && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fare</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">RWF {trip.fare.toLocaleString()}</span>
                        {trip.is_negotiable && (
                          <Badge variant="outline" className="text-xs">Negotiable</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {trip.description && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm">{trip.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleWhatsAppContact}
              className="flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </Button>

            <Button
              onClick={handleConfirmBooking}
              className="flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Book Now</span>
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By booking, you agree to coordinate directly with the driver via WhatsApp or phone.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
