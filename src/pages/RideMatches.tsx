
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MatchesMapBlock from "@/components/matches/MatchesMapBlock";
import DriverTripCardBlock from "@/components/matches/DriverTripCardBlock";
import FiltersBlock from "@/components/matches/FiltersBlock";
import NoMatchFallbackBlock from "@/components/matches/NoMatchFallbackBlock";

interface Trip {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  is_negotiable?: boolean;
  description?: string;
  role: string;
}

interface Filters {
  vehicleType: string[];
  timeRange: string;
  sortBy: string;
}

const RideMatches = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passengerTrip, setPassengerTrip] = useState<Trip | null>(null);
  const [matchingTrips, setMatchingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    vehicleType: [],
    timeRange: 'all',
    sortBy: 'best_match'
  });

  useEffect(() => {
    loadMatchingTrips();
  }, [filters]);

  const loadMatchingTrips = async () => {
    try {
      setLoading(true);
      
      // Get the passenger's trip context (could come from location state or latest trip)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) return;

      // Get passenger's latest trip or from navigation state
      let currentTrip = location.state?.trip;
      if (!currentTrip) {
        const { data: latestTrip } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', userRecord.id)
          .eq('role', 'passenger')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        currentTrip = latestTrip;
      }

      setPassengerTrip(currentTrip);

      if (!currentTrip) {
        setLoading(false);
        return;
      }

      // Build query for matching driver trips
      let query = supabase
        .from('trips')
        .select('*')
        .eq('role', 'driver')
        .eq('status', 'pending')
        .gte('scheduled_time', new Date().toISOString());

      // Apply vehicle type filter
      if (filters.vehicleType.length > 0) {
        query = query.in('vehicle_type', filters.vehicleType);
      }

      // Apply time range filter
      if (filters.timeRange !== 'all') {
        const now = new Date();
        let timeLimit = new Date(now);
        
        switch (filters.timeRange) {
          case 'next_30min':
            timeLimit.setMinutes(now.getMinutes() + 30);
            break;
          case 'next_1hour':
            timeLimit.setHours(now.getHours() + 1);
            break;
          case 'today':
            timeLimit.setHours(23, 59, 59);
            break;
        }
        
        query = query.lte('scheduled_time', timeLimit.toISOString());
      }

      const { data: driverTrips, error } = await query;

      if (error) throw error;

      // Sort trips by best match (basic proximity for now)
      const sortedTrips = driverTrips?.sort((a, b) => {
        if (filters.sortBy === 'time') {
          return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
        }
        if (filters.sortBy === 'fare') {
          return (a.fare || 0) - (b.fare || 0);
        }
        // Default: best match (basic implementation)
        return 0;
      }) || [];

      setMatchingTrips(sortedTrips);
    } catch (error) {
      console.error('Error loading matching trips:', error);
      toast({
        title: "Error",
        description: "Failed to load matching trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTrip = async (driverTrip: Trip) => {
    if (!passengerTrip) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          passenger_trip_id: passengerTrip.id,
          driver_trip_id: driverTrip.id,
          confirmed: true,
          whatsapp_launched: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎉 Match confirmed!",
        description: "You can now contact the driver via WhatsApp",
      });

      // Refresh the trips to show updated status
      loadMatchingTrips();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to confirm match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppLaunch = (driverTrip: Trip) => {
    const message = `Hi! I've booked your trip from ${driverTrip.from_location} to ${driverTrip.to_location} at ${new Date(driverTrip.scheduled_time).toLocaleTimeString()} via Kigali Ride. Looking forward to it!`;
    const encodedMessage = encodeURIComponent(message);
    
    // Launch WhatsApp (this would need driver's phone number from user profile)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Update booking to mark WhatsApp as launched
    // This would need the booking ID to update whatsapp_launched = true
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Available Rides</h1>
            <p className="text-sm text-gray-500">
              {matchingTrips.length} matches found
            </p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {passengerTrip && (
        <MatchesMapBlock
          passengerTrip={passengerTrip}
          driverTrips={matchingTrips}
        />
      )}

      {/* Filters */}
      <div className="p-4">
        <FiltersBlock
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={loadMatchingTrips}
        />
      </div>

      {/* Matches List */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : matchingTrips.length > 0 ? (
          <div className="space-y-4">
            {matchingTrips.map((trip) => (
              <DriverTripCardBlock
                key={trip.id}
                trip={trip}
                onMatch={() => handleMatchTrip(trip)}
                onWhatsApp={() => handleWhatsAppLaunch(trip)}
              />
            ))}
          </div>
        ) : (
          <NoMatchFallbackBlock onBackToBooking={() => navigate('/book-ride')} />
        )}
      </div>
    </div>
  );
};

export default RideMatches;
