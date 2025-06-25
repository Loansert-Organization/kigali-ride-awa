
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, MessageSquare, Gift, Car } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationSettings {
  trip_match_notifications: boolean;
  reward_notifications: boolean;
  referral_updates: boolean;
  driver_requests: boolean;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    trip_match_notifications: true,
    reward_notifications: true,
    referral_updates: true,
    driver_requests: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('notifications_enabled')
        .eq('auth_user_id', user.id)
        .single();

      if (userRecord) {
        // Load from localStorage for detailed settings
        const savedSettings = localStorage.getItem('notification_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    setIsLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save to localStorage
      localStorage.setItem('notification_settings', JSON.stringify(newSettings));

      // Update global notifications flag in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasAnyEnabled = Object.values(newSettings).some(Boolean);
        await supabase
          .from('users')
          .update({ notifications_enabled: hasAnyEnabled })
          .eq('auth_user_id', user.id);
      }

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved"
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const settingsConfig = [
    {
      key: 'trip_match_notifications' as keyof NotificationSettings,
      icon: <Car className="w-5 h-5 text-blue-600" />,
      title: 'Trip Matches',
      description: 'Get notified when a driver accepts your ride request or when passengers want to join your trip'
    },
    {
      key: 'reward_notifications' as keyof NotificationSettings,
      icon: <Gift className="w-5 h-5 text-green-600" />,
      title: 'Rewards & Points',
      description: 'Receive updates about weekly rewards, points earned, and leaderboard changes'
    },
    {
      key: 'referral_updates' as keyof NotificationSettings,
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      title: 'Referral Updates',
      description: 'Know when friends sign up using your promo code and when you earn referral points'
    },
    {
      key: 'driver_requests' as keyof NotificationSettings,
      icon: <Bell className="w-5 h-5 text-orange-600" />,
      title: 'Driver Requests',
      description: 'For drivers: get alerts about nearby passenger requests and trip opportunities'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingsConfig.map((config) => (
            <div key={config.key} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3 flex-1">
                {config.icon}
                <div>
                  <Label htmlFor={config.key} className="text-base font-medium cursor-pointer">
                    {config.title}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
              <Switch
                id={config.key}
                checked={settings[config.key]}
                onCheckedChange={(checked) => updateSetting(config.key, checked)}
                disabled={isLoading}
              />
            </div>
          ))}

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Bell className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Push Notifications</p>
                <p className="text-blue-800">
                  Make sure to enable push notifications in your browser settings to receive real-time updates.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
