
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LocationInputBlock from "@/components/booking/LocationInputBlock";
import VehicleSelectBlock from "@/components/booking/VehicleSelectBlock";
import TimePickerBlock from "@/components/booking/TimePickerBlock";
import CommentsBlock from "@/components/booking/CommentsBlock";

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
}

const BookRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  
  // Form state
  const [fromLocation, setFromLocation] = useState('');
  const [fromCoords, setFromCoords] = useState<{lat: number; lng: number} | null>(null);
  const [toLocation, setToLocation] = useState('');
  const [toCoords, setToCoords] = useState<{lat: number; lng: number} | null>(null);
  const [vehicleType, setVehicleType] = useState('');
  const [scheduledTime, setScheduledTime] = useState('now');
  const [customTime, setCustomTime] = useState('');
  const [comments, setComments] = useState('');

  const steps = [
    'Pickup Location',
    'Drop-off Location', 
    'Time & Vehicle',
    'Notes & Confirm'
  ];

  useEffect(() => {
    // Load favorites and handle pre-filled data
    loadFavorites();
    
    // Handle pre-filled data from "Book Again" or destination
    if (location.state?.bookingData) {
      const { bookingData } = location.state;
      setFromLocation(bookingData.fromLocation || '');
      setFromCoords(bookingData.fromCoords || null);
      setToLocation(bookingData.toLocation || '');
      setToCoords(bookingData.toCoords || null);
      setVehicleType(bookingData.vehicleType || '');
      setComments(bookingData.comments || '');
      // Adjust time to 5 minutes from now for rebooking
      const newTime = new Date();
      newTime.setMinutes(newTime.getMinutes() + 5);
      setCustomTime(newTime.toISOString().slice(0, 16));
      setScheduledTime('custom');
    } else if (location.state?.destination) {
      setToLocation(location.state.destination.address);
    }
  }, [location.state]);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (userRecord) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userRecord.id)
            .limit(5);
          
          if (data) setFavorites(data);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleFromLocationChange = (value: string, coords?: {lat: number; lng: number}) => {
    setFromLocation(value);
    setFromCoords(coords || null);
  };

  const handleToLocationChange = (value: string, coords?: {lat: number; lng: number}) => {
    setToLocation(value);
    setToCoords(coords || null);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const calculateScheduledDateTime = () => {
    const now = new Date();
    switch (scheduledTime) {
      case 'now':
        return now.toISOString();
      case 'in15':
        return new Date(now.getTime() + 15 * 60000).toISOString();
      case 'in30':
        return new Date(now.getTime() + 30 * 60000).toISOString();
      case 'in1h':
        return new Date(now.getTime() + 60 * 60000).toISOString();
      case 'custom':
        return new Date(customTime).toISOString();
      default:
        return now.toISOString();
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to book a ride",
          variant: "destructive"
        });
        return;
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive"
        });
        return;
      }

      const tripData = {
        user_id: userRecord.id,
        role: 'passenger',
        from_location: fromLocation,
        from_lat: fromCoords?.lat || null,
        from_lng: fromCoords?.lng || null,
        to_location: toLocation,
        to_lat: toCoords?.lat || null,
        to_lng: toCoords?.lng || null,
        vehicle_type: vehicleType,
        scheduled_time: calculateScheduledDateTime(),
        description: comments || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎉 Ride requested!",
        description: "Looking for available drivers...",
      });

      // Navigate to matches page with the created trip
      navigate('/matches', { 
        state: { trip: data }
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create ride request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return fromLocation.trim();
      case 1:
        return toLocation.trim();
      case 2:
        return vehicleType && (scheduledTime !== 'custom' || customTime);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LocationInputBlock
            label="📍 Where are you now?"
            value={fromLocation}
            onChange={handleFromLocationChange}
            favorites={favorites}
            showGPS={true}
            placeholder="Enter pickup location"
          />
        );

      case 1:
        return (
          <LocationInputBlock
            label="📍 Where are you going?"
            value={toLocation}
            onChange={handleToLocationChange}
            favorites={favorites}
            showGPS={false}
            placeholder="Enter destination"
          />
        );

      case 2:
        return (
          <div className="space-y-4">
            <TimePickerBlock
              scheduledTime={scheduledTime}
              onTimeChange={setScheduledTime}
              customTime={customTime}
              onCustomTimeChange={setCustomTime}
            />
            <VehicleSelectBlock
              selectedVehicle={vehicleType}
              onVehicleSelect={setVehicleType}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <CommentsBlock
              comments={comments}
              onCommentsChange={setComments}
            />
            
            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>From:</strong> {fromLocation}</div>
                <div><strong>To:</strong> {toLocation}</div>
                <div><strong>Vehicle:</strong> {vehicleType}</div>
                <div><strong>Time:</strong> {
                  scheduledTime === 'now' ? 'Now' :
                  scheduledTime === 'custom' ? new Date(customTime).toLocaleString() :
                  scheduledTime === 'in15' ? 'In 15 minutes' :
                  scheduledTime === 'in30' ? 'In 30 minutes' :
                  scheduledTime === 'in1h' ? 'In 1 hour' : scheduledTime
                }</div>
                {comments && <div><strong>Notes:</strong> {comments}</div>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Book a Ride</h1>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= index 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 ml-2 ${
                  currentStep > index ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 pb-24">
        {renderStep()}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold"
        >
          {currentStep === steps.length - 1 ? '🚖 Book Ride' : 'Next →'}
        </Button>
      </div>
    </div>
  );
};

export default BookRide;
