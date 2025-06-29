
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Car, Users, DollarSign, MessageSquare } from 'lucide-react';
import { TripData } from '@/types/api';

interface TripConfirmationBlockProps {
  tripData: Partial<TripData>;
  broadcastToNearby: boolean;
  onUpdate: (updates: Partial<TripData>) => void;
}

const TripConfirmationBlock: React.FC<TripConfirmationBlockProps> = ({
  tripData,
  broadcastToNearby,
  onUpdate
}) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not set';
    return new Date(timeString).toLocaleString('en-RW', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (type?: string) => {
    const icons: Record<string, string> = { 
      moto: '🛵', 
      car: '🚗', 
      tuktuk: '🛺', 
      minibus: '🚐' 
    };
    return icons[type || ''] || '🚗';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">✅ Trip Summary</h3>
          
          <div className="space-y-4">
            {/* Route */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{tripData.from_location || 'Not set'}</div>
                <div className="text-sm text-gray-500">↓</div>
                <div className="font-medium text-gray-900">{tripData.to_location || 'Not set'}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{formatTime(tripData.scheduled_time)}</div>
                <div className="text-sm text-gray-500">Departure time</div>
              </div>
            </div>

            {/* Vehicle & Seats */}
            <div className="flex items-center space-x-3">
              <Car className="w-5 h-5 text-purple-600" />
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getVehicleIcon(tripData.vehicle_type)}</span>
                <div>
                  <div className="font-medium text-gray-900 capitalize">{tripData.vehicle_type || 'Not set'}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {tripData.seats_available || 0} seat{tripData.seats_available !== 1 ? 's' : ''} available
                  </div>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {tripData.fare ? `RWF ${tripData.fare.toLocaleString()}` : 'Free / Negotiate'}
                  {tripData.is_negotiable && tripData.fare && (
                    <Badge variant="secondary" className="ml-2">Negotiable</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">Per passenger</div>
              </div>
            </div>

            {/* Description */}
            {tripData.description && (
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Additional notes</div>
                  <div className="text-sm text-gray-600">{tripData.description}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">📡 Broadcast Options</h3>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <div className="font-medium text-blue-900">Notify nearby passengers</div>
              <div className="text-sm text-blue-700">
                Send alerts to passengers within 5km who are looking for similar trips
              </div>
            </div>
            <Switch
              checked={broadcastToNearby}
              onCheckedChange={(checked) => onUpdate({ broadcastToNearby: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Ready to publish!</h3>
          <p className="text-sm text-green-700">
            Your trip will be visible to passengers and you'll receive booking requests
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripConfirmationBlock;
