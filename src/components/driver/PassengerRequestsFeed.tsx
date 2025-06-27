
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, MessageSquare } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PassengerRequestModal } from '@/components/driver/PassengerRequestModal';

interface PassengerRequest {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  status: string;
  created_at: string;
}

interface PassengerRequestsFeedProps {
  driverLocation?: { lat: number; lng: number };
}

const PassengerRequestsFeed: React.FC<PassengerRequestsFeedProps> = ({
  driverLocation
}) => {
  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PassengerRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPassengerRequests();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('passenger_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trips' },
        () => {
          fetchPassengerRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPassengerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedRequests: PassengerRequest[] = (data || []).map(trip => ({
        id: trip.id,
        user_id: trip.user_id || '',
        from_location: trip.from_location || '',
        to_location: trip.to_location || '',
        scheduled_time: trip.scheduled_time,
        vehicle_type: trip.vehicle_type,
        status: trip.status,
        created_at: trip.created_at
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching passenger requests:', error);
      toast({
        title: "Error",
        description: "Failed to load passenger requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: PassengerRequest) => {
    try {
      // Update trip status to accepted
      const { error } = await supabase
        .from('trips')
        .update({ status: 'matched' })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Request Accepted",
        description: "Passenger has been notified. Contact them to coordinate."
      });

      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== request.id));
      setShowModal(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (request: PassengerRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passenger Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Passenger Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No passenger requests at the moment</p>
              <p className="text-sm text-gray-500 mt-1">
                Check back later or make sure you're online
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <MapPin className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium">{request.from_location}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <MapPin className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium">{request.to_location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{new Date(request.scheduled_time).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="capitalize">{request.vehicle_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleViewDetails(request)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleAccept(request)}
                          size="sm"
                          className="w-full"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <PassengerRequestModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          trip={selectedRequest}
          onAccept={() => handleAccept(selectedRequest)}
        />
      )}
    </>
  );
};

export default PassengerRequestsFeed;
