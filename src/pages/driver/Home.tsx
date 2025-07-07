import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { DriverTrip } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Settings } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

const DriverHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLocalization();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Skip database queries for local sessions
      if (user.id.startsWith('local-')) {
        setIsLoading(false);
        setTrips([]); // No trips for local users
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.trips.getDriverTrips(user.id);
        if (response.success && response.data) {
          setTrips(response.data);
        } else {
          setError(response.error?.message || 'Failed to fetch trips');
        }
      } catch (error) {
        console.error('Error fetching driver trips:', error);
        setError('Connection error. Please check your internet.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const refetchTrips = async () => {
    if (!user || user.id.startsWith('local-')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.trips.getDriverTrips(user.id);
      if (response.success && response.data) {
        setTrips(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch trips');
      }
    } catch (error) {
      console.error('Error fetching driver trips:', error);
      setError('Connection error. Please check your internet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title={t('profile')} 
          showBack={false} 
          showHome={false}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('profile')} 
        showBack={false} 
        showHome={false}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Action Buttons Row */}
        <div className="flex gap-3 mb-4">
          <Link to="/driver/create-trip" className="flex-1">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" /> {t('post_trip')}
            </Button>
          </Link>
          <Link to="/driver/vehicle-setup">
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('requests')}</h2>
        </div>

        {error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={refetchTrips} variant="outline">
                {t('try_again')}
              </Button>
            </CardContent>
          </Card>
        ) : trips.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">{t('no_trips')}</p>
              <Link to="/driver/create-trip">
                <Button>{t('post_trip')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          trips.map(trip => (
            <Card key={trip.id}>
              <CardContent className="p-4">
                <p className="font-semibold">{trip.from_location} ➜ {trip.to_location}</p>
                <p className="text-sm text-gray-500">{new Date(trip.scheduled_time).toLocaleString()}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {trip.status}
                  </span>
                  <span className="text-sm font-medium">
                    {trip.seats_available} {t('seats_available')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverHome; 