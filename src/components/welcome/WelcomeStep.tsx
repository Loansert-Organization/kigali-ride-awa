
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Car } from 'lucide-react';

interface WelcomeStepProps {
  onGetStarted: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className="animate-bounce mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-heading-1 text-gray-900 mb-2">
            🚗 Kigali Ride
          </h1>
          <p className="text-body text-gray-600 mb-8">
            Fast, reliable rides across Kigali
          </p>

          <Button 
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 text-lg font-semibold animate-pulse"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeStep;
