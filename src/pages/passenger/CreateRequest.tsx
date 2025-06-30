import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleLocationPicker } from '@/components/maps/SimpleLocationPicker';
import { SmartTimePicker } from '@/components/ui/smart-time-picker';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { VehicleType, PassengerTrip, MapLocation } from '@/types';
import { Car, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [fromLocation, setFromLocation] = useState<MapLocation | null>(null);
  const [toLocation, setToLocation] = useState<MapLocation | null>(null);
  const [departureTime, setDepartureTime] = useState(new Date().toISOString());
  const [vehicleType, setVehicleType] = useState<VehicleType | 'any'>('any');
  const [loading, setLoading] = useState(false);

  const handleFromLocationSelect = (location: MapLocation) => {
    console.log('From location selected:', location);
    setFromLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address || 'Selected Location'
    });
  };

  const handleToLocationSelect = (location: MapLocation) => {
    console.log('To location selected:', location);
    setToLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address || 'Selected Location'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { fromLocation, toLocation, departureTime, vehicleType });
    
    if (!user) {
      toast({
        title: "Connection Required",
        description: "Please check your internet connection.",
        variant: "destructive"
      });
      return;
    }

    if (!fromLocation || !toLocation) {
      toast({
        title: "Missing Locations",
        description: "Please select both pickup and destination locations.",
        variant: "destructive"
      });
      return;
    }

    if (!departureTime) {
      toast({
        title: "Missing Departure Time",
        description: "Please select when you want to travel.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate expiry time (24 hours from departure time)
      const departureDate = new Date(departureTime);
      const expiresAt = new Date(departureDate.getTime() + 24 * 60 * 60 * 1000);

      const tripData: Partial<PassengerTrip> = {
        passenger_id: user.id,
        from_address: fromLocation.address,
        to_address: toLocation.address,
        from_lat: fromLocation.lat,
        from_lng: fromLocation.lng,
        to_lat: toLocation.lat,
        to_lng: toLocation.lng,
        requested_departure_time: departureTime,
        vehicle_type: vehicleType,
        expires_at: expiresAt.toISOString(),
      };

      console.log('Creating trip with data:', tripData);

      const response = await apiClient.trips.createPassengerTrip(tripData);

      if (response.success && response.data) {
        toast({
          title: "Request Created!",
          description: "Your ride request has been posted. Looking for matches...",
        });
        
        // Navigate to passenger home which will show the active request
        navigate('/passenger/home');
      } else {
        throw new Error(response.error?.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating passenger trip:', error);
      toast({
        title: "Error",
        description: "Failed to create your ride request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: VehicleType | 'any') => {
    switch (type) {
      case VehicleType.MOTO: return '🏍️';
      case VehicleType.CAR: return '🚗';
      case VehicleType.TUKTUK: return '🛺';
      case VehicleType.MINIBUS: return '🚐';
      default: return '🚗';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Request a Ride
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Location - Pickup with 3 options */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Pickup Location
              </Label>
              <SimpleLocationPicker
                onLocationSelect={handleFromLocationSelect}
                placeholder="Where do you want to be picked up?"
                selectedLocation={fromLocation}
                showCurrentLocation={true}
                type="pickup"
              />
            </div>

            {/* To Location - Destination with 2 options */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Destination
              </Label>
              <SimpleLocationPicker
                onLocationSelect={handleToLocationSelect}
                placeholder="Where are you going?"
                selectedLocation={toLocation}
                showCurrentLocation={false}
                type="destination"
              />
            </div>

            {/* Smart Departure Time */}
            <div className="space-y-2">
              <SmartTimePicker
                value={departureTime}
                onChange={(v) => setDepartureTime(typeof v === 'string' ? v : v.toISOString())}
                label="When do you want to travel?"
              />
            </div>

            {/* Vehicle Type Preference */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Vehicle Preference</Label>
              <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType | 'any')}>
                <SelectTrigger className="h-12">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getVehicleIcon(vehicleType)}</span>
                      <span>
                        {vehicleType === 'any' ? 'Any Vehicle' : 
                         vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚗</span>
                      <span>Any Vehicle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={VehicleType.MOTO}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏍️</span>
                      <span>Motorcycle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={VehicleType.CAR}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚗</span>
                      <span>Car</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={VehicleType.TUKTUK}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🛺</span>
                      <span>Tuk-Tuk</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={VehicleType.MINIBUS}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚐</span>
                      <span>Minibus</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trip Summary */}
            {fromLocation && toLocation && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">Trip Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="truncate">{fromLocation.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="truncate">{toLocation.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{new Date(departureTime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg" 
              disabled={loading || !fromLocation || !toLocation || !user}
            >
              {loading ? 'Creating Request...' : 'Find My Ride'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRequest; 