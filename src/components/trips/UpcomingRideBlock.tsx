
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from 'lucide-react';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  scheduled_time: string;
  status: string;
  fare?: number;
}

interface UpcomingRideBlockProps {
  trip: Trip;
  onWhatsAppDriver: () => void;
  onCancelTrip: () => void;
}

const UpcomingRideBlock: React.FC<UpcomingRideBlockProps> = ({
  trip,
  onWhatsAppDriver,
  onCancelTrip
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getVehicleIcon(trip.vehicle_type)}</span>
              <span className={`text-sm font-medium ${getStatusColor(trip.status)}`}>
                {trip.status === 'matched' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">From:</span>
                <span className="font-medium">{trip.from_location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">To:</span>
                <span className="font-medium">{trip.to_location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Scheduled for</p>
            <p className="font-medium">{formatDate(trip.scheduled_time)}</p>
          </div>
          {trip.fare && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Fare</p>
              <p className="font-semibold text-green-600">RWF {trip.fare.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onWhatsAppDriver}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp Driver
          </Button>
          <Button
            onClick={onCancelTrip}
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingRideBlock;
