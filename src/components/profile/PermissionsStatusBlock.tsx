
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MapPin, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PermissionsStatusBlockProps {
  userProfile: any;
}

const PermissionsStatusBlock: React.FC<PermissionsStatusBlockProps> = ({ userProfile }) => {
  const locationEnabled = userProfile?.location_enabled || false;
  const notificationsEnabled = userProfile?.notifications_enabled || false;

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          toast({
            title: "Location access denied",
            description: "Please enable location access in your browser settings",
            variant: "destructive"
          });
          return;
        }
        
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        toast({
          title: "Location enabled",
          description: "Your location will be used to find nearby rides",
        });
      } catch (error) {
        toast({
          title: "Location access failed",
          description: "Unable to access your location. Please check permissions.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Location disabled",
        description: "You'll need to enter addresses manually",
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Notifications enabled",
            description: "You'll receive updates about your rides",
          });
        } else {
          toast({
            title: "Notifications denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive"
          });
        }
      }
    } else {
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🔔 Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">📍 Location Sharing</p>
              <p className="text-sm text-gray-600">For finding nearby rides</p>
            </div>
          </div>
          <Switch
            checked={locationEnabled}
            onCheckedChange={handleLocationToggle}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">🔔 Notifications</p>
              <p className="text-sm text-gray-600">Get ride updates</p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsStatusBlock;
