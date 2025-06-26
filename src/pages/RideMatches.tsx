
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare: number | null;
  description: string;
  users: {
    promo_code: string;
    phone_number: string;
  };
}

const RideMatches = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const [matches, setMatches] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTrip, setMyTrip] = useState<Trip | null>(null);

  const tripId = searchParams.get('tripId');

  useEffect(() => {
    if (tripId) {
      fetchMatches();
      fetchMyTrip();
    }
  }, [tripId]);

  const fetchMyTrip = async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users!inner(promo_code, phone_number)
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setMyTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      // Find driver trips that match the passenger's route and timing
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users!inner(promo_code, phone_number)
        `)
        .eq('role', 'driver')
        .eq('status', 'pending')
        .limit(10);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (driverTrip: Trip, method: 'whatsapp' | 'call') => {
    const phoneNumber = driverTrip.users.phone_number;
    const message = `Hi! I'm interested in your ride from ${driverTrip.from_location} to ${driverTrip.to_location}. Can we coordinate?`;

    if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'call') {
      window.open(`tel:${phoneNumber}`, '_self');
    }

    toast({
      title: "Contact initiated",
      description: `Opening ${method === 'whatsapp' ? 'WhatsApp' : 'phone'} to contact driver`,
    });
  };

  const createBooking = async (driverTripId: string) => {
    if (!tripId || !userProfile) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: tripId,
          driver_trip_id: driverTripId,
          confirmed: false
        });

      if (error) throw error;

      toast({
        title: "🎉 Booking request sent!",
        description: "The driver will be notified. You can also contact them directly.",
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Please try contacting the driver directly",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your ride matches...</p>
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
          <h1 className="text-xl font-bold">Available Rides</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* My Trip Summary */}
        {myTrip && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Your Trip Request</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <span>{myTrip.from_location} → {myTrip.to_location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span>{new Date(myTrip.scheduled_time).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Drivers */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Available Drivers</h2>
          
          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">No drivers found for your route yet.</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>💡 Tips to find rides faster:</p>
                  <p>• Try flexible timing</p>
                  <p>• Use popular landmarks</p>
                  <p>• Check back in a few minutes</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            matches.map((trip) => (
              <Card key={trip.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary">{trip.vehicle_type}</Badge>
                        <Badge variant="outline">Driver: {trip.users.promo_code}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          <span>{trip.from_location} → {trip.to_location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{new Date(trip.scheduled_time).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {trip.fare && (
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{trip.fare} RWF</div>
                        <div className="text-xs text-gray-500">negotiable</div>
                      </div>
                    )}
                  </div>

                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">"{trip.description}"</p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleContact(trip, 'whatsapp')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContact(trip, 'call')}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createBooking(trip.id)}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">💬 How to coordinate</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Tap WhatsApp to message the driver directly</p>
              <p>• Confirm pickup location and time</p>
              <p>• Discuss fare if not listed</p>
              <p>• Share your location for easy pickup</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RideMatches;
