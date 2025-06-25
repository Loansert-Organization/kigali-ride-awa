
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Smartphone, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PassengerOnboarding = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);

  const handleComplete = async () => {
    await updateUserProfile({ onboarding_completed: true });
    navigate('/home/passenger');
  };

  const steps = [
    {
      icon: <MapPin className="w-12 h-12 text-blue-600" />,
      title: "Find Rides Nearby",
      description: "See available drivers and trips in your area"
    },
    {
      icon: <Smartphone className="w-12 h-12 text-green-600" />,
      title: "Book with WhatsApp",
      description: "Coordinate directly with drivers via WhatsApp"
    },
    {
      icon: <Gift className="w-12 h-12 text-purple-600" />,
      title: "Earn Rewards",
      description: "Refer friends and climb the leaderboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Kigali Ride! 🚗
          </h1>
          <p className="text-gray-600">Let's get you started as a passenger</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            {steps[step - 1].icon}
            <CardTitle className="mt-4">{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{steps[step - 1].description}</p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {step < steps.length ? (
              <Button onClick={() => setStep(step + 1)} className="w-full">
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} className="w-full">
                Start Booking Rides
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerOnboarding;
