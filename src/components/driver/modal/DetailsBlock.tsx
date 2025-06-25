
import React from 'react';
import { Car, DollarSign, Users } from 'lucide-react';

interface DetailsBlockProps {
  vehicleType: string;
  fare?: number;
  seatsAvailable: number;
  description?: string;
}

const DetailsBlock: React.FC<DetailsBlockProps> = ({
  vehicleType,
  fare,
  seatsAvailable,
  description
}) => {
  const getVehicleIcon = (type: string) => {
    const icons = {
      moto: '🛵',
      car: '🚗',
      tuktuk: '🛺',
      minibus: '🚐'
    };
    return icons[type as keyof typeof icons] || '🚗';
  };

  return (
    <div className="space-y-3">
      {/* Vehicle & Fare Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-gray-600" />
          <div>
            <span className="text-lg">{getVehicleIcon(vehicleType)}</span>
            <span className="ml-2 text-sm font-medium capitalize">{vehicleType}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            {fare ? (
              <span className="font-bold text-green-600">{fare} RWF</span>
            ) : (
              <span className="text-gray-500 text-sm">Not specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Seats */}
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium">
          "{seatsAvailable} seats needed"
        </span>
      </div>

      {/* Description */}
      {description && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 italic">"{description}"</p>
        </div>
      )}
    </div>
  );
};

export default DetailsBlock;
