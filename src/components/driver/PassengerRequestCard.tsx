
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Users, MessageCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PassengerRequestCardProps {
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    vehicle_type: string;
    fare?: number;
    seats_available: number;
    distance?: number;
    user?: {
      promo_code: string;
    };
  };
  onAccept: (tripId: string) => void;
  onViewDetails: (tripId: string) => void;
  suggestedFare?: number;
}

const PassengerRequestCard: React.FC<PassengerRequestCardProps> = ({
  trip,
  onAccept,
  onViewDetails,
  suggestedFare
}) => {
  const timeFromNow = formatDistanceToNow(new Date(trip.scheduled_time), { addSuffix: true });
  
  return (
    <Card className="hover:shadow-md transition-all duration-200 animate-in slide-in-from-left">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with passenger info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm truncate">{trip.from_location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm truncate">{trip.to_location}</span>
              </div>
            </div>
            {trip.distance && (
              <Badge variant="outline" className="text-xs">
                {trip.distance.toFixed(1)}km
              </Badge>
            )}
          </div>

          {/* Trip details */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {timeFromNow}
              </span>
              <span className="capitalize">{trip.vehicle_type}</span>
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {trip.seats_available} seats
              </span>
            </div>
          </div>

          {/* Fare information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                {trip.fare ? (
                  <span className="font-bold text-green-600">{trip.fare} RWF</span>
                ) : (
                  <span className="text-gray-500">Negotiable</span>
                )}
                {suggestedFare && !trip.fare && (
                  <span className="text-xs text-blue-600 ml-2">
                    (Suggested: {suggestedFare} RWF)
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">
              ID: {trip.user?.promo_code || trip.id.slice(-6)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={() => onAccept(trip.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              ✅ Accept
            </Button>
            <Button
              onClick={() => onViewDetails(trip.id)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              ℹ️ Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengerRequestCard;
