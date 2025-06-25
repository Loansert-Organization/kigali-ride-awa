
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Users, MessageSquare, Navigation } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EdgeFunctionService } from "@/services/EdgeFunctionService";

const PassengerRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadPassengerRequests();
    
    const interval = setInterval(loadPassengerRequests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Fallback to Kigali center
          setDriverLocation({ lat: -1.9441, lng: 30.0619 });
        }
      );
    }
  };

  const loadPassengerRequests = async () => {
    try {
      if (!driverLocation) return;

      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(20);

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading passenger requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // TODO: Implement booking creation via EdgeFunctionService
      toast({
        title: "Request Accepted",
        description: "Passenger will be notified of your acceptance"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
    }
  };

  const handleContactPassenger = (request: any) => {
    // TODO: Integrate with WhatsApp modal
    toast({
      title: "Contacting Passenger",
      description: "Opening WhatsApp..."
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-RW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    // Simplified distance calculation (mock)
    return Math.floor(Math.random() * 10 + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading passenger requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Passenger Requests</h1>
          </div>
          <Badge variant="secondary">
            {requests.length} available
          </Badge>
        </div>
      </div>

      <div className="p-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Available</h3>
              <p className="text-gray-600 mb-4">
                Check back later or go online to receive ride requests
              </p>
              <Button onClick={() => navigate('/driver')} className="bg-purple-600 hover:bg-purple-700">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Passenger Request</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(request.scheduled_time)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {request.vehicle_type}
                      </Badge>
                      {driverLocation && (
                        <div className="text-sm text-gray-500">
                          ~{calculateDistance(driverLocation.lat, driverLocation.lng, request.from_lat || -1.9441, request.from_lng || 30.0619)}km away
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium">From:</span>
                      <span className="ml-1 text-gray-700">{request.from_location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      <span className="font-medium">To:</span>
                      <span className="ml-1 text-gray-700">{request.to_location}</span>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      "{request.description}"
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✅ Accept Trip
                    </Button>
                    <Button
                      onClick={() => handleContactPassenger(request)}
                      variant="outline"
                      className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
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
