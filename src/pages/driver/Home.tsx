import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { DriverTrip } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Settings } from 'lucide-react';

const DriverHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;

      // Skip database queries for local sessions
      if (user.id.startsWith('local-')) {
        setIsLoading(false);
        setTrips([]); // No trips for local users
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await apiClient.trips.getDriverTrips(user.id);
        if (response.success && response.data) {
          setTrips(response.data);
        } else {
          console.error('Failed to fetch trips:', response.error?.message);
        }
      } catch (error) {
        console.error('Error fetching driver trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  if (authLoading || isLoading) {
    return <div className="p-4 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Driver Dashboard" 
        showBack={false} 
        showHome={false}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Action Buttons Row */}
        <div className="flex gap-3 mb-4">
          <Link to="/driver/create-trip" className="flex-1">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Post Trip
            </Button>
          </Link>
          <Link to="/driver/vehicle-setup">
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">My Posted Trips</h2>
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
    </div>
  );
};

export default DriverHome; 