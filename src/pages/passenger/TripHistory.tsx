import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/hooks/useLocalization';
import { Car, Clock, MapPin, Calendar } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  status: string;
  vehicle_type: string;
  fare?: number;
  created_at: string;
}

const TripHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { getOfflineTrips, isOnline } = useOfflineStorage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripHistory();
  }, [user]);

  const fetchTripHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get offline trips first
      const offlineTrips = getOfflineTrips('passenger');
      
      if (isOnline && !user.id.startsWith('local-')) {
        // Fetch from database when online
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'passenger')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching trip history:', error);
        } else {
          // Combine online and offline trips
          const combinedTrips = [
            ...offlineTrips.map(trip => ({
              ...trip,
              id: trip.id || `offline-${Date.now()}`,
              from_location: trip.from_location || '',
              to_location: trip.to_location || '',
              scheduled_time: trip.scheduled_time || new Date().toISOString(),
              status: trip.status || 'pending',
              vehicle_type: trip.vehicle_type || 'car',
              created_at: trip.created_at || new Date().toISOString(),
            })),
            ...(data || [])
          ];
          
          // Remove duplicates and sort by created_at
          const uniqueTrips = combinedTrips.filter((trip, index, self) => 
            index === self.findIndex(t => t.id === trip.id)
          ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setTrips(uniqueTrips);
        }
      } else {
        // Use only offline trips when offline
        setTrips(offlineTrips.map(trip => ({
          ...trip,
          id: trip.id || `offline-${Date.now()}`,
          from_location: trip.from_location || '',
          to_location: trip.to_location || '',
          scheduled_time: trip.scheduled_time || new Date().toISOString(),
          status: trip.status || 'pending',
          vehicle_type: trip.vehicle_type || 'car',
          created_at: trip.created_at || new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Error in fetchTripHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'moto': return '🏍️';
      case 'car': return '🚗';
      case 'tuktuk': return '🛺';
      case 'minibus': return '🚐';
      default: return '🚗';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/passenger/trip-details/${tripId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Trip History" showBack={true} showHome={true} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Trip History" showBack={true} showHome={true} />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isOnline && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">
                📴 {t('offline_mode')} - Showing cached trips. Data will sync when online.
              </p>
            </CardContent>
          </Card>
        )}

        {trips.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No trips yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your ride history will appear here once you start booking trips.
              </p>
              <Button onClick={() => navigate('/passenger/request')}>
                {t('book_ride')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          trips.map((trip) => (
            <Card 
              key={trip.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTripClick(trip.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getVehicleIcon(trip.vehicle_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t(trip.vehicle_type)}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(trip.scheduled_time)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(trip.status)}>
                    {t(trip.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Route Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600 truncate">{trip.from_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600 truncate">{trip.to_location}</span>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(trip.created_at)}</span>
                    </div>
                    {trip.fare && (
                      <span className="font-medium">{trip.fare} RWF</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Quick Actions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">Need another ride?</h3>
                <p className="text-sm text-blue-600">Book your next trip quickly</p>
              </div>
              <Button onClick={() => navigate('/passenger/request')} size="sm">
                {t('book_ride')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripHistory;