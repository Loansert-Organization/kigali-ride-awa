
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Smartphone,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { userProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: userProfile?.promo_code || '',
    email: '',
    phone: userProfile?.phone_number || '',
    
    // Notification settings
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    rideUpdates: true,
    promotionalMessages: false,
    
    // Privacy settings
    shareLocation: true,
    showProfile: true,
    shareRideHistory: false,
    
    // App preferences
    language: 'en',
    darkMode: false,
    autoBook: false,
    soundEffects: true
  });

  const handleSave = () => {
    // Here you would typically save to Supabase
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const settingSections = [
    {
      title: 'Profile Information',
      icon: User,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={settings.displayName}
              onChange={(e) => setSettings({...settings, displayName: e.target.value})}
              placeholder="Your display name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              placeholder="+250 788 123 456"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          {[
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive notifications on your device' },
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Get updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive SMS for important updates' },
            { key: 'rideUpdates', label: 'Ride Updates', description: 'Notifications about your rides' },
            { key: 'promotionalMessages', label: 'Promotional Messages', description: 'Offers and promotions' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{item.label}</Label>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => setSettings({...settings, [item.key]: checked})}
              />
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          {[
            { key: 'shareLocation', label: 'Share Location', description: 'Allow location sharing for better matching' },
            { key: 'showProfile', label: 'Show Profile', description: 'Make your profile visible to others' },
            { key: 'shareRideHistory', label: 'Share Ride History', description: 'Allow ride history for recommendations' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{item.label}</Label>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => setSettings({...settings, [item.key]: checked})}
              />
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Label htmlFor="password">Change Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'App Preferences',
      icon: Smartphone,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="en">English</option>
              <option value="kn">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          {[
            { key: 'darkMode', label: 'Dark Mode', description: 'Use dark theme throughout the app', icon: Moon },
            { key: 'autoBook', label: 'Auto-booking', description: 'Automatically book the best matches' },
            { key: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for app interactions' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.icon && <item.icon className="w-4 h-4 text-gray-600" />}
                <div className="space-y-0.5">
                  <Label className="text-base">{item.label}</Label>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={settings[item.key as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => setSettings({...settings, [item.key]: checked})}
              />
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="w-5 h-5 mr-2" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.content}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
