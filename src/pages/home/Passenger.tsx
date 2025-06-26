
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, User, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import FullScreenMap from '@/components/maps/FullScreenMap';

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
  const mapRef = useRef<google.maps.Map | null>(null);

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

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    console.log('🗺️ Map is ready for driver markers');
    // TODO: Add driver markers here
  };

  return (
    <div className="relative">
      {/* Full-screen map */}
      <FullScreenMap onMapReady={handleMapReady}>
        {/* Auth Status Banner - Floating */}
        {isGuest && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <Card className="bg-blue-50/90 backdrop-blur-sm border-blue-200">
              <CardContent className="p-3">
                <p className="text-sm text-blue-800 text-center">
                  👋 You're browsing as a guest. Book a ride to verify with WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header - Floating */}
        <div className="absolute top-4 left-4 right-16 z-10">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Find a Ride</h1>
                  <p className="text-sm text-gray-600">
                    {isGuest ? 'Browsing as Guest' : `Welcome, ${userProfile?.promo_code}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Button - Floating */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="bg-white/90 backdrop-blur-sm"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Action - Book Ride (Floating) */}
        <div className="absolute bottom-24 right-4 z-10">
          <Button
            onClick={() => navigate('/book-ride')}
            className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Available Trips Panel - Floating Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-10 max-h-32 overflow-hidden">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Available Rides</h3>
                <span className="text-xs text-gray-500">{availableTrips.length} trips</span>
              </div>
              
              {loading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : availableTrips.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-2">No rides available right now</p>
              ) : (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {availableTrips.slice(0, 2).map((trip) => (
                    <div key={trip.id} className="text-xs p-2 bg-white/50 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{trip.from_location} → {trip.to_location}</span>
                        <span className="text-green-600 font-bold ml-2">{trip.vehicle_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t z-10">
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
      </FullScreenMap>
    </div>
  );
};

export default PassengerHome;
