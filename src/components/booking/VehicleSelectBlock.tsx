
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VehicleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string;
}

interface VehicleSelectBlockProps {
  selectedVehicle: string;
  onVehicleSelect: (vehicleType: string) => void;
}

const VehicleSelectBlock: React.FC<VehicleSelectBlockProps> = ({
  selectedVehicle,
  onVehicleSelect
}) => {
  const vehicles: VehicleOption[] = [
    {
      id: 'moto',
      name: 'Moto',
      icon: '🛵',
      description: 'Fast & affordable',
      estimatedTime: '5-10 min'
    },
    {
      id: 'car',
      name: 'Car',
      icon: '🚗',
      description: 'Comfortable ride',
      estimatedTime: '10-15 min'
    },
    {
      id: 'tuktuk',
      name: 'Tuktuk',
      icon: '🛺',
      description: 'Local favorite',
      estimatedTime: '8-12 min'
    },
    {
      id: 'minibus',
      name: 'Minibus',
      icon: '🚐',
      description: 'Group travel',
      estimatedTime: '15-20 min'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Choose your ride</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {vehicles.map((vehicle) => (
            <Button
              key={vehicle.id}
              onClick={() => onVehicleSelect(vehicle.id)}
              variant={selectedVehicle === vehicle.id ? "default" : "outline"}
              className={`h-20 flex flex-col items-center justify-center space-y-1 ${
                selectedVehicle === vehicle.id 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-purple-50'
              }`}
            >
              <span className="text-2xl">{vehicle.icon}</span>
              <span className="font-medium">{vehicle.name}</span>
              <span className="text-xs opacity-75">{vehicle.estimatedTime}</span>
            </Button>
          ))}
        </div>
        
        {selectedVehicle && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {vehicles.find(v => v.id === selectedVehicle)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleSelectBlock;
