
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, Share, Copy } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { userProfile, user, updateUserProfile } = useAuth();
  const [driverProfile, setDriverProfile] = useState({
    vehicle_type: '',
    plate_number: '',
    preferred_zone: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDriverProfile();
  }, [user]);

  const loadDriverProfile = async () => {
    if (!user) return;
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userData) {
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (profile) {
          setDriverProfile({
            vehicle_type: profile.vehicle_type || '',
            plate_number: profile.plate_number || '',
            preferred_zone: profile.preferred_zone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userData) {
        const { error } = await supabase
          .from('driver_profiles')
          .update({
            vehicle_type: driverProfile.vehicle_type,
            plate_number: driverProfile.plate_number,
            preferred_zone: driverProfile.preferred_zone
          })
          .eq('user_id', userData.id);

        if (error) throw error;

        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your driver profile has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleCopyPromoCode = () => {
    if (userProfile?.promo_code) {
      navigator.clipboard.writeText(userProfile.promo_code);
      toast({
        title: "Copied!",
        description: "Promo code copied to clipboard"
      });
    }
  };

  const handleSharePromoCode = () => {
    if (userProfile?.promo_code) {
      const message = `Join Kigali Ride with my code: ${userProfile.promo_code} and start earning rewards!`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 text-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Driver Profile</h1>
            <p className="text-sm opacity-90">Manage your driver information</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Driver Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {userProfile?.promo_code?.slice(-2) || 'D'}
              </div>
              <div>
                <div className="font-semibold">Driver</div>
                <div className="text-sm text-gray-600">
                  Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'recently'}
                </div>
                <div className="text-xs text-gray-500">
                  {userProfile?.auth_method === 'whatsapp' ? '📱 WhatsApp Account' : '👤 Guest Account'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share className="w-5 h-5 mr-2" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700 mb-2">
                  {userProfile?.promo_code || 'Loading...'}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Share this code to earn rewards when friends join!
                </p>
                <div className="flex space-x-2">
                  <Button onClick={handleCopyPromoCode} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button onClick={handleSharePromoCode} variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vehicle Type</Label>
              {isEditing ? (
                <Select 
                  value={driverProfile.vehicle_type} 
                  onValueChange={(value) => setDriverProfile({...driverProfile, vehicle_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto 🛵</SelectItem>
                    <SelectItem value="car">Car 🚗</SelectItem>
                    <SelectItem value="tuktuk">Tuktuk 🛺</SelectItem>
                    <SelectItem value="minibus">Minibus 🚐</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-100 rounded capitalize">
                  {driverProfile.vehicle_type || 'Not set'}
                </div>
              )}
            </div>

            <div>
              <Label>Plate Number</Label>
              {isEditing ? (
                <Input
                  value={driverProfile.plate_number}
                  onChange={(e) => setDriverProfile({...driverProfile, plate_number: e.target.value})}
                  placeholder="e.g., RAB 123 A"
                />
              ) : (
                <div className="p-2 bg-gray-100 rounded">
                  {driverProfile.plate_number || 'Not set'}
                </div>
              )}
            </div>

            <div>
              <Label>Preferred Zone</Label>
              {isEditing ? (
                <Input
                  value={driverProfile.preferred_zone}
                  onChange={(e) => setDriverProfile({...driverProfile, preferred_zone: e.target.value})}
                  placeholder="e.g., Kigali City, Nyabugogo"
                />
              ) : (
                <div className="p-2 bg-gray-100 rounded">
                  {driverProfile.preferred_zone || 'No preference'}
                </div>
              )}
            </div>

            {isEditing && (
              <Button onClick={handleUpdateProfile} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/past-trips')}
            >
              📝 Trip History
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/rewards')}
            >
              🎁 Rewards & Referrals
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600"
            >
              🚪 Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverProfile;
