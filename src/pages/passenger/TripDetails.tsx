import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/hooks/useLocalization';
import { WhatsAppLaunchButton } from '@/components/trip/WhatsAppLaunchButton';
import { 
  Car, 
  Clock, 
  MapPin, 
  Calendar, 
  Phone, 
  MessageCircle,
  Navigation,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TripDetails {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_time: string;
  status: string;
  vehicle_type: string;
  fare?: number;
  created_at: string;
  updated_at: string;
  seats_available?: number;
  description?: string;
  driver_phone?: string;
  driver_name?: string;
}

const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    if (!tripId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Handle offline trips
      if (tripId.startsWith('offline-') || user.id.startsWith('local-')) {
        // For demo purposes, create a mock trip
        setTrip({
          id: tripId,
          from_location: 'Your Location',
          to_location: 'Destination',
          scheduled_time: new Date().toISOString(),
          status: 'pending',
          vehicle_type: 'car',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          bookings(
            id,
            driver_trip_id,
            confirmed,
            whatsapp_launched
          )
        `)
        .eq('id', tripId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching trip details:', error);
        toast({
          title: "Error",
          description: "Could not load trip details",
          variant: "destructive"
        });
        navigate('/passenger/history');
        return;
      }

      setTrip(data);
    } catch (error) {
      console.error('Error in fetchTripDetails:', error);
      toast({
        title: "Error",
        description: "Could not load trip details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!trip || !user) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', trip.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Trip Cancelled",
        description: "Your trip has been cancelled successfully",
      });

      // Update local state
      setTrip(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast({
        title: "Error",
        description: "Could not cancel trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'matched': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const canCancelTrip = trip && ['pending', 'matched'].includes(trip.status);
  const isActiveTrip = trip && ['pending', 'matched'].includes(trip.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Trip Details" showBack={true} showHome={true} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Trip Details" showBack={true} showHome={true} />
        <div className="max-w-md mx-auto p-4 text-center py-20">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Trip not found</h3>
          <p className="text-sm text-gray-500 mb-4">
            The trip you're looking for could not be found.
          </p>
          <Button onClick={() => navigate('/passenger/history')}>
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Trip Details" showBack={true} showHome={true} />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Trip Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getVehicleIcon(trip.vehicle_type)}
                </div>
                <div>
                  <CardTitle className="text-xl">{t(trip.vehicle_type)}</CardTitle>
                  <p className="text-sm text-gray-600">Trip #{trip.id.slice(-8)}</p>
                </div>
              </div>
              <Badge className={getStatusColor(trip.status)}>
                {t(trip.status)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-medium">{trip.from_location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium">{trip.to_location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{formatDateTime(trip.scheduled_time)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Created: {formatDateTime(trip.created_at)}</p>
                <p>Last updated: {formatDateTime(trip.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.fare && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fare</span>
                <span className="font-medium">{trip.fare} RWF</span>
              </div>
            )}
            
            {trip.seats_available && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seats Available</span>
                <span className="font-medium">{trip.seats_available}</span>
              </div>
            )}
            
            {trip.description && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Notes</p>
                <p className="text-sm">{trip.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Contact (if matched) */}
        {trip.status === 'matched' && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Driver Assigned</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trip.driver_name && (
                <p className="font-medium">{trip.driver_name}</p>
              )}
              
              <div className="flex gap-2">
                {trip.driver_phone && (
                  <WhatsAppLaunchButton
                    phoneNumber={trip.driver_phone}
                    message={`Hi! I'm your passenger for the trip from ${trip.from_location} to ${trip.to_location} scheduled for ${formatDateTime(trip.scheduled_time)}.`}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </WhatsAppLaunchButton>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${trip.driver_phone}`, '_self')}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isActiveTrip && (
            <Button
              onClick={fetchTripDetails}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          )}

          {canCancelTrip && (
            <Button
              onClick={handleCancelTrip}
              variant="destructive"
              className="w-full"
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Trip'}
            </Button>
          )}

          {trip.status === 'completed' && (
            <Button
              onClick={() => navigate('/passenger/request')}
              className="w-full"
            >
              Book Another Trip
            </Button>
          )}
        </div>

        {/* Support */}
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Need help with this trip?</p>
            <Button variant="link" size="sm">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;