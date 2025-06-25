
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

interface NearbyTripsMapProps {
  trips: any[];
  currentLocation: {lat: number, lng: number} | null;
}

const NearbyTripsMap: React.FC<NearbyTripsMapProps> = ({
  trips,
  currentLocation
}) => {
  return (
    <Card className="h-64">
      <CardContent className="p-4 h-full">
        <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Map will show here</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentLocation ? `${trips.length} rides nearby` : 'Enable location for better results'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyTripsMap;
