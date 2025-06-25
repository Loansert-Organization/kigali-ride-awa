import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Car, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, DriverProfile } from '@/types/user';

interface DriverSettingsBlockProps {
  userProfile: UserProfile;
}

const DriverSettingsBlock: React.FC<DriverSettingsBlockProps> = ({ userProfile }) => {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDriverProfile();
  }, [userProfile.id]);

  const loadDriverProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading driver profile:', error);
        return;
      }

      if (data) {
        // Ensure we have all required fields for DriverProfile, including ID
        const completeProfile: DriverProfile = {
          id: data.id || crypto.randomUUID(), // Generate ID if missing
          user_id: data.user_id,
          vehicle_type: data.vehicle_type,
          plate_number: data.plate_number,
          is_online: data.is_online || false,
          preferred_zone: data.preferred_zone || null,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setDriverProfile(completeProfile);
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!driverProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          id: driverProfile.id,
          user_id: userProfile.id,
          vehicle_type: driverProfile.vehicle_type,
          plate_number: driverProfile.plate_number,
          preferred_zone: driverProfile.preferred_zone,
          is_online: driverProfile.is_online,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your driver settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving driver profile:', error);
      toast({
        title: "Error",
        description: "Failed to save driver settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof DriverProfile, value: string | boolean) => {
    if (!driverProfile) return;
    
    setDriverProfile({
      ...driverProfile,
      [field]: value
    });
  };

  const vehicleTypes = [
    { value: 'moto', label: '🏍️ Motorcycle' },
    { value: 'car', label: '🚗 Car' },
    { value: 'tuktuk', label: '🛺 Tuk-tuk' },
    { value: 'minibus', label: '🚐 Minibus' }
  ];

  if (userProfile.role !== 'driver') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading driver settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Car className="w-5 h-5 mr-2" />
          🚗 Driver Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              value={driverProfile?.vehicle_type || ''}
              onValueChange={(value) => handleInputChange('vehicle_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              placeholder="e.g., RAB 123 A"
              value={driverProfile?.plate_number || ''}
              onChange={(e) => handleInputChange('plate_number', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredZone">Preferred Zone (Optional)</Label>
          <Input
            id="preferredZone"
            placeholder="e.g., Kigali City, Nyarugenge, etc."
            value={driverProfile?.preferred_zone || ''}
            onChange={(e) => handleInputChange('preferred_zone', e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !driverProfile?.vehicle_type || !driverProfile?.plate_number}
          className="w-full"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Driver Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DriverSettingsBlock;
