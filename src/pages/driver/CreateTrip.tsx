import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleLocationPicker } from '@/components/maps/SimpleLocationPicker';
import { SmartTimePicker } from '@/components/ui/smart-time-picker';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { DriverTrip, MapLocation, DriverVehicle } from '@/types';
import { Clock, Car, Users, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [vehicles, setVehicles] = useState<DriverVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fromLocation, setFromLocation] = useState<MapLocation | null>(null);
  const [toLocation, setToLocation] = useState<MapLocation | null>(null);
  const [departureTime, setDepartureTime] = useState(new Date().toISOString());
  const [availableSeats, setAvailableSeats] = useState('1');
  const [farePerSeat, setFarePerSeat] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch driver's vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      
      // For local sessions, only use localStorage
      if (user.id.startsWith('local-')) {
        const storedVehicle = localStorage.getItem('driverVehicle');
        if (storedVehicle) {
          const vehicle = JSON.parse(storedVehicle);
          setVehicles([vehicle]);
          setSelectedVehicleId(vehicle.id);
        }
        return;
      }
      
      // For real users, try to fetch from database first, using profile ID
      const driverRowId = userProfile?.id ?? user.id;
      const { data, error } = await supabase
        .from('driver_vehicles')
        .select('*')
        .eq('driver_id', driverRowId);
        
      if (error) {
        console.error('Error fetching vehicles:', error);
        
        // Fallback to localStorage on error
        const storedVehicle = localStorage.getItem('driverVehicle');
        if (storedVehicle) {
          const vehicle = JSON.parse(storedVehicle);
          setVehicles([vehicle]);
          setSelectedVehicleId(vehicle.id);
        }
      } else if (data && data.length > 0) {
        setVehicles(data as DriverVehicle[]);
        setSelectedVehicleId(data[0].id);
      } else {
        // No vehicles in DB, check localStorage
        const storedVehicle = localStorage.getItem('driverVehicle');
        if (storedVehicle) {
          const vehicle = JSON.parse(storedVehicle);
          setVehicles([vehicle]);
          setSelectedVehicleId(vehicle.id);
        }
      }
    };
    
    fetchVehicles();
  }, [user, userProfile]);

  const handleFromLocationSelect = (location: MapLocation) => {
    setFromLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address || 'Selected Location'
    });
  };

  const handleToLocationSelect = (location: MapLocation) => {
    setToLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address || 'Selected Location'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Connection Required",
        description: "Please check your internet connection.",
        variant: "destructive"
      });
      return;
    }

    // For local sessions, simulate success and prevent network call
    if (user.id.startsWith('local-')) {
      setLoading(true);
      toast({
        title: "Trip Posted! (Local)",
        description: "Your trip has been saved locally. This is a preview and will not be visible to other users.",
      });
      setTimeout(() => {
        setLoading(false);
        navigate('/driver/home');
      }, 1000);
      return;
    }

    if (!selectedVehicleId) {
      toast({
        title: "Vehicle Required",
        description: "Please add a vehicle first to post trips.",
        variant: "destructive"
      });
      return;
    }

    if (!fromLocation || !toLocation) {
      toast({
        title: "Missing Locations",
        description: "Please select both departure and destination locations.",
        variant: "destructive"
      });
      return;
    }

    if (!farePerSeat || parseFloat(farePerSeat) <= 0) {
      toast({
        title: "Invalid Fare",
        description: "Please enter a valid fare per seat.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const tripData: Partial<DriverTrip> = {
        driver_id: userProfile?.id ?? user.id,
        vehicle_id: selectedVehicleId,
        from_address: fromLocation.address,
        to_address: toLocation.address,
        from_lat: fromLocation.lat,
        from_lng: fromLocation.lng,
        to_lat: toLocation.lat,
        to_lng: toLocation.lng,
        scheduled_departure_time: departureTime,
        available_seats: parseInt(availableSeats),
        fare_per_seat: Math.round(parseFloat(farePerSeat) * 100), // Store in cents
      };

      const response = await apiClient.trips.createDriverTrip(tripData);

      if (response.success && response.data) {
        toast({
          title: "Trip Posted!",
          description: "Your trip has been posted. Passengers can now book seats.",
        });
        
        navigate('/driver/home');
      } else {
        throw new Error(response.error?.message || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating driver trip:', error);
      toast({
        title: "Error",
        description: "Failed to post your trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVehicleDisplay = (vehicle: DriverVehicle) => {
    const typeIcon = {
      moto: '🏍️',
      car: '🚗',
      tuktuk: '🛺',
      minibus: '🚐'
    }[vehicle.vehicle_type] || '🚗';
    
    return `${typeIcon} ${vehicle.license_plate}${vehicle.model ? ` - ${vehicle.color || ''} ${vehicle.model}` : ''}`;
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Vehicles Found</h2>
            <p className="text-gray-600 mb-4">
              You need to add a vehicle before you can post trips.
            </p>
            <Button onClick={() => navigate('/driver/vehicle-setup')}>
              Add Vehicle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Post a Trip" 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Post a Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Your Vehicle</Label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {getVehicleDisplay(vehicle)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Location - Departure with current location option */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Departure Location
                </Label>
                <SimpleLocationPicker
                  onLocationSelect={handleFromLocationSelect}
                  placeholder="Where are you starting from?"
                  selectedLocation={fromLocation}
                  showCurrentLocation={true}
                  type="pickup"
                />
              </div>

              {/* To Location - Destination */}
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
                  label="When do you plan to leave?"
                />
              </div>

              {/* Available Seats and Fare Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Available Seats */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <Users className="w-4 h-4" />
                    Seats
                  </Label>
                  <Select value={availableSeats} onValueChange={setAvailableSeats}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} seat{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fare Per Seat */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <DollarSign className="w-4 h-4" />
                    Fare (RWF)
                  </Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={farePerSeat}
                    onChange={(e) => setFarePerSeat(e.target.value)}
                    min="1"
                    step="1"
                    className="h-12 text-center"
                  />
                </div>
              </div>

              {/* Trip Summary */}
              {fromLocation && toLocation && farePerSeat && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-green-800 mb-2">Trip Summary</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="truncate">{fromLocation.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="truncate">{toLocation.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span>{new Date(departureTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="font-semibold text-green-800">
                          {availableSeats} seat{parseInt(availableSeats) > 1 ? 's' : ''} @ {farePerSeat} RWF
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={loading || !fromLocation || !toLocation || !farePerSeat || !user}
              >
                {loading ? 'Posting Trip...' : 'Post Your Trip'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTrip; 