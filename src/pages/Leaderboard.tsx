
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Gift, Users, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  promo_code: string;
  role: string;
  total_points: number;
  referrals_made: number;
  weekly_rank: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_rewards_leaderboard_view')
        .select('*')
        .order('weekly_rank', { ascending: true })
        .limit(20);

      if (error) throw error;
      setLeaderboard(data || []);

      // Find current user's rank if they're authenticated
      if (userProfile) {
        const userRank = data?.find(entry => entry.id === userProfile.id);
        setMyRank(userRank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Weekly Leaderboard</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* My Rank Card - shown for authenticated users */}
        {userProfile && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Your Rank</h3>
                  <p className="text-sm text-purple-700">
                    {userProfile.promo_code} • {userProfile.role || 'User'}
                  </p>
                </div>
                <div className="text-right">
                  {myRank ? (
                    <>
                      <div className="text-2xl font-bold text-purple-600">
                        {getRankIcon(myRank.weekly_rank)}
                      </div>
                      <div className="text-sm text-purple-700">
                        {myRank.total_points} points
                      </div>
                    </>
                  ) : (
                    <div className="text-purple-600">
                      <p className="text-sm">Not ranked yet</p>
                      <p className="text-xs">Refer friends to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Info */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-900">
              <Gift className="w-5 h-5 mr-2" />
              Weekly Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex justify-between">
                <span>🥇 1st Place:</span>
                <span className="font-semibold">5,000 RWF</span>
              </div>
              <div className="flex justify-between">
                <span>🥈 2nd Place:</span>
                <span className="font-semibold">3,000 RWF</span>
              </div>
              <div className="flex justify-between">
                <span>🥉 3rd Place:</span>
                <span className="font-semibold">2,000 RWF</span>
              </div>
              <div className="flex justify-between">
                <span>Top 10:</span>
                <span className="font-semibold">Free rides</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Points Work */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Refer a new passenger:</span>
                <span className="font-semibold text-blue-600">+1 point</span>
              </div>
              <div className="flex justify-between">
                <span>Refer a new driver:</span>
                <span className="font-semibold text-green-600">+5 points</span>
              </div>
              <div className="flex justify-between">
                <span>Complete your first ride:</span>
                <span className="font-semibold text-purple-600">+2 points</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Top Performers
          </h2>
          
          {leaderboard.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No rankings yet this week.</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to earn points!</p>
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((entry, index) => (
              <Card key={entry.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.weekly_rank)}`}>
                        {typeof getRankIcon(entry.weekly_rank) === 'string' && getRankIcon(entry.weekly_rank).startsWith('#') 
                          ? getRankIcon(entry.weekly_rank) 
                          : <span className="text-xl">{getRankIcon(entry.weekly_rank)}</span>
                        }
                      </div>
                      <div>
                        <div className="font-semibold">{entry.promo_code}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.role || 'User'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {entry.referrals_made} referrals
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.total_points}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action for Guest Users */}
        {!userProfile && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-blue-900 mb-2">Join the Competition!</h3>
              <p className="text-sm text-blue-700 mb-3">
                Verify your WhatsApp to start earning points and climb the leaderboard.
              </p>
              <Button 
                onClick={() => navigate('/book-ride')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
