
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
}

interface MatchesMapBlockProps {
  passengerTrip?: Trip;
  center?: { lat: number; lng: number };
  onTripSelect?: (tripId: string) => void;
}

const MatchesMapBlock: React.FC<MatchesMapBlockProps> = ({
  passengerTrip,
  center,
  onTripSelect: _onTripSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Trip Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Map view will be implemented here</p>
            {passengerTrip && (
              <div className="mt-4 text-sm text-gray-500">
                <p>From: {passengerTrip.from_location}</p>
                <p>To: {passengerTrip.to_location}</p>
                {center && (
                  <p className="mt-2">
                    Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchesMapBlock;
