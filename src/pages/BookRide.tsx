import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Car, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppLoginModal } from '@/components/auth/WhatsAppLoginModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import GooglePlacesInput from '@/components/booking/GooglePlacesInput';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';

interface TripData {
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  vehicleType: string;
  description: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}

const BookRide = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isGuest } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal, handleLoginSuccess } = useAuthGuard();
  const { handleError } = useGlobalErrorHandler();
  const [isBooking, setIsBooking] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16),
    vehicleType: 'car',
    description: ''
  });

  // Get current location and reverse geocode it
  const handleUseCurrentLocation = async () => {
    console.log('🎯 Starting location detection process...');
    setIsGettingLocation(true);
    
    try {
      // First check if geolocation is supported
      if (!navigator.geolocation) {
        console.error('❌ Geolocation is not supported by this browser');
        throw new Error('Geolocation is not supported by this browser');
      }
      
      console.log('✅ Geolocation API is available');
      console.log('📡 Requesting current position...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('✅ Position received:', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
            resolve(pos);
          },
          (error) => {
            console.error('❌ Geolocation error:', {
              code: error.code,
              message: error.message,
              PERMISSION_DENIED: error.code === 1,
              POSITION_UNAVAILABLE: error.code === 2,
              TIMEOUT: error.code === 3
            });
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('🌍 Coordinates obtained:', { latitude, longitude });
      
      // Try reverse geocoding with fallback
      try {
        console.log('🔍 Starting reverse geocoding...');
        const { data, error } = await supabase.functions.invoke('reverse-geocode', {
          body: { lat: latitude, lng: longitude }
        });

        console.log('📍 Reverse geocoding response:', { data, error });

        if (error) {
          console.error('❌ Reverse geocoding error:', error);
          throw error;
        }

        const address = (data?.success && data?.address) ? data.address : 'Current Location';
        console.log('✅ Address resolved:', address);
        
        setTripData(prev => ({
          ...prev,
          fromLocation: address,
          fromLat: latitude,
          fromLng: longitude
        }));

        toast({
          title: "📍 Location set",
          description: "Using your current location as pickup point",
        });
      } catch (geocodeError) {
        console.warn('⚠️ Reverse geocoding failed, using coordinates:', geocodeError);
        // Fallback to coordinates display
        setTripData(prev => ({
          ...prev,
          fromLocation: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          fromLat: latitude,
          fromLng: longitude
        }));
        
        toast({
          title: "📍 Location set",
          description: "Location coordinates captured",
        });
      }
    } catch (error: any) {
      console.error('💥 Location detection failed:', error);
      
      // Use the global error handler which will show WhatsApp login button if appropriate
      await handleError(error, 'BookRide-LocationDetection', {
        action: 'getCurrentLocation',
        userAgent: navigator.userAgent
      });
    } finally {
      setIsGettingLocation(false);
      console.log('🏁 Location detection process completed');
    }
  };

  const handleFromLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setTripData(prev => ({
      ...prev,
      fromLocation: value,
      fromLat: coordinates?.lat,
      fromLng: coordinates?.lng
    }));
  };

  const handleToLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setTripData(prev => ({
      ...prev,
      toLocation: value,
      toLat: coordinates?.lat,
      toLng: coordinates?.lng
    }));
  };

  const proceedWithBooking = async () => {
    if (!tripData.fromLocation || !tripData.toLocation) {
      toast({
        title: "Missing information",
        description: "Please enter both pickup and destination locations",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please verify your WhatsApp number to book",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userProfile.id,
          from_location: tripData.fromLocation,
          to_location: tripData.toLocation,
          from_lat: tripData.fromLat,
          from_lng: tripData.fromLng,
          to_lat: tripData.toLat,
          to_lng: tripData.toLng,
          scheduled_time: tripData.scheduledTime,
          vehicle_type: tripData.vehicleType,
          description: tripData.description,
          role: 'passenger',
          status: 'pending',
          seats_available: 1
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🚗 Ride booked successfully!",
        description: "Looking for available drivers...",
      });

      navigate(`/ride-matches?tripId=${data.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleBookRide = () => {
    requireAuth(proceedWithBooking);
  };

  const canBookRide = tripData.fromLocation && tripData.toLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Book a Ride</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Auth Status Banner */}
        {isGuest && (
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              👋 Fill in your trip details. You'll verify your WhatsApp when booking.
            </p>
          </div>
        )}

        {/* Route Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Trip Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="from">From (Pickup Location)</Label>
              <div className="space-y-2">
                <GooglePlacesInput
                  value={tripData.fromLocation}
                  onChange={handleFromLocationChange}
                  placeholder="Enter pickup location..."
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isGettingLocation ? 'Getting location...' : '📍 Use Current Location'}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="to">To (Destination)</Label>
              <GooglePlacesInput
                value={tripData.toLocation}
                onChange={handleToLocationChange}
                placeholder="Enter destination..."
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trip Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="time">When do you want to travel?</Label>
              <input
                id="time"
                type="datetime-local"
                value={tripData.scheduledTime}
                onChange={(e) => setTripData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label htmlFor="vehicle">Preferred Vehicle</Label>
              <Select
                value={tripData.vehicleType}
                onValueChange={(value) => setTripData(prev => ({ ...prev, vehicleType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">🏍️ Moto</SelectItem>
                  <SelectItem value="car">🚗 Car</SelectItem>
                  <SelectItem value="tuktuk">🛺 Tuktuk</SelectItem>
                  <SelectItem value="minibus">🚐 Minibus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or landmarks..."
                value={tripData.description}
                onChange={(e) => setTripData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Book Button */}
        <Button
          onClick={handleBookRide}
          disabled={!canBookRide || isBooking}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          <Car className="w-5 h-5 mr-2" />
          {isBooking ? 'Booking Ride...' : isGuest ? '📱 Verify WhatsApp & Book Ride' : '🚗 Book Ride Now'}
        </Button>

        {!canBookRide && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Please complete the following:
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              {!tripData.fromLocation && <p>• Enter pickup location</p>}
              {!tripData.toLocation && <p>• Enter destination</p>}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 Tip: Use landmarks like "Near Nyabugogo Bus Park" or "Kigali City Market" for better pickup coordination
          </p>
        </div>
      </div>

      <WhatsAppLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => handleLoginSuccess(proceedWithBooking)}
        title="Complete Your Booking"
        description="Verify your WhatsApp number to book your ride and connect with drivers"
      />
    </div>
  );
};

export default BookRide;
