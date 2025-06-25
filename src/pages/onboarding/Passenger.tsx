
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User } from 'lucide-react';

const PassengerOnboarding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Passenger Onboarding</h1>
          <p className="text-gray-600">Coming soon! This will guide new passengers through the app.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassengerOnboarding;
