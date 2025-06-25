
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import RouteInputBlock from '@/components/trip/RouteInputBlock';
import VehicleSelectionBlock from '@/components/trip/VehicleSelectionBlock';
import TripDetailsBlock from '@/components/trip/TripDetailsBlock';
import { useBookingFlow, TripData } from '@/hooks/useBookingFlow';
import { MapPickerModal } from '@/components/maps/MapPickerModal';

const BookRide = () => {
  const navigate = useNavigate();
  const { createPassengerTrip, isLoading } = useBookingFlow();
  const [showMapPicker, setShowMapPicker] = useState<'pickup' | 'destination' | null>(null);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    vehicleType: 'car',
    description: ''
  });

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTripData(prev => ({
            ...prev,
            fromLocation: 'Current Location',
            fromLat: position.coords.latitude,
            fromLng: position.coords.longitude
          }));
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleUpdate = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const handleMapPickerSelect = (location: { lat: number; lng: number; address: string }) => {
    if (showMapPicker === 'pickup') {
      handleUpdate({
        fromLocation: location.address,
        fromLat: location.lat,
        fromLng: location.lng
      });
    } else if (showMapPicker === 'destination') {
      handleUpdate({
        toLocation: location.address,
        toLat: location.lat,
        toLng: location.lng
      });
    }
    setShowMapPicker(null);
  };

  const handleBookRide = async () => {
    if (!tripData.fromLocation || !tripData.toLocation) {
      return;
    }

    await createPassengerTrip(tripData);
  };

  const canBookRide = tripData.fromLocation && tripData.toLocation;

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
        <RouteInputBlock
          {...tripData}
          onUpdate={handleUpdate}
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
          {isLoading ? 'Finding Drivers...' : '🚗 Book Ride'}
        </Button>

        {!canBookRide && (
          <p className="text-center text-sm text-gray-500">
            Please enter pickup and destination locations
          </p>
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
