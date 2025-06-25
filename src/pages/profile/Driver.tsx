
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import UserSummaryBlock from "@/components/profile/UserSummaryBlock";
import PromoCodeBlock from "@/components/profile/PromoCodeBlock";
import PermissionsStatusBlock from "@/components/profile/PermissionsStatusBlock";
import LanguageSelectorBlock from "@/components/profile/LanguageSelectorBlock";
import DriverSettingsBlock from "@/components/profile/DriverSettingsBlock";
import StaticLinksBlock from "@/components/profile/StaticLinksBlock";
import AppResetButtonBlock from "@/components/profile/AppResetButtonBlock";
import BottomNavigation from "@/components/navigation/BottomNavigation";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-2 text-purple-600" />
            Driver Profile
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Summary */}
        <UserSummaryBlock userProfile={userProfile} />

        {/* Promo Code */}
        <PromoCodeBlock userProfile={userProfile} />

        {/* Driver-specific Settings */}
        <DriverSettingsBlock userProfile={userProfile} />

        {/* Permissions */}
        <PermissionsStatusBlock userProfile={userProfile} />

        {/* Language Settings */}
        <LanguageSelectorBlock userProfile={userProfile} />

        {/* Static Links */}
        <StaticLinksBlock />

        {/* Reset App */}
        <AppResetButtonBlock userProfile={userProfile} />
      </div>

      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverProfile;
