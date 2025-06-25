
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, Save, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VehicleSetup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    plateNumber: '',
    preferredZone: ''
  });

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userRecord) {
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .single();

        if (profile) {
          setFormData({
            vehicleType: profile.vehicle_type || '',
            plateNumber: profile.plate_number || '',
            preferredZone: profile.preferred_zone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.vehicleType || !formData.plateNumber) {
      toast({
        title: "Required Fields",
        description: "Please fill in vehicle type and plate number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) throw new Error('User profile not found');

      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          user_id: userRecord.id,
          vehicle_type: formData.vehicleType,
          plate_number: formData.plateNumber,
          preferred_zone: formData.preferredZone || null
        });

      if (error) throw error;

      toast({
        title: "Vehicle Setup Complete",
        description: "Your vehicle information has been saved successfully"
      });

      navigate('/driver');
    } catch (error) {
      console.error('Error saving vehicle setup:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const vehicleTypes = [
    { value: 'moto', label: '🛵 Moto', icon: '🛵' },
    { value: 'car', label: '🚗 Car', icon: '🚗' },
    { value: 'tuktuk', label: '🛺 Tuktuk', icon: '🛺' },
    { value: 'minibus', label: '🚐 Minibus', icon: '🚐' }
  ];

  const zones = [
    'Kigali City Center',
    'Nyarugenge',
    'Gasabo',
    'Kicukiro',
    'Kimisagara',
    'Nyabugogo',
    'Remera',
    'Kacyiru',
    'Gikondo',
    'Kanombe'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Vehicle Setup</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your vehicle type" />
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
              <Label htmlFor="plateNumber">Plate Number *</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                placeholder="e.g., RBA 123 A"
                className="uppercase"
              />
            </div>

            <div>
              <Label htmlFor="preferredZone">Preferred Zone (Optional)</Label>
              <Select
                value={formData.preferredZone}
                onValueChange={(value) => setFormData({ ...formData, preferredZone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred operating zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Required Information</p>
                  <p>This information helps passengers identify your vehicle and builds trust in the platform.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Vehicle Info'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleSetup;
