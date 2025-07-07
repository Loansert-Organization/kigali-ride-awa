import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Calendar, MapPin, Clock, Users, DollarSign, Search, Filter, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

interface TripHistoryItem {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  fare_per_seat: number;
  available_seats: number;
  status: string;
  passengers_count: number;
  total_earnings: number;
  created_at: string;
  rating?: number;
}

const DriverTripHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadTripHistory();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, filterStatus]);

  const loadTripHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.trips.getDriverTrips(user.id);
      
      if (response.success && response.data) {
        const tripsWithMockData = response.data.map(trip => ({
          ...trip,
          passengers_count: Math.floor(Math.random() * (trip.available_seats || 1)) + 1,
          total_earnings: (trip.fare_per_seat || 0) * (Math.floor(Math.random() * (trip.available_seats || 1)) + 1),
          rating: Math.random() > 0.3 ? Math.round((Math.random() * 2 + 3) * 10) / 10 : undefined
        }));
        setTrips(tripsWithMockData);
      }
    } catch (error) {
      console.error('Failed to load trip history:', error);
      toast({
        title: t('error'),
        description: t('failed_load_trip_history'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = trips;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trip => 
        trip.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.to_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(trip => trip.status === filterStatus);
    }

    setFilteredTrips(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'default',
      'matched': 'secondary',
      'completed': 'default',
      'cancelled': 'destructive'
    } as const;

    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'matched': 'bg-blue-100 text-blue-800', 
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {t(status)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    const completedTrips = trips.filter(t => t.status === 'completed');
    return {
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      totalEarnings: completedTrips.reduce((sum, trip) => sum + (trip.total_earnings || 0), 0),
      averageRating: completedTrips.length > 0 
        ? completedTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / completedTrips.length 
        : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('trip_history')} 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTrips}</div>
                <div className="text-sm text-gray-500">{t('total_trips')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
                <div className="text-sm text-gray-500">{t('completed')}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalEarnings.toLocaleString()} RWF</div>
                <div className="text-sm text-gray-500">{t('total_earnings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">{t('avg_rating')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('search_trips')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {t(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trip History List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('no_trips_found')}</h3>
              <p className="text-gray-500 mb-4">{t('start_posting_trips_desc')}</p>
              <Button onClick={() => navigate('/driver/create-trip')}>
                {t('post_trip')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">{trip.from_location}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 flex justify-center">
                          <div className="w-0.5 h-4 bg-gray-300"></div>
                        </div>
                        <span className="font-medium text-sm">{trip.to_location}</span>
                      </div>
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(trip.scheduled_time)} at {formatTime(trip.scheduled_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{trip.passengers_count || 0} / {trip.available_seats} {t('passengers')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {trip.total_earnings?.toLocaleString() || 0} RWF
                      </span>
                    </div>
                    {trip.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{trip.rating}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTripHistory;