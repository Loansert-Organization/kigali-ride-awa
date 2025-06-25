
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MapPin, Clock, Users, DollarSign, User, Plus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/navigation/BottomNavigation";

const DriverHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
    loadDriverProfile();
    loadMyTrips();
    loadPendingRequests();
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

  const loadDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data: profile } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', userRecord.id)
            .single();
          
          if (profile) {
            setDriverProfile(profile);
            setIsOnline(profile.is_online);
          } else {
            // Redirect to driver setup if no profile exists
            navigate('/setup-driver');
          }
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  const loadMyTrips = async () => {
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
            .from('trips')
            .select('*')
            .eq('user_id', userRecord.id)
            .eq('role', 'driver')
            .in('status', ['pending', 'matched'])
            .order('created_at', { ascending: false });
          
          setMyTrips(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading my trips:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      // Load passenger trip requests that could match driver's routes
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'passenger')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!driverProfile) return;

    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', driverProfile.user_id);

      if (error) throw error;

      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus 
          ? "You'll receive ride requests from passengers" 
          : "You won't receive new ride requests",
      });
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Driver Dashboard</h1>
            <p className="text-blue-100">
              {driverProfile?.vehicle_type} • {driverProfile?.plate_number}
            </p>
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

      <div className="p-4">
        {/* Online Status Toggle */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Status</h3>
                <p className="text-sm text-gray-600">
                  {isOnline ? 'Available for rides' : 'Not accepting rides'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={toggleOnlineStatus}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={() => navigate('/create-trip')}
            className="h-16 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
          >
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Create Trip</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/requests')}
            className="h-16"
          >
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">View Requests</span>
              {pendingRequests.length > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  {pendingRequests.length} new
                </div>
              )}
            </div>
          </Button>
        </div>

        {/* My Active Trips */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">My Trips</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-trips')}
              >
                View all
              </Button>
            </div>
            
            {myTrips.length > 0 ? (
              <div className="space-y-3">
                {myTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-3 hover:bg-gray-50">
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            trip.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {trip.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {trip.fare && (
                          <div className="text-lg font-bold text-green-600">
                            {trip.fare} RWF
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {trip.seats_available} seats
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No active trips</p>
                <p className="text-sm">Create a trip to start earning</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passenger Requests */}
        {isOnline && (
          <Card className="mb-20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Nearby Requests</h3>
              {pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{request.from_location}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="text-sm">{request.to_location}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(request.scheduled_time).toLocaleTimeString()}
                            </span>
                            <span className="capitalize">{request.vehicle_type}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No passenger requests</p>
                  <p className="text-sm">They'll appear here when available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverHome;
