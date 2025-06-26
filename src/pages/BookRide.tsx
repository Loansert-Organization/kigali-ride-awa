
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TripRouteCard from '@/components/booking/TripRouteCard';
import VehicleSelectionBlock from '@/components/trip/VehicleSelectionBlock';
import TripDetailsBlock from '@/components/trip/TripDetailsBlock';
import { useBookingFlow, TripData } from '@/hooks/useBookingFlow';
import { MapPickerModal } from '@/components/maps/MapPickerModal';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const BookRide = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { createPassengerTrip, isLoading } = useBookingFlow();
  const [showMapPicker, setShowMapPicker] = useState<'pickup' | 'destination' | null>(null);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    vehicleType: 'car',
    description: ''
  });

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDMtyp8L8_Dvr6k7BTtCpZYJgXHdWqzNdA&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

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

  const handleUpdate = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const handleMapPickerSelect = (location: { lat: number; lng: number; address: string }) => {
    if (showMapPicker === 'pickup') {
      handleFromLocationChange(location.address, { lat: location.lat, lng: location.lng });
    } else if (showMapPicker === 'destination') {
      handleToLocationChange(location.address, { lat: location.lat, lng: location.lng });
    }
    setShowMapPicker(null);
  };

  const handleBookRide = async () => {
    // Check authentication
    if (!user || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please complete your profile to book a ride",
        variant: "destructive"
      });
      navigate('/welcome');
      return;
    }

    // Validate required fields
    if (!tripData.fromLocation || !tripData.toLocation) {
      toast({
        title: "Missing information",
        description: "Please enter both pickup and destination locations",
        variant: "destructive"
      });
      return;
    }

    // Validate coordinates if possible
    if (!tripData.fromLat || !tripData.fromLng || !tripData.toLat || !tripData.toLng) {
      toast({
        title: "Location precision needed",
        description: "Please use the location picker or autocomplete for better accuracy",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPassengerTrip(tripData);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  const canBookRide = tripData.fromLocation && 
                     tripData.toLocation && 
                     tripData.fromLat && 
                     tripData.fromLng && 
                     tripData.toLat && 
                     tripData.toLng;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
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
        <TripRouteCard
          fromLocation={tripData.fromLocation}
          toLocation={tripData.toLocation}
          onFromChange={handleFromLocationChange}
          onToChange={handleToLocationChange}
          onPickupMapOpen={() => setShowMapPicker('pickup')}
          onDestinationMapOpen={() => setShowMapPicker('destination')}
        />

        <VehicleSelectionBlock
          vehicleType={tripData.vehicleType}
          onUpdate={handleUpdate}
        />

        <TripDetailsBlock
          scheduledTime={tripData.scheduledTime}
          description={tripData.description}
          onUpdate={handleUpdate}
        />

        <Button
          onClick={handleBookRide}
          disabled={!canBookRide || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isLoading ? 'Booking Ride...' : '🚗 Book Ride Now'}
        </Button>

        {!canBookRide && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Please complete the following:
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              {!tripData.fromLocation && <p>• Enter pickup location</p>}
              {!tripData.toLocation && <p>• Enter destination</p>}
              {(!tripData.fromLat || !tripData.fromLng) && <p>• Confirm pickup coordinates</p>}
              {(!tripData.toLat || !tripData.toLng) && <p>• Confirm destination coordinates</p>}
            </div>
          </div>
        )}
      </div>

      <MapPickerModal
        isOpen={!!showMapPicker}
        onClose={() => setShowMapPicker(null)}
        onLocationSelect={handleMapPickerSelect}
        title={showMapPicker === 'pickup' ? 'Select Pickup Location' : 'Select Destination'}
        initialLocation={
          showMapPicker === 'pickup' 
            ? (tripData.fromLat && tripData.fromLng ? { lat: tripData.fromLat, lng: tripData.fromLng } : undefined)
            : (tripData.toLat && tripData.toLng ? { lat: tripData.toLat, lng: tripData.toLng } : undefined)
        }
      />
    </div>
  );
};

export default BookRide;
