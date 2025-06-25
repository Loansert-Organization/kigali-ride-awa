
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Clock, Star } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

const PassengerHome = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<string>('');

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation('Current Location');
        },
        (error) => {
          console.warn('Location access denied:', error);
          setCurrentLocation('Location unavailable');
        }
      );
    }
  }, []);

  const quickDestinations = [
    { name: "Nyabugogo", icon: "🚌" },
    { name: "Kimisagara", icon: "🏢" },
    { name: "Kigali City", icon: "🏬" },
    { name: "Airport", icon: "✈️" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">Your location</p>
              <p className="font-semibold">{currentLocation}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/profile')}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              {userProfile?.promo_code?.slice(-2) || 'U'}
            </div>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Quick Book Button */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
          <CardContent className="p-6">
            <Button
              onClick={() => navigate('/book-ride')}
              className="w-full bg-white text-green-600 hover:bg-gray-100 font-semibold py-6 text-lg"
            >
              <Search className="w-6 h-6 mr-3" />
              🚗 Book a Ride Now
            </Button>
          </CardContent>
        </Card>

        {/* Quick Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Quick Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickDestinations.map((dest) => (
                <Button
                  key={dest.name}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center"
                  onClick={() => navigate('/book-ride', { state: { destination: dest.name } })}
                >
                  <span className="text-2xl mb-1">{dest.icon}</span>
                  <span className="text-sm">{dest.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-4">
              No recent trips. Book your first ride!
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/past-trips')}
              className="w-full"
            >
              View All Trips
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation role="passenger" />
    </div>
  );
};

export default PassengerHome;
