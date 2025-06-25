
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface LocationPermissionProps {
  setCurrentStep: (step: 'welcome' | 'role' | 'location' | 'final') => void;
  setLocationGranted: (granted: boolean) => void;
  t: any;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  setCurrentStep,
  setLocationGranted,
  t
}) => {
  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      setLocationGranted(true);
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      toast({
        title: "Location Enabled",
        description: "Location access granted successfully",
      });
      
      setCurrentStep('final');
    } catch (error) {
      toast({
        title: "Location Access Denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      setCurrentStep('final');
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">{t.locationTitle}</h2>
          <p className="text-gray-600 mt-2">{t.locationDesc}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={requestLocation} 
            className="w-full bg-green-600 hover:bg-green-700 py-3"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t.enableLocation}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('final')} 
            className="w-full"
          >
            {t.skipLocation}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;
