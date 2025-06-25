
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PastRideBlock from '@/components/trips/PastRideBlock';
import NoTripsMessageBlock from '@/components/trips/NoTripsMessageBlock';

const PastTrips = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, user } = useAuth();

  const { data: trips, isLoading } = useQuery({
    queryKey: ['past-trips', user?.id],
    queryFn: async () => {
      if (!user?.id && !userProfile?.id) return [];
      
      // For authenticated users, query by auth_user_id
      if (user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userData) {
          const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('user_id', userData.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data || [];
        }
      }
      
      return [];
    },
    enabled: !authLoading && (!!user?.id || !!userProfile?.id)
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select your role first</p>
          <a href="/" className="text-purple-600 underline">Go to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            📝 Past Trips
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!trips || trips.length === 0 ? (
          <NoTripsMessageBlock role={userProfile.role || 'passenger'} />
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <PastRideBlock key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      {userProfile.role && <BottomNavigation role={userProfile.role} />}
    </div>
  );
};

export default PastTrips;
