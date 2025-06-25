
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import UserSummaryBlock from '@/components/profile/UserSummaryBlock';
import LanguageSelectorBlock from '@/components/profile/LanguageSelectorBlock';
import PromoCodeBlock from '@/components/profile/PromoCodeBlock';
import PermissionsStatusBlock from '@/components/profile/PermissionsStatusBlock';
import RoleResetBlock from '@/components/profile/RoleResetBlock';
import DriverSettingsBlock from '@/components/profile/DriverSettingsBlock';
import AppResetButtonBlock from '@/components/profile/AppResetButtonBlock';
import StaticLinksBlock from '@/components/profile/StaticLinksBlock';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { isGuestMode } from '@/utils/authUtils';

const Profile = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Navigate back to the appropriate home page based on user role
    if (userProfile?.role === 'driver') {
      navigate('/home/driver');
    } else if (userProfile?.role === 'passenger') {
      navigate('/home/passenger');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isDriver = userProfile.role === 'driver';
  const isGuest = isGuestMode(userProfile);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="mr-2 hover:bg-gray-100 active:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">👤 My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* User Summary */}
        <UserSummaryBlock userProfile={userProfile} />

        {/* Promo Code */}
        <PromoCodeBlock promoCode={userProfile.promo_code} />

        {/* Language & Preferences */}
        <LanguageSelectorBlock currentLanguage={userProfile.language} />
        
        <PermissionsStatusBlock 
          locationEnabled={userProfile.location_enabled}
          notificationsEnabled={userProfile.notifications_enabled}
        />

        {/* Role Management */}
        <RoleResetBlock currentRole={userProfile.role} />

        {/* Driver-Only Settings */}
        {isDriver && (
          <DriverSettingsBlock userId={userProfile.id} />
        )}

        {/* Account Management */}
        <AppResetButtonBlock isGuest={isGuest} />

        {/* Static Links */}
        <StaticLinksBlock />
      </div>

      {/* Bottom Navigation */}
      {userProfile.role && (
        <BottomNavigation role={userProfile.role} />
      )}
    </div>
  );
};

export default Profile;
