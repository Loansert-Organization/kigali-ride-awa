import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Car, Truck, Bike } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { UserProfile, DriverProfile } from '@/types/user';

interface DriverSettingsBlockProps {
  userProfile: UserProfile;
}

const DriverSettingsBlock: React.FC<DriverSettingsBlockProps> = ({ userProfile }) => {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue, watch } = useForm();

  useEffect(() => {
    loadDriverProfile();
  }, [userProfile]);

  const loadDriverProfile = async () => {
    if (!userProfile?.id) return;

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
        setDriverProfile(data);
        setValue('vehicle_type', data.vehicle_type);
        setValue('plate_number', data.plate_number);
        setValue('preferred_zone', data.preferred_zone);
        setValue('is_online', data.is_online);
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    if (!userProfile?.id) return;

    try {
      const profileData = {
        user_id: userProfile.id,
        vehicle_type: formData.vehicle_type,
        plate_number: formData.plate_number,
        preferred_zone: formData.preferred_zone || null,
        is_online: formData.is_online || false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('driver_profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your driver profile has been updated successfully.",
      });

      // Reload profile
      loadDriverProfile();
    } catch (error) {
      console.error('Error updating driver profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    }
  };

  const vehicleTypes = [
    { value: 'moto', label: '🏍️ Moto', icon: Bike },
    { value: 'car', label: '🚗 Car', icon: Car },
    { value: 'tuktuk', label: '🛺 Tuktuk', icon: Truck },
    { value: 'minibus', label: '🚐 Minibus', icon: Truck }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🚗 Driver Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading driver settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🚗 Driver Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="vehicle_type">Vehicle Type</Label>
            <Select onValueChange={(value) => setValue('vehicle_type', value)} defaultValue={driverProfile?.vehicle_type}>
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

          <div>
            <Label htmlFor="plate_number">Plate Number</Label>
            <Input
              id="plate_number"
              {...register('plate_number', { required: true })}
              defaultValue={driverProfile?.plate_number}
              placeholder="e.g. RAD 123A"
            />
          </div>

          <div>
            <Label htmlFor="preferred_zone">Preferred Zone (Optional)</Label>
            <Input
              id="preferred_zone"
              {...register('preferred_zone')}
              defaultValue={driverProfile?.preferred_zone || ''}
              placeholder="e.g. Kigali CBD, Nyarutarama"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_online">🟢 Currently Online</Label>
              <p className="text-sm text-gray-600">Accept ride requests</p>
            </div>
            <Switch
              id="is_online"
              defaultChecked={driverProfile?.is_online}
              onCheckedChange={(checked) => setValue('is_online', checked)}
            />
          </div>

          <Button type="submit" className="w-full">
            Update Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverSettingsBlock;
