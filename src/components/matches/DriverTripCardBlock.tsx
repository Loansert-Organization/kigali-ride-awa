
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Car } from 'lucide-react';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  is_negotiable?: boolean;
  description?: string;
}

interface DriverTripCardBlockProps {
  trip: Trip;
  onMatch: () => void;
  onWhatsApp: () => void;
}

const DriverTripCardBlock: React.FC<DriverTripCardBlockProps> = ({
  trip,
  onMatch,
  onWhatsApp
}) => {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'moto': return '🛵';
      case 'car': return '🚗';
      case 'tuktuk': return '🛺';
      case 'minibus': return '🚐';
      default: return '🚗';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFare = (fare?: number, isNegotiable?: boolean) => {
    if (!fare) return isNegotiable ? 'Negotiable' : 'Free';
    return isNegotiable ? `RWF ${fare.toLocaleString()} (Negotiable)` : `RWF ${fare.toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getVehicleIcon(trip.vehicle_type)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {trip.vehicle_type} Driver
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(trip.scheduled_time)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-purple-600">
              {formatFare(trip.fare, trip.is_negotiable)}
            </div>
            {trip.is_negotiable && (
              <span className="text-xs text-gray-500">Discuss price</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-700 mb-1">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium">From:</span>
            <span className="ml-1">{trip.from_location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="font-medium">To:</span>
            <span className="ml-1">{trip.to_location}</span>
          </div>
        </div>

        {trip.description && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            "{trip.description}"
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={onMatch}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            ✅ Match Ride
          </Button>
          
          <Button
            onClick={onWhatsApp}
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
          >
            💬 WhatsApp
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-center">
          <span className="text-xs text-gray-400">
            Match score: {Math.floor(Math.random() * 20 + 80)}% • Shared route
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverTripCardBlock;
