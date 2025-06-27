import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TripData } from '@/types/api';

interface CompletedTripsBlockProps {
  trips: TripData[];
  formatCurrency: (amount: number) => string;
}

export const CompletedTripsBlock: React.FC<CompletedTripsBlockProps> = ({ 
  trips, 
  formatCurrency 
}) => {
  const navigate = useNavigate();

  if (!trips || trips.length === 0) {
    return null;
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (vehicleType: string) => {
    const icons = {
      moto: '🛵',
      car: '🚗',
      tuktuk: '🛺',
      minibus: '🚐'
    };
    return icons[vehicleType as keyof typeof icons] || '🚗';
  };

  const calculateTripEarnings = (trip: TripData) => {
    const seatsBooked = trip.bookings?.length || 0;
    const farePerSeat = trip.fare || 0;
    return farePerSeat * seatsBooked;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Completed Trips</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trips.slice(0, 10).map((trip) => {
          const earnings = calculateTripEarnings(trip);
          const seatsBooked = trip.bookings?.length || 0;
          
          return (
            <div key={trip.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getVehicleIcon(trip.vehicle_type)}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {trip.from_location} → {trip.to_location}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(trip.scheduled_time)}
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Earnings:</span>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(earnings)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Seats:</span>
                  <div className="font-semibold">
                    {seatsBooked} of {trip.seats_available}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-semibold text-green-600">Paid</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/trip-details?id=${trip.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </div>
            </div>
          );
        })}

        {trips.length > 10 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/driver-trips')}
            >
              View All Trips
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
