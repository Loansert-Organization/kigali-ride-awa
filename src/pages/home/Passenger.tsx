
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Gift, User, Plus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QuickBookingCard from "@/components/passenger/QuickBookingCard";
import NearbyTripsMap from "@/components/passenger/NearbyTripsMap";
import BottomNavigation from "@/components/navigation/BottomNavigation";

const PassengerHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [nearbyTrips, setNearbyTrips] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadUserData();
    loadFavorites();
    loadNearbyTrips();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userRecord.id)
            .limit(3);
          
          setFavorites(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadNearbyTrips = async () => {
    try {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'driver')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setNearbyTrips(data || []);
    } catch (error) {
      console.error('Error loading nearby trips:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const handleQuickBook = () => {
    navigate('/book-ride');
  };

  const handleFavoriteSelect = (favorite: any) => {
    navigate('/book-ride', { state: { destination: favorite } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Muraho! 👋</h1>
            <p className="text-purple-100">Where would you like to go?</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/profile')}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Quick Booking Section */}
      <div className="p-4">
        <QuickBookingCard 
          onBookRide={handleQuickBook}
          currentLocation={currentLocation}
        />
        
        {/* Favorites */}
        {favorites.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Quick destinations</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/favorites')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {favorites.map((favorite) => (
                  <Button
                    key={favorite.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleFavoriteSelect(favorite)}
                  >
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">{favorite.label}</div>
                      <div className="text-sm text-gray-500">{favorite.address}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Trips */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Available rides</h3>
            {nearbyTrips.length > 0 ? (
              <div className="space-y-3">
                {nearbyTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{trip.from_location}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="text-sm">{trip.to_location}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(trip.scheduled_time).toLocaleTimeString()}
                          </span>
                          <span className="capitalize">{trip.vehicle_type}</span>
                          {trip.seats_available && (
                            <span>{trip.seats_available} seats</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {trip.fare && (
                          <div className="text-lg font-bold text-green-600">
                            {trip.fare} RWF
                          </div>
                        )}
                        {trip.is_negotiable && (
                          <div className="text-xs text-gray-500">Negotiable</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No rides available right now</p>
                <p className="text-sm">Create a ride request to find drivers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      <div className="px-4 pb-20">
        <NearbyTripsMap 
          trips={nearbyTrips}
          currentLocation={currentLocation}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation role="passenger" />
    </div>
  );
};

export default PassengerHome;
