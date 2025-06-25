import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Globe } from 'lucide-react';
import { getDisplayName, isGuestMode } from '@/utils/authUtils';
import { UserProfile } from '@/types/user';

interface UserSummaryBlockProps {
  userProfile: UserProfile;
}

const UserSummaryBlock: React.FC<UserSummaryBlockProps> = ({ userProfile }) => {
  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  const isGuest = isGuestMode(userProfile);
  const displayName = getDisplayName(userProfile);
  const joinDate = new Date(userProfile.created_at).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <User className="w-5 h-5 mr-2" />
          👤 Profile Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-600">
              {isGuest ? 'Guest User' : 'Registered User'}
            </p>
          </div>
          <Badge variant={userProfile.role === 'driver' ? 'default' : 'secondary'}>
            {userProfile.role === 'driver' ? '🚗 Driver' : '🧍 Passenger'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Joined</p>
              <p className="font-medium">{joinDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Language</p>
              <p className="font-medium capitalize">{userProfile.language}</p>
            </div>
          </div>
        </div>

        {userProfile.promo_code && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 mb-1">Your Promo Code</p>
            <div className="bg-gradient-to-r from-purple-100 to-orange-100 p-2 rounded-md">
              <p className="font-mono font-bold text-center text-purple-700">
                {userProfile.promo_code}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSummaryBlock;
