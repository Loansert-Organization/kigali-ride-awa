import { useState, useRef } from 'react';
import { MapPin, Clock, Calendar, Car, Check, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';

interface Place {
  place_id: string;
  description: string;
  address: string;
}

interface TripCreationWizardCompleteProps {
  onClose?: () => void;
}

export const TripCreationWizardComplete = ({ onClose }: TripCreationWizardCompleteProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [travelTime, setTravelTime] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<Place[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Place[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Place | null>(null);
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  // Mock Google Places API data for demonstration
  const mockPlacesData: Place[] = [
    { place_id: '1', description: 'Kigali International Airport', address: 'Kigali International Airport, Kigali, Rwanda' },
    { place_id: '2', description: 'Kimisagara Market', address: 'Kimisagara Market, Kigali, Rwanda' },
    { place_id: '3', description: 'Kigali Convention Centre', address: 'Kigali Convention Centre, Kigali, Rwanda' },
    { place_id: '4', description: 'University of Rwanda', address: 'University of Rwanda, Kigali, Rwanda' },
    { place_id: '5', description: 'Nyabugogo Bus Terminal', address: 'Nyabugogo Bus Terminal, Kigali, Rwanda' },
    { place_id: '6', description: 'Remera Taxi Park', address: 'Remera Taxi Park, Kigali, Rwanda' },
    { place_id: '7', description: 'Kigali City Market', address: 'Kigali City Market, Kigali, Rwanda' },
    { place_id: '8', description: 'Gikondo Industrial Park', address: 'Gikondo Industrial Park, Kigali, Rwanda' },
  ];

  const getCurrentLocation = () => {
    const currentLoc: Place = {
      place_id: 'current',
      description: 'Current Location',
      address: 'Your current location'
    };
    setCurrentLocation(currentLoc);
    setPickup(currentLoc);
    setPickupQuery('Current Location');
  };

  const searchPlaces = (query: string, setSuggestions: (places: Place[]) => void) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    const filtered = mockPlacesData.filter(place => 
      place.description.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handlePickupSearch = (query: string) => {
    setPickupQuery(query);
    searchPlaces(query, setPickupSuggestions);
  };

  const handleDropoffSearch = (query: string) => {
    setDropoffQuery(query);
    searchPlaces(query, setDropoffSuggestions);
  };

  const selectPickup = (place: Place) => {
    setPickup(place);
    setPickupQuery(place.description);
    setPickupSuggestions([]);
  };

  const selectDropoff = (place: Place) => {
    if (pickup && place.place_id === pickup.place_id) {
      setError('Pickup and drop-off must be different.');
      return;
    }
    setDropoff(place);
    setDropoffQuery(place.description);
    setDropoffSuggestions([]);
    setError('');
  };

  const handleTravelTimeChange = (value: 'now' | 'schedule') => {
    setTravelTime(value);
    setShowSchedule(value === 'schedule');
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const submitTrip = async () => {
    if (!pickup || !dropoff || !vehicleType) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a trip",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const scheduledTime = travelTime === 'schedule' && scheduledDateTime 
        ? new Date(scheduledDateTime).toISOString()
        : new Date().toISOString();

      const { data, error: submitError } = await supabase
        .from('trips_wizard')
        .insert({
          user_id: user.id,
          role: 'passenger',
          origin_text: pickup.address,
          origin_location: `POINT(-1.9441 30.0619)`, // Mock coordinates
          destination_text: dropoff.address,
          destination_location: `POINT(-1.9441 30.0619)`, // Mock coordinates
          departure_time: scheduledTime,
          vehicle_type: vehicleType,
          seats: 1,
          status: 'active'
        })
        .select()
        .single();

      if (submitError) {
        throw submitError;
      }
      
      // Reset form
      setPickup(null);
      setDropoff(null);
      setVehicleType('');
      setTravelTime('now');
      setScheduledDateTime('');
      setPickupQuery('');
      setDropoffQuery('');
      setShowSchedule(false);
      
      toast({
        title: "Trip Created Successfully!",
        description: "Your trip request has been submitted.",
      });
      
      onClose?.();
      
    } catch (err) {
      setError('Something went wrong submitting your trip. Please try again.');
      console.error('Trip submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = pickup && dropoff && vehicleType && !error;

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <h1 className="text-2xl font-bold mb-2">Book Your Ride</h1>
        <p className="text-primary-foreground/80">Choose your pickup, destination, and ride type</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Pickup Input */}
        <div className="space-y-2">
          <label className="flex items-center text-foreground font-medium">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            📍 Where from?
          </label>
          <div className="relative">
            <Input
              ref={pickupInputRef}
              placeholder="Enter pickup location"
              value={pickupQuery}
              onChange={(e) => handlePickupSearch(e.target.value)}
              className="pr-12"
            />
            <Button
              onClick={getCurrentLocation}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Navigation className="w-4 h-4" />
            </Button>
            {pickupSuggestions.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto">
                <CardContent className="p-0">
                  {pickupSuggestions.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => selectPickup(place)}
                      className="w-full text-left p-3 hover:bg-accent border-b border-border last:border-b-0"
                    >
                      <div className="font-medium">{place.description}</div>
                      <div className="text-sm text-muted-foreground">{place.address}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dropoff Input */}
        <div className="space-y-2">
          <label className="flex items-center text-foreground font-medium">
            <MapPin className="w-4 h-4 mr-2 text-red-600" />
            📍 Where to?
          </label>
          <div className="relative">
            <Input
              ref={dropoffInputRef}
              placeholder="Enter drop-off location"
              value={dropoffQuery}
              onChange={(e) => handleDropoffSearch(e.target.value)}
            />
            {dropoffSuggestions.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto">
                <CardContent className="p-0">
                  {dropoffSuggestions.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => selectDropoff(place)}
                      className="w-full text-left p-3 hover:bg-accent border-b border-border last:border-b-0"
                    >
                      <div className="font-medium">{place.description}</div>
                      <div className="text-sm text-muted-foreground">{place.address}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Travel Time Selector */}
        <div className="space-y-3">
          <label className="flex items-center text-foreground font-medium">
            <Clock className="w-4 h-4 mr-2 text-blue-600" />
            🕒 When do you want to travel?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleTravelTimeChange('now')}
              variant={travelTime === 'now' ? 'default' : 'outline'}
              className="h-auto p-4 flex-col"
            >
              <div className="text-lg mb-1">🚗</div>
              <div className="font-medium">Book Now</div>
            </Button>
            <Button
              onClick={() => handleTravelTimeChange('schedule')}
              variant={travelTime === 'schedule' ? 'default' : 'outline'}
              className="h-auto p-4 flex-col"
            >
              <div className="text-lg mb-1">🕓</div>
              <div className="font-medium">Schedule for Later</div>
            </Button>
          </div>
        </div>

        {/* Scheduled DateTime */}
        {showSchedule && (
          <div className="space-y-2">
            <label className="flex items-center text-foreground font-medium">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              Pick travel time
            </label>
            <Input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              min={new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)}
              max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            />
          </div>
        )}

        {/* Vehicle Type Selector */}
        <div className="space-y-3">
          <label className="flex items-center text-foreground font-medium">
            <Car className="w-4 h-4 mr-2 text-green-600" />
            🚘 Choose Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🛵', label: 'Moto', value: 'moto' },
              { icon: '🚗', label: 'Car', value: 'car' },
              { icon: '🚐', label: 'Van', value: 'van' }
            ].map((vehicle) => (
              <Button
                key={vehicle.value}
                onClick={() => setVehicleType(vehicle.value)}
                variant={vehicleType === vehicle.value ? 'default' : 'outline'}
                className="h-auto p-4 flex-col"
              >
                <div className="text-2xl mb-2">{vehicle.icon}</div>
                <div className="font-medium">{vehicle.label}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Trip Summary Card */}
        {canSubmit && (
          <Card className="bg-accent/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold">Confirm Trip</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">{pickup?.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{dropoff?.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Time:</span>
                  <span className="font-medium">
                    {travelTime === 'now' ? 'Now' : formatDateTime(scheduledDateTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium capitalize">{vehicleType}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mr-2" />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={submitTrip}
          disabled={!canSubmit || isSubmitting}
          className="w-full h-12"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
              Confirming Trip...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Check className="w-5 h-5 mr-2" />
              ✅ Confirm Trip
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};