
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, X, Flag, Link, Clock, Users, MapPin } from 'lucide-react';
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

interface TripsTableBlockProps {
  trips: Trip[];
  isLoading: boolean;
  onTripAction: (action: string, trip: Trip) => void;
}

export const TripsTableBlock: React.FC<TripsTableBlockProps> = ({
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
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Seats/Matches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {trip.id.slice(0, 8)}...
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getRoleColor(trip.role)}>
                      {trip.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1 text-green-600" />
                        <span className="font-medium">{trip.fromLocation}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 text-red-600" />
                        <span>{trip.toLocation}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="text-sm">
                        {new Date(trip.scheduledTime).toLocaleDateString()}
                        <br />
                        <span className="text-gray-500">
                          {new Date(trip.scheduledTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium">
                      {trip.fare ? `RWF ${trip.fare.toLocaleString()}` : 'Negotiable'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {trip.role === 'driver' 
                          ? `${trip.seatsAvailable} seats`
                          : `${trip.matchedCount} matches`
                        }
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {trip.createdBy}
                    </div>
                    <div className="text-xs text-gray-500">
                      {trip.vehicleType}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTripAction('view', trip)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {trip.status !== 'cancelled' && trip.status !== 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTripAction('cancel', trip)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTripAction('flag', trip)}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>

                          {trip.status === 'open' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onTripAction('force-match', trip)}
                            >
                              <Link className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {trips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No trips found matching the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
