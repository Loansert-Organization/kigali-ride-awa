import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Car, Bike, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const vehicleOptions = [
  { type: VehicleType.MOTO, label: 'Motorcycle', icon: Bike, emoji: '🏍️' },
  { type: VehicleType.CAR, label: 'Car', icon: Car, emoji: '🚗' },
  { type: VehicleType.TUKTUK, label: 'Tuk-Tuk', icon: Truck, emoji: '🛺' },
  { type: VehicleType.MINIBUS, label: 'Minibus', icon: Truck, emoji: '🚐' },
];

const VehicleSetupPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState({
    vehicle_type: VehicleType.CAR,
    license_plate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof vehicle, value: string | VehicleType) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!vehicle.license_plate.trim()) {
      toast({
        title: "License plate required",
        description: "Please enter your vehicle's license plate number.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare vehicle data
      const vehicleData = {
        driver_id: userProfile?.id ?? user.id,
        vehicle_type: vehicle.vehicle_type,
        license_plate: vehicle.license_plate.toUpperCase(),
        is_active: true,
      };
      
      // If this is a local session, only save to localStorage
      if (user.id.startsWith('local-')) {
        const localVehicle = {
          ...vehicleData,
          id: `vehicle-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Save to localStorage with the same key CreateTrip expects
        localStorage.setItem('driverVehicle', JSON.stringify(localVehicle));
        
        toast({
          title: "Vehicle Saved!",
          description: "Your vehicle has been saved locally.",
        });
        
        navigate('/driver/home');
        return;
      }

      // For real users, save to Supabase
      console.log('Saving vehicle to Supabase:', vehicleData);
      
      const { data, error } = await supabase
        .from('driver_vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        
        // If table doesn't exist or other DB error, save locally as fallback
        if (error.code === '42P01' || error.code === '404') {
          const localVehicle = {
            ...vehicleData,
            id: `vehicle-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          localStorage.setItem('driverVehicle', JSON.stringify(localVehicle));
          
          toast({
            title: "Vehicle Saved Locally",
            description: "Database unavailable. Your vehicle is saved on this device.",
          });
          
          navigate('/driver/home');
          return;
        }
        
        throw error;
      }

      console.log('Vehicle saved successfully:', data);
      
      // Also save to localStorage for quick access
      localStorage.setItem('driverVehicle', JSON.stringify(data));
      
      toast({
        title: "Vehicle Saved!",
        description: "Your vehicle has been registered successfully.",
      });

      // Navigate to driver home
      navigate('/driver/home');
      
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Set Up Your Vehicle" 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Set Up Your Vehicle</h1>
          <p className="text-gray-600">Only vehicle type and license plate are required</p>
        </div>

        {/* Vehicle Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Vehicle Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {vehicleOptions.map((option) => {
              const isSelected = vehicle.vehicle_type === option.type;
              
              return (
                <Button
                  key={option.type}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handleInputChange('vehicle_type', option.type)}
                  className={`h-20 flex flex-col items-center space-y-1 ${
                    isSelected ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* License Plate */}
        <div className="space-y-2">
          <label className="text-sm font-medium">License Plate *</label>
          <Input
            placeholder="e.g. RAD 123 A"
            value={vehicle.license_plate}
            onChange={(e) => handleInputChange('license_plate', e.target.value.toUpperCase())}
            className="h-12 text-center font-mono text-lg"
            maxLength={15}
          />
          <p className="text-xs text-gray-500">
            Enter your vehicle's license plate number
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting || !vehicle.license_plate.trim()} 
          className="w-full h-12 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Vehicle...
            </>
          ) : (
            'Save Vehicle'
          )}
        </Button>

        {/* Info */}
        <div className="text-center text-xs text-gray-500">
          <p>You can update these details later in your profile</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleSetupPage; 