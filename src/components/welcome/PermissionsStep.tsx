
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface PermissionsStepProps {
  selectedRole: 'passenger' | 'driver' | null;
  onRequestLocation: () => void;
  onSkipLocation: () => void;
  showPWAPrompt: boolean;
  setShowPWAPrompt: (show: boolean) => void;
}

const PermissionsStep: React.FC<PermissionsStepProps> = ({
  selectedRole,
  onRequestLocation,
  onSkipLocation,
  showPWAPrompt,
  setShowPWAPrompt
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-heading-2 text-gray-900 mb-2">📍 Enable Location</h2>
            <p className="text-body text-gray-600">We use GPS to help match you with nearby {selectedRole === 'driver' ? 'passengers' : 'drivers'} & routes</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-3 text-[17px]">🔒 Why we need this:</h4>
            <ul className="text-[15px] text-blue-800 space-y-2 font-medium">
              <li>• Find {selectedRole === 'driver' ? 'passengers' : 'drivers'} near you</li>
              <li>• Auto-fill pickup locations</li>
              <li>• Show accurate distances & times</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onRequestLocation}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 hover-scale font-semibold text-[17px]"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Allow Location Access
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onSkipLocation}
              className="w-full font-semibold text-[17px]"
            >
              Skip for now
            </Button>
          </div>

          {/* PWA Install Prompt */}
          {showPWAPrompt && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fade-in">
              <div className="flex items-center mb-3">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-900 text-[17px]">📥 Install App</h3>
              </div>
              <p className="text-[15px] text-purple-700 mb-3 font-medium">Add Kigali Ride to your home screen for quick access</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 font-semibold">
                  Install
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowPWAPrompt(false)} className="font-semibold">
                  Later
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsStep;
