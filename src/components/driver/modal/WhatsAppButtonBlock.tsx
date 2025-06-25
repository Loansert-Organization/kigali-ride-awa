
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';

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

interface WhatsAppButtonBlockProps {
  trip: Trip;
  onWhatsAppContact: (trip: Trip) => void;
}

const WhatsAppButtonBlock: React.FC<WhatsAppButtonBlockProps> = ({
  trip,
  onWhatsAppContact
}) => {
  return (
    <Button
      onClick={() => onWhatsAppContact(trip)}
      variant="outline"
      className="w-full border-green-500 text-green-600 hover:bg-green-50 py-3"
      size="lg"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      💬 Contact via WhatsApp
    </Button>
  );
};

export default WhatsAppButtonBlock;
