
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UpcomingRideBlock from "@/components/trips/UpcomingRideBlock";
import PastRideBlock from "@/components/trips/PastRideBlock";
import NoTripsMessageBlock from "@/components/trips/NoTripsMessageBlock";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  scheduled_time: string;
  status: string;
  fare?: number;
  description?: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
}

const PastTrips = () => {
  const navigate = useNavigate();
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to view your trips",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive"
        });
        return;
      }

      // Load upcoming trips
      const { data: upcoming } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userRecord.id)
        .eq('role', 'passenger')
        .gt('scheduled_time', new Date().toISOString())
        .in('status', ['pending', 'matched'])
        .order('scheduled_time', { ascending: true });

      // Load past trips
      const { data: past } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userRecord.id)
        .eq('role', 'passenger')
        .lt('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: false })
        .limit(20);

      setUpcomingTrips(upcoming || []);
      setPastTrips(past || []);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast({
        title: "Error",
        description: "Failed to load your trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookAgain = (trip: Trip) => {
    // Navigate to book ride with pre-filled data
    const bookingData = {
      fromLocation: trip.from_location,
      fromCoords: trip.from_lat && trip.from_lng ? {
        lat: trip.from_lat,
        lng: trip.from_lng
      } : null,
      toLocation: trip.to_location,
      toCoords: trip.to_lat && trip.to_lng ? {
        lat: trip.to_lat,
        lng: trip.to_lng
      } : null,
      vehicleType: trip.vehicle_type,
      comments: trip.description || ''
    };

    navigate('/book-ride', { state: { bookingData } });
    toast({
      title: "Trip details copied!",
      description: "Tap confirm to book again."
    });
  };

  const handleSaveAsFavorite = async (trip: Trip) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) return;

      // Prompt for label
      const label = prompt("Enter a name for this favorite location:", trip.to_location);
      if (!label) return;

      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: userRecord.id,
          label,
          address: trip.to_location,
          lat: trip.to_lat,
          lng: trip.to_lng
        }]);

      if (error) throw error;

      toast({
        title: "⭐ Saved as favorite!",
        description: `"${label}" added to your favorites`
      });
    } catch (error) {
      console.error('Error saving favorite:', error);
      toast({
        title: "Error",
        description: "Failed to save as favorite",
        variant: "destructive"
      });
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'cancelled' })
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Trip cancelled",
        description: "Your trip has been cancelled successfully"
      });

      // Reload trips
      loadTrips();
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast({
        title: "Error",
        description: "Failed to cancel trip",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppDriver = (trip: Trip) => {
    const message = encodeURIComponent(
      `Hi! Just reminding you I'm booked on your trip from ${trip.from_location} to ${trip.to_location} at ${new Date(trip.scheduled_time).toLocaleString()}. See you there!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  const hasNoTrips = upcomingTrips.length === 0 && pastTrips.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home/passenger')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">My Trips</h1>
            <p className="text-sm text-gray-500">Your ride history & upcoming bookings</p>
          </div>
        </div>
      </div>

      {hasNoTrips ? (
        <NoTripsMessageBlock onBookFirstTrip={() => navigate('/book-ride')} />
      ) : (
        <div className="p-4 space-y-6">
          {/* Upcoming Rides Section */}
          {upcomingTrips.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Upcoming Rides
              </h2>
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <UpcomingRideBlock
                    key={trip.id}
                    trip={trip}
                    onWhatsAppDriver={() => handleWhatsAppDriver(trip)}
                    onCancelTrip={() => handleCancelTrip(trip.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Trips Section */}
          {pastTrips.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📜</span>
                Past Trips
              </h2>
              <div className="space-y-3">
                {pastTrips.map((trip) => (
                  <PastRideBlock
                    key={trip.id}
                    trip={trip}
                    onBookAgain={() => handleBookAgain(trip)}
                    onSaveAsFavorite={() => handleSaveAsFavorite(trip)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PastTrips;
