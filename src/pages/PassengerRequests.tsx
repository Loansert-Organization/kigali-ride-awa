
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Clock, Car, MessageCircle, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PassengerRequest {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  seats_available: number;
  user_id: string;
  status: string;
  fare?: number;
  description?: string;
  users?: {
    promo_code: string;
    phone_number?: string;
  };
}

const PassengerRequests = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.role === 'driver') {
      loadPassengerRequests();
      // Set up real-time subscription
      const subscription = supabase
        .channel('passenger_requests')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: 'role=eq.passenger'
        }, () => {
          loadPassengerRequests();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userProfile]);

  const loadPassengerRequests = async () => {
    try {
      // Get current time to filter out past requests
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users (
            promo_code,
            phone_number
          )
        `)
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .gte('scheduled_time', now)
        .order('scheduled_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading passenger requests:', error);
      toast({
        title: "Error loading requests",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!userProfile) return;

    setAcceptingRequest(requestId);
    try {
      // Create a booking between driver and passenger
      const { error } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: requestId,
          driver_trip_id: null, // Driver doesn't have a trip, they're accepting a passenger request
          confirmed: true
        });

      if (error) throw error;

      // Update the passenger trip status
      await supabase
        .from('trips')
        .update({ status: 'matched' })
        .eq('id', requestId);

      toast({
        title: "Request accepted!",
        description: "Contact the passenger via WhatsApp to coordinate",
      });

      loadPassengerRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Failed to accept request",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setAcceptingRequest(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `In ${diffMins} minutes`;
    } else if (diffMins < 1440) { // Less than 24 hours
      return `In ${Math.round(diffMins / 60)} hours`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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

  const openWhatsApp = (phoneNumber?: string) => {
    if (!phoneNumber) {
      toast({
        title: "Contact unavailable",
        description: "Passenger's phone number not available",
        variant: "destructive"
      });
      return;
    }

    const message = "Hello! I'm a driver from Kigali Ride and I can help with your trip request. Let's coordinate the pickup details.";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (userProfile?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Driver Access Required
          </h3>
          <p className="text-gray-600">
            This page is only available for registered drivers
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading passenger requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Passenger Requests
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No passenger requests
            </h3>
            <p className="text-gray-600">
              Check back soon for new ride requests in your area
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <span className="text-2xl mr-2">{getVehicleIcon(request.vehicle_type)}</span>
                      {request.users?.promo_code || 'Passenger'}
                    </CardTitle>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDateTime(request.scheduled_time)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-gray-600">{request.from_location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-gray-600">{request.to_location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Seats needed:</span>
                      <div className="font-medium">{request.seats_available}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Fare:</span>
                      <div className="font-medium">
                        {request.fare ? `RWF ${request.fare.toLocaleString()}` : 'Negotiable'}
                      </div>
                    </div>
                  </div>

                  {request.description && (
                    <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                      "{request.description}"
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={acceptingRequest === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {acceptingRequest === request.id ? 'Accepting...' : 'Accept Request'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => openWhatsApp(request.users?.phone_number)}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerRequests;
