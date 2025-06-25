
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Car, Users, Plus, Minus } from 'lucide-react';

interface VehicleDetailsBlockProps {
  vehicleType: string;
  seatsAvailable: number;
  description: string;
  onUpdate: (updates: any) => void;
  driverProfile: any;
}

const VehicleDetailsBlock: React.FC<VehicleDetailsBlockProps> = ({
  vehicleType,
  seatsAvailable,
  description,
  onUpdate,
  driverProfile
}) => {
  const vehicles = [
    { id: 'moto', name: 'Moto', icon: '🛵', maxSeats: 1 },
    { id: 'car', name: 'Car', icon: '🚗', maxSeats: 4 },
    { id: 'tuktuk', name: 'Tuktuk', icon: '🛺', maxSeats: 3 },
    { id: 'minibus', name: 'Minibus', icon: '🚐', maxSeats: 14 }
  ];

  const selectedVehicle = vehicles.find(v => v.id === vehicleType);
  const maxSeats = selectedVehicle?.maxSeats || 4;

  const adjustSeats = (delta: number) => {
    const newValue = Math.max(1, Math.min(maxSeats, seatsAvailable + delta));
    onUpdate({ seatsAvailable: newValue });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            🚗 Vehicle Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle type
              </label>
              <Select value={vehicleType} onValueChange={(value) => onUpdate({ vehicleType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center space-x-2">
                        <span>{vehicle.icon}</span>
                        <span>{vehicle.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {driverProfile?.plate_number && (
                <p className="text-sm text-gray-500 mt-1">
                  Plate: {driverProfile.plate_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available seats
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustSeats(-1)}
                  disabled={seatsAvailable <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">
                    {seatsAvailable} passenger{seatsAvailable !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustSeats(1)}
                  disabled={seatsAvailable >= maxSeats}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Max {maxSeats} for {selectedVehicle?.name || 'this vehicle'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Additional Notes</h3>
          
          <Textarea
            placeholder="Anything passengers should know? E.g., helmet required, luggage space, pickup instructions..."
            value={description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-20"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailsBlock;
