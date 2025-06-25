
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, MapPin } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PassengerRequestCard from './PassengerRequestCard';
import PassengerRequestModal from './PassengerRequestModal';
import { EdgeFunctionService } from '@/services/EdgeFunctionService';

interface PassengerRequestsFeedProps {
  driverLocation?: { lat: number; lng: number };
  vehicleType: string;
  isOnline: boolean;
}

const PassengerRequestsFeed: React.FC<PassengerRequestsFeedProps> = ({
  driverLocation,
  vehicleType,
  isOnline
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPassengerRequests = async () => {
    if (!isOnline || !driverLocation) {
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      // Get nearby passenger trips using edge function
      const data = await EdgeFunctionService.getNearbyOpenTrips(
        driverLocation.lat,
        driverLocation.lng,
        5, // 5km radius
        vehicleType,
        10 // limit to 10 requests
      );

      // Filter for passenger trips only
      const passengerRequests = data.trips?.filter((trip: any) => 
        trip.role === 'passenger' && trip.status === 'pending'
      ) || [];

      setRequests(passengerRequests);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading passenger requests:', error);
      toast({
        title: "Error",
        description: "Failed to load passenger requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (tripId: string) => {
    try {
      // Create booking between driver and passenger
      const result = await EdgeFunctionService.matchPassengerDriver(
        'create_booking',
        tripId
      );

      if (result.success) {
        toast({
          title: "Request Accepted!",
          description: "Opening WhatsApp to coordinate pickup",
        });

        // Remove the accepted request from the list
        setRequests(prev => prev.filter(req => req.id !== tripId));
        setIsModalOpen(false);

        // Here you would typically launch WhatsApp
        // This is handled by the booking service
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (tripId: string) => {
    const trip = requests.find(r => r.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setIsModalOpen(true);
    }
  };

  const handleWhatsAppContact = async (trip: any) => {
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

  // Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (isOnline) {
      loadPassengerRequests();
      const interval = setInterval(loadPassengerRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isOnline, driverLocation, vehicleType]);

  if (!isOnline) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Go online to see passenger requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2" />
              📝 Passenger Requests
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPassengerRequests}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </CardHeader>
        <CardContent>
          {loading && requests.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <PassengerRequestCard
                  key={request.id}
                  trip={request}
                  onAccept={handleAcceptRequest}
                  onViewDetails={handleViewDetails}
                  suggestedFare={request.suggested_fare}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No passenger requests nearby</p>
              <p className="text-xs text-gray-400 mt-1">
                Try expanding your service area in settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PassengerRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={selectedTrip}
        onAccept={handleAcceptRequest}
        onWhatsAppContact={handleWhatsAppContact}
      />
    </>
  );
};

export default PassengerRequestsFeed;
