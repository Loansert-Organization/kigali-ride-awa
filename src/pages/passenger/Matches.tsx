import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { useActiveRequest } from '@/hooks/useActiveRequest';
import { VehicleType } from '@/types';
import { Car, Star, MapPin, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Matches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeRequest, matches, isLoadingMatches, acceptMatch } = useActiveRequest();

  if (!activeRequest) {
    navigate('/passenger/home');
    return null;
  }

  const handleAcceptMatch = async (driverTripId: string) => {
    try {
      await acceptMatch(driverTripId);
      toast({
        title: "Match Accepted!",
        description: "Your ride has been confirmed. The driver will be notified.",
      });
      navigate('/passenger/home');
    } catch {
      toast({
        title: "Error",
        description: "Failed to accept the match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getVehicleIcon = (vehicleType: VehicleType) => {
    switch (vehicleType) {
      case VehicleType.MOTO:
        return '🏍️';
      case VehicleType.CAR:
        return '🚗';
      case VehicleType.TUKTUK:
        return '🛺';
      case VehicleType.MINIBUS:
        return '🚐';
      default:
        return '🚗';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    // Simple distance calculation (Haversine formula)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Available Matches" 
        showBack={true} 
        showHome={true}
        onBack={() => navigate('/passenger/home')}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Trip Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{activeRequest.from_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium">{activeRequest.to_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{formatTime(activeRequest.requested_departure_time)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoadingMatches && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Finding available drivers...</p>
            </CardContent>
          </Card>
        )}

        {/* No Matches */}
        {!isLoadingMatches && matches.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">No matches found yet</p>
              <p className="text-sm text-gray-500">
                We'll keep looking for drivers on your route. You'll be notified when matches are available.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Match Cards */}
        {matches.map((match) => {
          const distance = calculateDistance(
            activeRequest.from_lat,
            activeRequest.from_lng,
            match.from_lat,
            match.from_lng
          );

          return (
            <Card key={match.id} className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getVehicleIcon(match.vehicle_type as VehicleType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{match.vehicle_type}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                        <span className="text-gray-400">•</span>
                        <span>{distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {match.fare_per_seat} RWF
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Route Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-green-600" />
                      <span className="text-gray-600">{match.from_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span className="text-gray-600">{match.to_address}</span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{formatTime(match.scheduled_departure_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-600" />
                      <span>{match.available_seats} seats</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleAcceptMatch(match.id)}
                    className="w-full"
                    size="sm"
                  >
                    Accept Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Keep Searching */}
        {matches.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">
                Don't see the perfect match? We'll keep searching for more drivers.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Matches; 