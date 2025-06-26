
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, MapPin, User, Settings, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  fare: number | null;
  seats_available: number;
  status: string;
}

interface DriverProfile {
  vehicle_type: string;
  plate_number: string;
  is_online: boolean;
}

const DriverHome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isGuest, setGuestRole } = useAuth();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Set role for guest users
    if (isGuest) {
      setGuestRole('driver');
    }
    
    if (isAuthenticated && userProfile) {
      fetchDriverData();
    } else {
      setLoading(false);
    }
  }, [isGuest, setGuestRole, isAuthenticated, userProfile]);

  const fetchDriverData = async () => {
    if (!userProfile) return;

    try {
      // Fetch driver profile
      const { data: profile, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setDriverProfile(profile);
      setIsOnline(profile?.is_online || false);

      // Fetch driver trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('role', 'driver')
        .order('scheduled_time', { ascending: true });

      if (tripsError) throw tripsError;
      setMyTrips(trips || []);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!userProfile || !driverProfile) {
      toast({
        title: "Vehicle setup required",
        description: "Please set up your vehicle first",
        variant: "destructive"
      });
      navigate('/vehicle-setup');
      return;
    }

    const newStatus = !isOnline;
    
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', userProfile.id);

      if (error) throw error;

      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're now online!" : "You're now offline",
        description: newStatus ? "Passengers can see your trips" : "Your trips are hidden from passengers",
      });
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Driver Dashboard</h1>
              <p className="text-sm text-gray-600">
                {isGuest ? 'Browsing as Guest Driver' : `Welcome, ${userProfile?.promo_code}`}
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
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-sm text-green-800">
              🚗 You're browsing as a guest driver. Post a trip to verify with WhatsApp.
            </p>
          </div>
        )}

        {/* Online Status Card - only for authenticated users */}
        {isAuthenticated && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Online Status</h3>
                  <p className="text-sm text-gray-600">
                    {isOnline ? 'Passengers can see your trips' : 'Your trips are hidden'}
                  </p>
                </div>
                <Switch
                  checked={isOnline}
                  onCheckedChange={toggleOnlineStatus}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Setup - for authenticated users without vehicle */}
        {isAuthenticated && !driverProfile && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Vehicle Setup Required</h3>
              <p className="text-sm text-orange-800 mb-3">
                Add your vehicle details to start posting trips and earning money.
              </p>
              <Button 
                onClick={() => navigate('/vehicle-setup')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Set Up Vehicle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/create-trip')}
            className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Post Trip</span>
          </Button>
          
          <Button
            onClick={() => navigate('/vehicle-setup')}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm">Vehicle</span>
          </Button>
        </div>

        {/* My Trips */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">My Posted Trips</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          ) : myTrips.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No trips posted yet</p>
                <p className="text-sm text-gray-500">Post your first trip to start earning!</p>
                <Button 
                  onClick={() => navigate('/create-trip')}
                  className="mt-3"
                  size="sm"
                >
                  Post Your First Trip
                </Button>
              </CardContent>
            </Card>
          ) : (
            myTrips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={trip.status === 'pending' ? 'default' : 'secondary'}>
                          {trip.status}
                        </Badge>
                        <Badge variant="outline">{trip.vehicle_type}</Badge>
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
                    <div className="ml-4 text-right">
                      {trip.fare && (
                        <div className="font-semibold text-green-600">{trip.fare} RWF</div>
                      )}
                      <div className="text-xs text-gray-500">{trip.seats_available} seats</div>
                    </div>
                  </div>
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
            <Button variant="ghost" size="sm" className="flex-col space-y-1 text-green-600">
              <Car className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-col space-y-1"
              onClick={() => navigate('/create-trip')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Post Trip</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-col space-y-1"
              onClick={() => navigate('/vehicle-setup')}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Vehicle</span>
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

export default DriverHome;
