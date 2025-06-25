
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationStepProps {
  onNext: () => void;
  onLocationGranted: (granted: boolean) => void;
  t: any;
}

const LocationStep: React.FC<LocationStepProps> = ({
  onNext,
  onLocationGranted,
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
      
      onLocationGranted(true);
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      toast({
        title: t.locationEnabled,
        description: t.locationSuccess,
      });
      
      // Update Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('users').upsert({
            auth_user_id: user.id,
            location_enabled: true
          });
        }
      } catch (error) {
        console.error('Error updating location in Supabase:', error);
      }
      
      setTimeout(() => onNext(), 500);
    } catch (error) {
      toast({
        title: t.locationDenied,
        description: t.locationDeniedDesc,
        variant: "destructive"
      });
      setTimeout(() => onNext(), 1000);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">{t.useLocation}</h2>
          <p className="text-gray-600 mt-2">{t.fallbackText}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={requestLocation} 
            className="w-full bg-green-600 hover:bg-green-700 py-3"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t.useLocation}
          </Button>
          <Button 
            variant="outline" 
            onClick={onNext} 
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationStep;
