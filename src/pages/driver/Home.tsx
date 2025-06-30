import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { DriverTrip } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';

const DriverHome = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await apiClient.trips.getDriverTrips(user.id);
      if (data) setTrips(data);
      setLoading(false);
    };
    fetchTrips();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">My Posted Trips</h1>
        <Link to="/driver/create-trip">
          <Button><Plus className="w-4 h-4 mr-2" /> Post Trip</Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-600 mb-4">You haven't posted any trips yet.</p>
          <Link to="/driver/create-trip">
            <Button>Post Your First Trip</Button>
          </Link>
        </div>
      ) : (
        trips.map(trip => (
          <Card key={trip.id}>
            <CardContent className="p-4">
              <p className="font-semibold">{trip.from_address} ➜ {trip.to_address}</p>
              <p className="text-sm text-gray-500">{new Date(trip.scheduled_departure_time).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DriverHome; 