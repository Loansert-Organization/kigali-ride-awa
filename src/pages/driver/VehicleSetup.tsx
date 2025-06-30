import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/APIClient';
import { VehicleType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Car, Bike, Truck } from 'lucide-react';

const vehicleOptions = [
  { type: VehicleType.MOTO, label: 'Motorcycle', icon: Bike, emoji: '🏍️' },
  { type: VehicleType.CAR, label: 'Car', icon: Car, emoji: '🚗' },
  { type: VehicleType.TUKTUK, label: 'Tuk-Tuk', icon: Truck, emoji: '🛺' },
  { type: VehicleType.MINIBUS, label: 'Minibus', icon: Truck, emoji: '🚐' },
];

const VehicleSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState({
    vehicle_type: VehicleType.CAR,
    license_plate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof vehicle, value: string | VehicleType) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !vehicle.license_plate.trim()) {
      return toast({ 
        title: "License plate is required", 
        variant: 'destructive' 
      });
    }

    setIsSubmitting(true);
    
    try {
      const { success, error } = await apiClient.vehicles.createDriverVehicle({
        ...vehicle,
        driver_id: user.id,
      });

      if (success) {
        toast({ title: "Vehicle added successfully!" });
        navigate('/driver/home');
      } else {
        toast({ 
          title: "Error", 
          description: error?.message || "Failed to save vehicle", 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save vehicle. Please try again.", 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            const Icon = option.icon;
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
        onClick={handleSubmit} 
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
  );
};

export default VehicleSetupPage; 