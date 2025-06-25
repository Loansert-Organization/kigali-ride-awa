
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Car } from 'lucide-react';
import { getDisplayName, isGuestMode } from '@/utils/authUtils';

interface UserSummaryBlockProps {
  userProfile: any;
}

const UserSummaryBlock: React.FC<UserSummaryBlockProps> = ({ userProfile }) => {
  const displayName = getDisplayName(userProfile);
  const isGuest = isGuestMode(userProfile);
  const roleIcon = userProfile.role === 'driver' ? Car : User;
  const RoleIcon = roleIcon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <RoleIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h2>
            {isGuest && (
              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full mt-1">
                Guest Mode
              </span>
            )}
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Role: </span>
              <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                {userProfile.role === 'driver' ? '🚗 Driver' : '🧍 Passenger'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSummaryBlock;
