
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, MapPin } from 'lucide-react';
import PassengerRequestCard from './PassengerRequestCard';
import PassengerRequestModal from './PassengerRequestModal';
import { usePassengerRequests } from '@/hooks/driver/usePassengerRequests';

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
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    requests,
    loading,
    lastRefresh,
    loadPassengerRequests,
    handleAcceptRequest,
    handleWhatsAppContact
  } = usePassengerRequests(driverLocation, vehicleType, isOnline);

  const handleViewDetails = (tripId: string) => {
    const trip = requests.find(r => r.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setIsModalOpen(true);
    }
  };

  // Wrapper function to handle the Promise<boolean> return and convert to Promise<void>
  const handleAcceptWrapper = async (tripId: string): Promise<void> => {
    try {
      await handleAcceptRequest(tripId);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  // Wrapper function for modal accept that also returns Promise<void>
  const handleModalAccept = async (tripId: string): Promise<void> => {
    try {
      await handleAcceptRequest(tripId);
      setIsModalOpen(false);
      setSelectedTrip(null);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleModalWhatsAppContact = (trip: any) => {
    try {
      handleWhatsAppContact(trip);
      setIsModalOpen(false);
      setSelectedTrip(null);
    } catch (error) {
      console.error('Error launching WhatsApp:', error);
    }
  };

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
                  onAccept={handleAcceptWrapper}
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
        onAccept={handleModalAccept}
        onWhatsAppContact={handleModalWhatsAppContact}
      />
    </>
  );
};

export default PassengerRequestsFeed;
