
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Car } from 'lucide-react';

const DriverOnboarding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Car className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Driver Onboarding</h1>
          <p className="text-gray-600">Coming soon! This will guide new drivers through setup.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverOnboarding;
