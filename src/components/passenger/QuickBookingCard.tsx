
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';

interface QuickBookingCardProps {
  onBookRide: () => void;
  currentLocation: {lat: number, lng: number} | null;
}

const QuickBookingCard: React.FC<QuickBookingCardProps> = ({
  onBookRide,
  currentLocation
}) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">From</div>
            <div className="font-medium">
              {currentLocation ? 'Current location' : 'Select pickup location'}
            </div>
          </div>
          <Navigation className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">To</div>
            <div className="font-medium text-gray-400">Where to?</div>
          </div>
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>

        <Button 
          onClick={onBookRide}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          Book a ride
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickBookingCard;
