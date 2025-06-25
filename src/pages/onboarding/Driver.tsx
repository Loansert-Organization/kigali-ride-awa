
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DriverOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [vehicleData, setVehicleData] = useState({
    vehicleType: '',
    plateNumber: '',
    preferredZone: ''
  });

  const handleVehicleSubmit = async () => {
    if (!vehicleData.vehicleType || !vehicleData.plateNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (userData) {
        const { error } = await supabase
          .from('driver_profiles')
          .insert({
            user_id: userData.id,
            vehicle_type: vehicleData.vehicleType,
            plate_number: vehicleData.plateNumber,
            preferred_zone: vehicleData.preferredZone || null
          });

        if (error) throw error;

        await updateUserProfile({ onboarding_completed: true });
        navigate('/home/driver');
      }
    } catch (error) {
      console.error('Error creating driver profile:', error);
      toast({
        title: "Error",
        description: "Failed to create driver profile",
        variant: "destructive"
      });
    }
  };

  const steps = [
    {
      icon: <Car className="w-12 h-12 text-blue-600" />,
      title: "Vehicle Information",
      description: "Tell us about your vehicle"
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: "Create Trips",
      description: "Post where you're going and pick up passengers"
    },
    {
      icon: <DollarSign className="w-12 h-12 text-purple-600" />,
      title: "Earn Money",
      description: "Set your own fares and build your reputation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Driver! 🚗
          </h1>
          <p className="text-gray-600">Let's set up your driver profile</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            {steps[step - 1].icon}
            <CardTitle className="mt-4">{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">{steps[step - 1].description}</p>
            
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select value={vehicleData.vehicleType} onValueChange={(value) => setVehicleData({...vehicleData, vehicleType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moto">Moto 🛵</SelectItem>
                      <SelectItem value="car">Car 🚗</SelectItem>
                      <SelectItem value="tuktuk">Tuktuk 🛺</SelectItem>
                      <SelectItem value="minibus">Minibus 🚐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plateNumber">Plate Number *</Label>
                  <Input
                    id="plateNumber"
                    value={vehicleData.plateNumber}
                    onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})}
                    placeholder="e.g., RAB 123 A"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredZone">Preferred Zone (Optional)</Label>
                  <Input
                    id="preferredZone"
                    value={vehicleData.preferredZone}
                    onChange={(e) => setVehicleData({...vehicleData, preferredZone: e.target.value})}
                    placeholder="e.g., Kigali City, Nyabugogo"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-2 my-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {step === 1 ? (
              <Button onClick={handleVehicleSubmit} className="w-full">
                Continue
              </Button>
            ) : step < steps.length ? (
              <Button onClick={() => setStep(step + 1)} className="w-full">
                Next
              </Button>
            ) : (
              <Button onClick={() => navigate('/home/driver')} className="w-full">
                Start Driving
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverOnboarding;
