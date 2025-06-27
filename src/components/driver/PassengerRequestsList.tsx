import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Phone } from 'lucide-react';

interface PassengerRequest {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  requestedTime: string;
  passengers: number;
  maxFare: number;
  distance: number;
  status: 'pending' | 'accepted' | 'declined';
}

interface PassengerRequestsListProps {
  requests: PassengerRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onContactPassenger: (requestId: string) => void;
}

const PassengerRequestsList: React.FC<PassengerRequestsListProps> = ({
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onContactPassenger
}) => {
  // Simple distance calculation (not used but keeping for future implementation)
  // const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  //   return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111; // Rough km conversion
  // };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No passenger requests at the moment</p>
          <p className="text-sm text-gray-500 mt-1">
            Check back later or expand your service area
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Passenger Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{request.passengerName}</h4>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Max RWF {request.maxFare.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{request.distance.toFixed(1)} km away</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Pickup</p>
                        <p className="text-sm">{request.pickup}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Destination</p>
                        <p className="text-sm">{request.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{request.requestedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{request.passengers} passenger{request.passengers > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onAcceptRequest(request.id)}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeclineRequest(request.id)}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onContactPassenger(request.id)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => onContactPassenger(request.id)}
                      className="w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Passenger
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassengerRequestsList;
