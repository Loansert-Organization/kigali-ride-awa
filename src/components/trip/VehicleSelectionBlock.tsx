
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VehicleSelectionBlockProps {
  vehicleType: string;
  onUpdate: (updates: { vehicleType: string }) => void;
}

const VehicleSelectionBlock: React.FC<VehicleSelectionBlockProps> = ({
  vehicleType,
  onUpdate
}) => {
  const vehicles = [
    { id: 'moto', name: 'Moto', icon: '🛵', description: 'Fast & affordable' },
    { id: 'car', name: 'Car', icon: '🚗', description: 'Comfortable ride' },
    { id: 'tuktuk', name: 'Tuktuk', icon: '🛺', description: 'Local favorite' },
    { id: 'minibus', name: 'Minibus', icon: '🚐', description: 'Group travel' }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">🚗 Choose Vehicle Type</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {vehicles.map((vehicle) => (
            <Button
              key={vehicle.id}
              onClick={() => onUpdate({ vehicleType: vehicle.id })}
              variant={vehicleType === vehicle.id ? "default" : "outline"}
              className={`h-20 flex flex-col items-center justify-center space-y-1 ${
                vehicleType === vehicle.id 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-purple-50'
              }`}
            >
              <span className="text-2xl">{vehicle.icon}</span>
              <span className="font-medium">{vehicle.name}</span>
              <span className="text-xs opacity-75">{vehicle.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleSelectionBlock;
