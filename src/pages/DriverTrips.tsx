
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MessageCircle, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { EdgeFunctionService } from "@/services/EdgeFunctionService";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare?: number;
  seats_available: number;
  status: string;
  description?: string;
  bookings?: any[];
}

const DriverTrips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');

  // Fetch trips based on active tab
  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ['driver-trips', activeTab],
    queryFn: async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      let statusFilter;
      if (activeTab === 'active') {
        statusFilter = ['pending', 'matched'];
      } else if (activeTab === 'completed') {
        statusFilter = ['completed'];
      } else {
        statusFilter = ['cancelled'];
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          bookings (
            id,
            confirmed,
            passenger_trip_id
          )
        `)
        .eq('role', 'driver')
        .eq('user_id', currentUser.id)
        .in('status', statusFilter)
        .order('scheduled_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!localStorage.getItem('currentUser')
  });

  // Cancel trip mutation
  const cancelTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'cancelled' })
        .eq('id', tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Trip Cancelled",
        description: "Your trip has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel trip. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleContactPassengers = async (trip: Trip) => {
    try {
      const result = await EdgeFunctionService.sendWhatsAppInvite(
        '+250123456789', // This would be the actual passenger's phone
        'booking_request',
        trip,
        undefined,
        'en'
      );
      
      if (result.whatsapp_url) {
        window.open(result.whatsapp_url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      cancelTripMutation.mutate(tripId);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getBookedSeats = (trip: Trip) => {
    const bookedCount = trip.bookings?.length || 0;
    return `${bookedCount} of ${trip.seats_available} seats booked`;
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
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home/driver')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">My Trips</h1>
            </div>
            <Button
              onClick={() => navigate('/create-trip')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <TripsList 
              trips={trips} 
              tabType="active"
              onContactPassengers={handleContactPassengers}
              onCancelTrip={handleCancelTrip}
              formatDateTime={formatDateTime}
              getStatusBadge={getStatusBadge}
              getBookedSeats={getBookedSeats}
              getVehicleIcon={getVehicleIcon}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <TripsList 
              trips={trips} 
              tabType="completed"
              onContactPassengers={handleContactPassengers}
              onCancelTrip={handleCancelTrip}
              formatDateTime={formatDateTime}
              getStatusBadge={getStatusBadge}
              getBookedSeats={getBookedSeats}
              getVehicleIcon={getVehicleIcon}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            <TripsList 
              trips={trips} 
              tabType="cancelled"
              onContactPassengers={handleContactPassengers}
              onCancelTrip={handleCancelTrip}
              formatDateTime={formatDateTime}
              getStatusBadge={getStatusBadge}
              getBookedSeats={getBookedSeats}
              getVehicleIcon={getVehicleIcon}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface TripsListProps {
  trips: Trip[];
  tabType: string;
  onContactPassengers: (trip: Trip) => void;
  onCancelTrip: (tripId: string) => void;
  formatDateTime: (date: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getBookedSeats: (trip: Trip) => string;
  getVehicleIcon: (vehicleType: string) => string;
}

const TripsList: React.FC<TripsListProps> = ({
  trips,
  tabType,
  onContactPassengers,
  onCancelTrip,
  formatDateTime,
  getStatusBadge,
  getBookedSeats,
  getVehicleIcon
}) => {
  const navigate = useNavigate();

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No {tabType} trips yet
        </h3>
        <p className="text-gray-600 mb-6">
          {tabType === 'active' 
            ? "Create your first trip to start earning!"
            : `You don't have any ${tabType} trips.`
          }
        </p>
        {tabType === 'active' && (
          <Button
            onClick={() => navigate('/create-trip')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Trip
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <Card key={trip.id} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getVehicleIcon(trip.vehicle_type)}</div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {trip.from_location} → {trip.to_location}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(trip.scheduled_time)}
                  </div>
                </div>
              </div>
              {getStatusBadge(trip.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Fare:</span>
                <div className="font-medium">
                  {trip.fare ? `RWF ${trip.fare.toLocaleString()}` : 'Free'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Seats:</span>
                <div className="font-medium">{getBookedSeats(trip)}</div>
              </div>
            </div>

            {trip.description && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-700">
                "{trip.description}"
              </div>
            )}

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
              
              {trip.status === 'matched' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => onContactPassengers(trip)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}

              {(trip.status === 'pending' || trip.status === 'matched') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => onCancelTrip(trip.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DriverTrips;
