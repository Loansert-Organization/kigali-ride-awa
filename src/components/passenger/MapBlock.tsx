
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  vehicle_type: string;
  is_online: boolean;
}

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
}

interface MapBlockProps {
  currentLocation: {lat: number, lng: number} | null;
  nearbyDrivers: Driver[];
  openDriverTrips: Trip[];
}

const MapBlock: React.FC<MapBlockProps> = ({
  currentLocation,
  nearbyDrivers,
  openDriverTrips
}) => {
  return (
    <Card className="h-80 mb-4">
      <CardContent className="p-0 h-full relative">
        <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          {/* User Location Pin */}
          {currentLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600 whitespace-nowrap">
                Your location
              </div>
            </div>
          )}
          
          {/* Driver Pins */}
          {nearbyDrivers.map((driver, index) => (
            <div 
              key={driver.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 animate-fade-in`}
              style={{
                top: `${20 + (index * 15)}%`,
                left: `${30 + (index * 20)}%`,
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Navigation className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-green-600 capitalize">
                {driver.vehicle_type}
              </div>
            </div>
          ))}
          
          {/* Trip Route Lines */}
          {openDriverTrips.slice(0, 3).map((trip, index) => (
            <div 
              key={trip.id}
              className={`absolute z-5 animate-fade-in`}
              style={{
                top: `${25 + (index * 20)}%`,
                left: `${20 + (index * 25)}%`,
                width: '40%',
                height: '2px',
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                animationDelay: `${index * 300}ms`
              }}
            >
              <div className="absolute -top-8 left-0 text-xs text-gray-600 font-medium">
                {trip.from_location}
              </div>
              <div className="absolute -bottom-8 right-0 text-xs text-gray-600 font-medium">
                {trip.to_location}
              </div>
            </div>
          ))}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {nearbyDrivers.length} drivers nearby
              </span>
            </div>
          </div>
          
          {/* Fallback Message */}
          {!currentLocation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">📍 Turn on location to see nearby drivers</p>
                <p className="text-sm text-gray-500 mt-1">We'll show you rides and drivers around you</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapBlock;
