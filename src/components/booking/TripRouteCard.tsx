
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Car } from 'lucide-react';

interface TripRouteCardProps {
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    vehicle_type: string;
    seats_available: number;
    fare?: number;
    is_negotiable?: boolean;
    driver_name?: string;
  };
  onSelect?: (tripId: string) => void;
  onContact?: (tripId: string) => void;
}

const TripRouteCard: React.FC<TripRouteCardProps> = ({
  trip,
  onSelect,
  onContact
}) => {
  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleString();
    } catch {
      return timeString;
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect?.(trip.id)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{trip.driver_name || 'Driver'}</CardTitle>
          <div className="text-right">
            {trip.fare && (
              <div className="flex items-center space-x-1">
                <span className="font-bold text-lg">RWF {trip.fare.toLocaleString()}</span>
                {trip.is_negotiable && (
                  <Badge variant="outline" className="text-xs">Negotiable</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 mt-1 text-green-600" />
            <div>
              <p className="text-xs text-gray-500 uppercase">From</p>
              <p className="font-medium">{trip.from_location}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 mt-1 text-red-600" />
            <div>
              <p className="text-xs text-gray-500 uppercase">To</p>
              <p className="font-medium">{trip.to_location}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(trip.scheduled_time)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Car className="w-4 h-4" />
            <span>{trip.vehicle_type}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{trip.seats_available} seats</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripRouteCard;
