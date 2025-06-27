
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Car } from 'lucide-react';

interface DriverProfile {
  vehicle_type?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  license_plate?: string;
  driver_license?: string;
}

interface User {
  full_name?: string;
  phone_number?: string;
  driver_profile?: DriverProfile;
}

interface DriverHeaderProps {
  user: User;
  isOnline: boolean;
}

const DriverHeader: React.FC<DriverHeaderProps> = ({ user, isOnline }) => {
  const driverProfile = user.driver_profile;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {user.full_name || 'Driver'}
              </h2>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                {user.phone_number || 'No phone'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Badge>
            {driverProfile && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Car className="w-4 h-4 mr-1" />
                <span>
                  {driverProfile.vehicle_make} {driverProfile.vehicle_model}
                  {driverProfile.license_plate && ` • ${driverProfile.license_plate}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverHeader;
