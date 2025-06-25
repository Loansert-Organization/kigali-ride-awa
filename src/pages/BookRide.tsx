
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Clock, Car } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [scheduledTime, setScheduledTime] = useState('now');
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    // Pre-fill destination if passed from favorites
    if (location.state?.destination) {
      setToLocation(location.state.destination.address);
    }
  }, [location.state]);

  const steps = [
    'Pickup & Destination',
    'Vehicle & Time',
    'Confirm Request'
  ];

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
        to_location: toLocation,
        vehicle_type: vehicleType,
        scheduled_time: scheduledTime === 'now' 
          ? new Date().toISOString() 
          : new Date(customTime).toISOString(),
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ride requested!",
        description: "Looking for available drivers...",
      });

      navigate('/matches', { state: { tripId: data.id } });
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create ride request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-600" />
                <Input
                  placeholder="Enter pickup location"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-600" />
                <Input
                  placeholder="Where are you going?"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle type
              </label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="tuktuk">Tuktuk</SelectItem>
                  <SelectItem value="minibus">Minibus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When do you need the ride?
              </label>
              <Select value={scheduledTime} onValueChange={setScheduledTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Now</SelectItem>
                  <SelectItem value="custom">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scheduledTime === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose date and time
                </label>
                <Input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm your ride request</h3>
            
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">From</div>
                    <div className="font-medium">{fromLocation}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-sm text-gray-500">To</div>
                    <div className="font-medium">{toLocation}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Vehicle</div>
                    <div className="font-medium capitalize">{vehicleType}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">
                      {scheduledTime === 'now' 
                        ? 'Now' 
                        : new Date(customTime).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 After confirming, we'll find nearby drivers and you can contact them directly via WhatsApp.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return fromLocation.trim() && toLocation.trim();
      case 1:
        return vehicleType && (scheduledTime === 'now' || customTime);
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Book a Ride</h1>
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
        <div className="text-center mt-2">
          <h2 className="text-lg font-medium">{steps[currentStep]}</h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          {currentStep === steps.length - 1 ? 'Request Ride' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default BookRide;
