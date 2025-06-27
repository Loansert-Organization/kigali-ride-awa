
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Users } from 'lucide-react';

interface DriverTripCardBlockProps {
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    vehicle_type: string;
    fare?: number;
    seats_available: number;
    driver?: {
      promo_code: string;
    };
  };
  onBook: (tripId: string) => void;
  distance?: number;
}

const DriverTripCardBlock: React.FC<DriverTripCardBlockProps> = ({
  trip,
  onBook,
  distance
}) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-RW', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with distance */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">{trip.from_location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm">{trip.to_location}</span>
              </div>
            </div>
            {distance && (
              <Badge variant="outline" className="text-xs">
                {distance.toFixed(1)}km away
              </Badge>
            )}
          </div>

          {/* Trip details */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(trip.scheduled_time)}
              </span>
              <span className="capitalize">{trip.vehicle_type}</span>
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {trip.seats_available} seats
              </span>
            </div>
          </div>

          {/* Fare and booking */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                {trip.fare ? (
                  <span className="font-bold text-green-600">{trip.fare} RWF</span>
                ) : (
                  <span className="text-gray-500">Negotiable</span>
                )}
              </div>
            </div>
            <Button
              onClick={() => onBook(trip.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Book Ride
            </Button>
          </div>

          {/* Driver info */}
          <div className="text-xs text-gray-400 text-right">
            Driver: {trip.driver?.promo_code || trip.id.slice(-6)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverTripCardBlock;
