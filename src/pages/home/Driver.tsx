
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, MapPin, Users, Car, DollarSign } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DriverHome = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [driverStats, setDriverStats] = useState({
    activeTrips: 0,
    todayEarnings: 0,
    weeklyTrips: 0
  });

  useEffect(() => {
    loadDriverStats();
  }, [user]);

  const loadDriverStats = async () => {
    if (!user) return;
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userData) {
        // Load active trips
        const { data: trips } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', userData.id)
          .eq('role', 'driver')
          .in('status', ['pending', 'matched']);

        setDriverStats(prev => ({ ...prev, activeTrips: trips?.length || 0 }));
      }
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  };

  const handleToggleOnline = async (online: boolean) => {
    setIsOnline(online);
    
    if (online) {
      toast({
        title: "🟢 You're Online!",
        description: "Passengers can now see your trips and request rides"
      });
    } else {
      toast({
        title: "⚫ You're Offline",
        description: "You won't receive new ride requests"
      });
    }
  };

  const quickActions = [
    {
      title: "Create New Trip",
      description: "Post where you're going",
      icon: <Plus className="w-6 h-6" />,
      action: () => navigate('/create-trip'),
      color: "bg-gradient-to-r from-green-500 to-blue-500"
    },
    {
      title: "View Requests",
      description: "See passenger requests",
      icon: <Users className="w-6 h-6" />,
      action: () => navigate('/driver-requests'),
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">Driver Dashboard</p>
              <p className="font-semibold">Welcome back!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Status</p>
            <p className="font-semibold">{isOnline ? '🟢 Online' : '⚫ Offline'}</p>
          </div>
        </div>
      </div>

      {/* Online Toggle */}
      <div className="p-4">
        <Card className={`border-2 ${isOnline ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {isOnline ? '🟢 You\'re Online' : '⚫ Go Online'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isOnline 
                    ? 'Passengers can see your trips and request rides'
                    : 'Turn on to start receiving ride requests'
                  }
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{driverStats.activeTrips}</div>
              <div className="text-xs text-gray-600">Active Trips</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{driverStats.todayEarnings}</div>
              <div className="text-xs text-gray-600">Today's Earnings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{driverStats.weeklyTrips}</div>
              <div className="text-xs text-gray-600">This Week</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 space-y-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="overflow-hidden">
            <div className={`${action.color} p-1`}>
              <CardContent className="bg-white m-1 rounded p-4">
                <Button
                  onClick={action.action}
                  className="w-full h-16 flex items-center justify-start space-x-4 bg-transparent hover:bg-gray-50 text-gray-900 border-0 shadow-none"
                >
                  <div className="p-3 bg-gray-100 rounded-full">
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </Button>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverHome;
