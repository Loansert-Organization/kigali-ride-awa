
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';

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
}

interface MatchesMapBlockProps {
  passengerTrip: Trip;
  driverTrips: Trip[];
}

const MatchesMapBlock: React.FC<MatchesMapBlockProps> = ({
  passengerTrip,
  driverTrips
}) => {
  return (
    <Card className="mx-4 mt-4 h-64">
      <CardContent className="p-0 h-full relative">
        <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          {/* Passenger Pickup Pin */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600 whitespace-nowrap">
              Pickup
            </div>
          </div>

          {/* Passenger Dropoff Pin */}
          <div className="absolute top-3/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-500 whitespace-nowrap">
              Destination
            </div>
          </div>

          {/* Driver Trip Routes */}
          {driverTrips.slice(0, 3).map((trip, index) => (
            <div key={trip.id}>
              {/* Route Line */}
              <div 
                className={`absolute z-5 animate-fade-in`}
                style={{
                  top: `${30 + (index * 15)}%`,
                  left: `${20 + (index * 20)}%`,
                  width: '35%',
                  height: '2px',
                  background: `linear-gradient(90deg, ${
                    trip.vehicle_type === 'moto' ? '#f59e0b' :
                    trip.vehicle_type === 'car' ? '#10b981' :
                    trip.vehicle_type === 'tuktuk' ? '#8b5cf6' : '#06b6d4'
                  }, rgba(0,0,0,0.1))`,
                  animationDelay: `${index * 200}ms`
                }}
              />
              
              {/* Driver Vehicle Icon */}
              <div 
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-15`}
                style={{
                  top: `${30 + (index * 15)}%`,
                  left: `${25 + (index * 20)}%`,
                }}
              >
                <div className="w-5 h-5 bg-green-500 rounded-full border border-white shadow-sm flex items-center justify-center">
                  <Navigation className="w-2 h-2 text-white" />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-green-600 capitalize">
                  {trip.vehicle_type === 'moto' ? '🛵' :
                   trip.vehicle_type === 'car' ? '🚗' :
                   trip.vehicle_type === 'tuktuk' ? '🛺' : '🚐'}
                </div>
              </div>
            </div>
          ))}
          
          {/* Your Route Line */}
          <div 
            className="absolute z-10"
            style={{
              top: '45%',
              left: '30%',
              width: '40%',
              height: '3px',
              background: 'linear-gradient(90deg, #3b82f6, #ef4444)',
            }}
          />
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Your trip: {passengerTrip.from_location} → {passengerTrip.to_location}
              </span>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              {driverTrips.length} matches
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchesMapBlock;
