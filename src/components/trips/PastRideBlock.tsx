
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Star } from 'lucide-react';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  scheduled_time: string;
  status: string;
  fare?: number;
}

interface PastRideBlockProps {
  trip: Trip;
  onBookAgain: () => void;
  onSaveAsFavorite: () => void;
}

const PastRideBlock: React.FC<PastRideBlockProps> = ({
  trip,
  onBookAgain,
  onSaveAsFavorite
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'moto': return '🛵';
      case 'car': return '🚗';
      case 'tuktuk': return '🛺';
      case 'minibus': return '🚐';
      default: return '🚗';
    }
  };

  return (
    <Card className="shadow-sm opacity-90">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg opacity-75">{getVehicleIcon(trip.vehicle_type)}</span>
              <span className="text-sm text-gray-500 font-medium capitalize">
                {trip.vehicle_type}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="font-medium">{trip.from_location}</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-gray-400">↓</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="font-medium">{trip.to_location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">{formatDate(trip.scheduled_time)}</p>
          </div>
          {trip.fare && (
            <div className="text-right">
              <p className="text-sm text-gray-600">RWF {trip.fare.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onBookAgain}
            size="sm"
            variant="outline"
            className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Book Again
          </Button>
          <Button
            onClick={onSaveAsFavorite}
            variant="outline"
            size="sm"
            className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Star className="w-4 h-4 mr-2" />
            Save Favorite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PastRideBlock;
