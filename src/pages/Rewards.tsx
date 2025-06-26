
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import PromoCodeDisplayBlock from "@/components/rewards/PromoCodeDisplayBlock";
import ReferralListBlock from "@/components/rewards/ReferralListBlock";
import LeaderboardBlock from "@/components/rewards/LeaderboardBlock";
import RewardsExplainerBlock from "@/components/rewards/RewardsExplainerBlock";
import { Loader2 } from "lucide-react";

const Rewards = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();

  // Only show loading if auth is still loading AND no userProfile exists
  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg text-gray-600 font-medium">Loading rewards...</p>
        </div>
      </div>
    );
  }

  // If not loading but no profile, redirect to role selection
  if (!loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4 font-medium">Please select your role first</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg"
          >
            Go to Home
          </Button>
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
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            🎁 Rewards & Referrals
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Promo Code Section */}
        <PromoCodeDisplayBlock promoCode={userProfile?.promo_code || ''} />

        {/* Referrals Progress */}
        <ReferralListBlock />

        {/* Leaderboard */}
        <LeaderboardBlock />

        {/* How It Works */}
        <RewardsExplainerBlock />
      </div>

      {userProfile?.role && <BottomNavigation role={userProfile.role} />}
    </div>
  );
};

export default Rewards;
