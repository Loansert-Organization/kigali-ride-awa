
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TripRouteCardProps {
  from: string;
  to: string;
  departureTime: string;
  availableSeats: number;
  fare: number;
  vehicleType: string;
  onBook: () => void;
}

const TripRouteCard: React.FC<TripRouteCardProps> = ({
  from,
  to,
  departureTime,
  availableSeats,
  fare,
  vehicleType,
  onBook
}) => {
  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">{from}</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium">{to}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{new Date(departureTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{availableSeats} seats</span>
              </div>
              <span className="capitalize">{vehicleType}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-lg font-semibold text-green-600 mb-2">
              <DollarSign className="w-4 h-4 mr-1" />
              {fare} RWF
            </div>
            <Button onClick={onBook} size="sm">
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripRouteCard;
