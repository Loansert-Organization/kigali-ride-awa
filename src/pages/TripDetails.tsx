
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Car, Users, DollarSign } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const TripDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('id');

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip-details', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('Trip ID is required');

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          bookings (
            id,
            confirmed,
            passenger_trip_id,
            trips!bookings_passenger_trip_id_fkey (
              user_id,
              from_location,
              to_location
            )
          )
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tripId
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Open', variant: 'secondary' as const },
      matched: { label: 'Matched', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Trip not found</h2>
          <Button onClick={() => navigate('/driver-trips')}>
            Back to My Trips
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/driver-trips')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Trip Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Trip Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{getVehicleIcon(trip.vehicle_type)}</span>
                <span>Trip Overview</span>
              </CardTitle>
              {getStatusBadge(trip.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">From</div>
                <div className="font-medium">{trip.from_location}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-sm text-gray-600">To</div>
                <div className="font-medium">{trip.to_location}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Scheduled Time</div>
                <div className="font-medium">{formatDateTime(trip.scheduled_time)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">Vehicle</div>
                  <div className="font-medium capitalize">{trip.vehicle_type}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Seats</div>
                  <div className="font-medium">
                    {trip.bookings?.length || 0} of {trip.seats_available}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Fare per passenger</div>
                <div className="font-medium">
                  {trip.fare 
                    ? `RWF ${trip.fare.toLocaleString()}${trip.is_negotiable ? ' (Negotiable)' : ''}`
                    : 'Free'
                  }
                </div>
              </div>
            </div>

            {trip.description && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Notes</div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{trip.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matched Passengers */}
        {trip.bookings && trip.bookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Matched Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trip.bookings.map((booking: any, index: number) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Passenger {index + 1}</div>
                      <div className="text-sm text-gray-600">
                        Booking {booking.confirmed ? 'Confirmed' : 'Pending'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Contact
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
