
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Globe } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { isGuestMode, getDisplayName } from "@/utils/authUtils";

const UserSummaryBlock = () => {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const isGuest = isGuestMode(userProfile);
  const displayName = getDisplayName(userProfile);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {displayName}
              </h2>
              {userProfile.role && (
                <Badge variant={userProfile.role === 'driver' ? 'default' : 'secondary'}>
                  {userProfile.role === 'driver' ? '🚗 Driver' : '👩 Passenger'}
                </Badge>
              )}
              {isGuest && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Guest
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(userProfile.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span className="capitalize">
                  {userProfile.language === 'en' ? 'English' : 
                   userProfile.language === 'fr' ? 'Français' : 
                   userProfile.language === 'rw' ? 'Kinyarwanda' : userProfile.language}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSummaryBlock;
