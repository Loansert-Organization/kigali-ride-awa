
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-mobile";
import TripSummaryBlock from "./modal/TripSummaryBlock";
import DetailsBlock from "./modal/DetailsBlock";
import AcceptRequestButtonBlock from "./modal/AcceptRequestButtonBlock";
import WhatsAppButtonBlock from "./modal/WhatsAppButtonBlock";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare?: number;
  seats_available: number;
  description?: string;
  user?: {
    promo_code: string;
  };
}

interface PassengerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onAccept: (tripId: string) => Promise<void>;
  onWhatsAppContact: (trip: Trip) => void;
}

const PassengerRequestModal: React.FC<PassengerRequestModalProps> = ({
  isOpen,
  onClose,
  trip,
  onAccept,
  onWhatsAppContact
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!trip) return null;

  const content = (
    <div className="space-y-4">
      <TripSummaryBlock
        fromLocation={trip.from_location}
        toLocation={trip.to_location}
        scheduledTime={trip.scheduled_time}
      />
      
      <DetailsBlock
        vehicleType={trip.vehicle_type}
        fare={trip.fare}
        seatsAvailable={trip.seats_available}
        description={trip.description}
      />
      
      <div className="space-y-2">
        <AcceptRequestButtonBlock
          tripId={trip.id}
          onAccept={onAccept}
        />
        
        <WhatsAppButtonBlock
          trip={trip}
          onWhatsAppContact={onWhatsAppContact}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              📍 Passenger Request Details
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-6">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            📍 Passenger Request Details
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default PassengerRequestModal;
