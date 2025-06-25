
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';

interface DriverHeaderProps {
  driverProfile: any;
  onProfileClick: () => void;
}

const DriverHeader: React.FC<DriverHeaderProps> = ({
  driverProfile,
  onProfileClick
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-500 p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🚗 Driver Dashboard</h1>
          <p className="text-blue-100">
            {driverProfile?.vehicle_type} • {driverProfile?.plate_number}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={onProfileClick}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default DriverHeader;
