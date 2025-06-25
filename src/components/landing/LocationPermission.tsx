
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const LocationPermission = () => {
  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
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
    } catch (error) {
      toast({
        title: "Location Access Denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Enable Location</h2>
          <p className="text-gray-600 mt-2">We need your location to show nearby rides and provide accurate pickup points.</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={requestLocation} 
            className="w-full bg-green-600 hover:bg-green-700 py-3"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Enable Location
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;
