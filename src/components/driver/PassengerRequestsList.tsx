
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, MessageSquare } from 'lucide-react';

interface PassengerRequest {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  description?: string;
}

interface PassengerRequestsListProps {
  requests: PassengerRequest[];
  driverLocation: {lat: number, lng: number} | null;
  onAcceptRequest: (requestId: string) => void;
  onContactPassenger: (request: PassengerRequest) => void;
}

const PassengerRequestsList: React.FC<PassengerRequestsListProps> = ({
  requests,
  driverLocation,
  onAcceptRequest,
  onContactPassenger
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-RW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    // Simplified distance calculation (mock)
    return Math.floor(Math.random() * 10 + 1);
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Passenger Request</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(request.scheduled_time)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {request.vehicle_type}
                </Badge>
                {driverLocation && (
                  <div className="text-sm text-gray-500">
                    ~{calculateDistance(driverLocation.lat, driverLocation.lng, -1.9441, 30.0619)}km away
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">From:</span>
                <span className="ml-1 text-gray-700">{request.from_location}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span className="font-medium">To:</span>
                <span className="ml-1 text-gray-700">{request.to_location}</span>
              </div>
            </div>

            {request.description && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                "{request.description}"
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => onAcceptRequest(request.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ✅ Accept Trip
              </Button>
              <Button
                onClick={() => onContactPassenger(request)}
                variant="outline"
                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PassengerRequestsList;
