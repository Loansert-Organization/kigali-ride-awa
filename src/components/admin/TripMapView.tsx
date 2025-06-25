
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, X, Flag, Link, Clock } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface Trip {
  id: string;
  role: 'passenger' | 'driver';
  status: 'pending' | 'open' | 'matched' | 'completed' | 'cancelled';
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  fare: number;
  seatsAvailable: number;
  createdBy: string;
  vehicleType: string;
  matchedCount: number;
}

interface TripMapViewProps {
  trips: Trip[];
  isLoading: boolean;
  onTripAction: (action: string, trip: Trip) => void;
}

export const TripMapView: React.FC<TripMapViewProps> = ({
  trips,
  isLoading,
  onTripAction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'driver' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-96 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Placeholder - In a real implementation, this would be Google Maps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Trip Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Interactive Map View</p>
              <p className="text-sm text-gray-400">
                Google Maps integration would show trip pickup/dropoff points here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-gray-500">
                    {trip.id.slice(0, 8)}...
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getRoleColor(trip.role)} size="sm">
                      {trip.role}
                    </Badge>
                    <Badge className={getStatusColor(trip.status)} size="sm">
                      {trip.status}
                    </Badge>
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-3 h-3 mr-2 text-green-600 flex-shrink-0" />
                    <span className="font-medium truncate">{trip.fromLocation}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-3 h-3 mr-2 text-red-600 flex-shrink-0" />
                    <span className="truncate">{trip.toLocation}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(trip.scheduledTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">
                      {trip.fare ? `RWF ${trip.fare.toLocaleString()}` : 'Negotiable'}
                    </span>
                    {trip.role === 'driver' && (
                      <span className="ml-2">• {trip.seatsAvailable} seats</span>
                    )}
                  </div>
                  <div className="truncate">
                    Created by: {trip.createdBy}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTripAction('view', trip)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  {trip.status !== 'cancelled' && trip.status !== 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTripAction('cancel', trip)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTripAction('flag', trip)}
                      >
                        <Flag className="w-3 h-3" />
                      </Button>

                      {trip.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTripAction('force-match', trip)}
                        >
                          <Link className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No trips found</p>
              <p className="text-sm">Adjust your filters to see more trips.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
