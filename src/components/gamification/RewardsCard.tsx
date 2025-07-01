import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Star, Share2, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { countryDetectionService } from '@/services/CountryDetectionService';

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
// NOTE: Some generic Supabase rows are typed as any while the schema stabilises.

interface UserRewards {
  totalPoints: number;
  weeklyPoints: number;
  weeklyRank: number;
  referralsMade: number;
  promoCode: string;
  currency: string;
}

interface LeaderboardEntry {
  promo_code: string;
  total_points: number;
  weekly_rank: number;
  referrals_made: number;
}

export const RewardsCard = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's country for currency display
  const userCountry = user?.country || 'RW';
  const countryInfo = countryDetectionService.getCountryByCode(userCountry);
  const currencySymbol = countryDetectionService.getCurrencySymbol(countryInfo?.currency || 'RWF');

  // Prize structure based on country
  const weeklyPrizes = {
    1: `${currencySymbol}5000`,
    2: `${currencySymbol}3000`, 
    3: `${currencySymbol}2000`,
    4: `${currencySymbol}1000`,
    5: `${currencySymbol}500`
  };

  const fetchRewardsData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // For local sessions, show placeholder data
    if (user.id.startsWith('local-')) {
      setRewards({
        totalPoints: 0,
        weeklyPoints: 0,
        weeklyRank: 0,
        referralsMade: 0,
        promoCode: 'LOCAL-USER',
        currency: countryInfo?.currency || 'RWF'
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loyalty_actions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalPoints = data?.reduce((sum: number, action: any) => sum + action.points_awarded, 0) || 0;
      setRewards({
        totalPoints,
        weeklyPoints: 0, // TODO: Calculate weekly points
        weeklyRank: 0, // TODO: Calculate weekly rank
        referralsMade: 0, // TODO: Calculate referrals
        promoCode: user.promo_code || 'RIDE-USER',
        currency: countryInfo?.currency || 'RWF'
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.promo_code, countryInfo?.currency]);

  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

  const handleShareReferralCode = () => {
    const message = `🚗 Join me on Kigali Ride and earn points! Use my referral code: ${rewards?.promoCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Kigali Ride',
        text: message,
        url: `${window.location.origin}?promo=${rewards?.promoCode}`
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(message);
        toast({
          title: "Code Copied!",
          description: "Your referral code has been copied to clipboard",
        });
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      toast({
        title: "Code Copied!",
        description: "Your referral code has been copied to clipboard",
      });
    } else {
      // WhatsApp fallback
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rewards) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span>Your Rewards</span>
          {countryInfo && (
            <span className="text-lg">{countryInfo.flag}</span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{rewards.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{rewards.weeklyPoints}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>

        {/* Weekly Rank */}
        {rewards.weeklyRank > 0 && (
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Weekly Rank</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">#{rewards.weeklyRank}</div>
            {rewards.weeklyRank <= 5 && (
              <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                Prize: {weeklyPrizes[rewards.weeklyRank as keyof typeof weeklyPrizes]}
              </Badge>
            )}
          </div>
        )}

        {/* Referral Section */}
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Referrals</span>
            </div>
            <Badge variant="secondary">{rewards.referralsMade} invited</Badge>
          </div>
          
          <div className="text-center space-y-3">
            <div className="font-mono text-lg font-bold text-purple-600 bg-purple-100 py-2 px-4 rounded-lg">
              {rewards.promoCode}
            </div>
            
            <Button
              onClick={handleShareReferralCode}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Code
            </Button>
            
            <div className="text-xs text-gray-600">
              Earn 1 point per passenger, 5 points per driver referral
            </div>
          </div>
        </div>

        {/* Weekly Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Top Referrers This Week</span>
            </div>
            
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.promo_code}
                  className={`flex items-center justify-between p-2 rounded ${
                    entry.promo_code === rewards.promoCode 
                      ? 'bg-purple-100 border border-purple-300' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-mono text-sm">{entry.promo_code}</span>
                  </div>
                  <div className="text-sm font-semibold text-purple-600">
                    {entry.total_points}pts
                  </div>
                </div>
              ))}
            </div>
            
            {rewards.weeklyRank > 5 && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center justify-between p-2 rounded bg-purple-100 border border-purple-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                      {rewards.weeklyRank}
                    </div>
                    <span className="font-mono text-sm">{rewards.promoCode}</span>
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  </div>
                  <div className="text-sm font-semibold text-purple-600">
                    {rewards.weeklyPoints}pts
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 