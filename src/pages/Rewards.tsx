
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

const Rewards = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  if (!userProfile?.role) {
    return null;
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
          <h1 className="text-xl font-semibold text-gray-900">
            🎁 Rewards & Referrals
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Promo Code Section */}
        <PromoCodeDisplayBlock promoCode={userProfile.promo_code || ''} />

        {/* Referrals Progress */}
        <ReferralListBlock />

        {/* Leaderboard */}
        <LeaderboardBlock />

        {/* How It Works */}
        <RewardsExplainerBlock />
      </div>

      <BottomNavigation role={userProfile.role} />
    </div>
  );
};

export default Rewards;
