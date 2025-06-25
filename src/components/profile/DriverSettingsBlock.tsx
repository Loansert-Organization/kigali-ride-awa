
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface DriverSettingsBlockProps {
  userId: string;
}

interface DriverProfile {
  vehicle_type: string;
  plate_number: string;
  preferred_zone?: string;
}

const DriverSettingsBlock: React.FC<DriverSettingsBlockProps> = ({ userId }) => {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<DriverProfile>();

  const vehicleTypes = [
    { value: 'moto', label: '🏍️ Moto' },
    { value: 'car', label: '🚗 Car' },
    { value: 'tuktuk', label: '🛺 Tuktuk' },
    { value: 'minibus', label: '🚌 Minibus' }
  ];

  useEffect(() => {
    fetchDriverProfile();
  }, [userId]);

  const fetchDriverProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching driver profile:', error);
        return;
      }

      setDriverProfile(data);
      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formData: DriverProfile) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          user_id: userId,
          ...formData
        });

      if (error) {
        throw error;
      }

      setDriverProfile(formData);
      setIsDialogOpen(false);
      
      toast({
        title: "Vehicle info updated",
        description: "Your vehicle information has been saved successfully.",
      });

    } catch (error) {
      console.error('Error updating driver profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your vehicle information.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Car className="w-5 h-5 mr-2" />
            🚗 Driver Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading vehicle information...</p>
        </CardContent>
      </Card>
    );
  }

  const selectedVehicleType = vehicleTypes.find(v => v.value === driverProfile?.vehicle_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Car className="w-5 h-5 mr-2" />
          🚗 Driver Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {driverProfile ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Vehicle Type</p>
              <p className="font-medium">{selectedVehicleType?.label || driverProfile.vehicle_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plate Number</p>
              <p className="font-medium">{driverProfile.plate_number}</p>
            </div>
            {driverProfile.preferred_zone && (
              <div>
                <p className="text-sm text-gray-600">Preferred Zone</p>
                <p className="font-medium">{driverProfile.preferred_zone}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No vehicle information set up yet.</p>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4">
              <Edit className="w-4 h-4 mr-2" />
              ✏️ Edit Vehicle Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vehicle Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Select
                  value={watch('vehicle_type')}
                  onValueChange={(value) => setValue('vehicle_type', value)}
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

              <div>
                <Label htmlFor="plate_number">Plate Number</Label>
                <Input
                  id="plate_number"
                  {...register('plate_number', { required: true })}
                  placeholder="e.g., RAE-123C"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="preferred_zone">Preferred Zone (Optional)</Label>
                <Input
                  id="preferred_zone"
                  {...register('preferred_zone')}
                  placeholder="e.g., Kigali City, Nyamirambo"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DriverSettingsBlock;
