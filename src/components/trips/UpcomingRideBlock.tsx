
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Car, Phone, MessageCircle } from 'lucide-react';

interface UpcomingRideBlockProps {
  trip: {
    id: string;
    from_location: string;
    to_location: string;
    scheduled_time: string;
    vehicle_type: string;
    status: string;
    fare?: number;
    role: 'passenger' | 'driver';
  };
}

const UpcomingRideBlock: React.FC<UpcomingRideBlockProps> = ({ trip }) => {
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'moto':
        return '🏍️';
      case 'car':
        return '🚗';
      case 'tuktuk':
        return '🛺';
      case 'minibus':
        return '🚐';
      default:
        return '🚗';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContact = (method: 'whatsapp' | 'call') => {
    // This would normally use actual contact information
    const phoneNumber = '+250788123456'; // Placeholder
    
    if (method === 'whatsapp') {
      const message = `Hi! I'm contacting you about our upcoming ride from ${trip.from_location} to ${trip.to_location}`;
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`tel:${phoneNumber}`);
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getVehicleIcon(trip.vehicle_type)}</span>
            <div>
              <p className="font-medium text-sm capitalize">
                {trip.vehicle_type} • {trip.role}
              </p>
              <Badge className={`text-xs ${getStatusColor(trip.status)}`}>
                {trip.status}
              </Badge>
            </div>
          </div>
          
          {trip.fare && (
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                RWF {trip.fare.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">From</p>
              <p className="text-xs text-gray-600">{trip.from_location}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">To</p>
              <p className="text-xs text-gray-600">{trip.to_location}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Scheduled</p>
              <p className="text-xs text-gray-600">{formatTime(trip.scheduled_time)}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleContact('call')}
          >
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleContact('whatsapp')}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingRideBlock;
