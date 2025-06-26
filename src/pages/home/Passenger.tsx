
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, User, TrendingUp, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare: number | null;
  users: {
    promo_code: string;
  };
}

const PassengerHome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isGuest, setGuestRole } = useAuth();
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set role for guest users
    if (isGuest) {
      setGuestRole('passenger');
    }
    
    fetchAvailableTrips();
  }, [isGuest, setGuestRole]);

  const fetchAvailableTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users!inner(promo_code)
        `)
        .eq('role', 'driver')
        .eq('status', 'pending')
        .order('scheduled_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      setAvailableTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Find a Ride</h1>
              <p className="text-sm text-gray-600">
                {isGuest ? 'Browsing as Guest' : `Welcome, ${userProfile?.promo_code}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Auth Status */}
        {isGuest && (
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              👋 You're browsing as a guest. Book a ride to verify with WhatsApp.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/book-ride')}
            className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Book a Ride</span>
          </Button>
          
          <Button
            onClick={() => navigate('/leaderboard')}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm">Leaderboard</span>
          </Button>
        </div>

        {/* Available Trips */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Available Rides</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available rides...</p>
            </div>
          ) : availableTrips.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No rides available right now</p>
                <p className="text-sm text-gray-500">Check back soon or post your own ride request!</p>
              </CardContent>
            </Card>
          ) : (
            availableTrips.map((trip) => (
              <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{trip.vehicle_type}</Badge>
                        <Badge variant="outline">Driver: {trip.users.promo_code}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          <span>{trip.from_location} → {trip.to_location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(trip.scheduled_time).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {trip.fare && (
                      <div className="ml-4 text-right">
                        <div className="font-semibold text-green-600">{trip.fare} RWF</div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/ride-matches?driverTripId=${trip.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Navigation Placeholder */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="flex-col space-y-1 text-blue-600">
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-col space-y-1"
              onClick={() => navigate('/book-ride')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Book</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-col space-y-1"
              onClick={() => navigate('/leaderboard')}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Rewards</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-col space-y-1"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;
