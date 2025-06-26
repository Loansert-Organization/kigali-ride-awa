
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LeaderboardBlock = () => {
  const { user } = useAuth();

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['weekly-leaderboard'],
    queryFn: async () => {
      const currentWeek = new Date();
      const monday = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          user:users!user_rewards_user_id_fkey(promo_code)
        `)
        .eq('week', monday.toISOString().split('T')[0])
        .order('points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
      return data || [];
    },
    retry: 2,
    staleTime: 60000 // Cache for 1 minute
  });

  const { data: userRank } = useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const currentWeek = new Date();
      const monday = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_rewards')
        .select('points')
        .eq('user_id', user.id)
        .eq('week', monday.toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user rank:', error);
        return 0;
      }
      return data?.points || 0;
    },
    enabled: !!user?.id,
    retry: 1
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-base font-bold">#{rank}</span>;
    }
  };

  const getRewardText = (rank: number) => {
    if (rank <= 5) {
      const rewards = ['5000 RWF', '3000 RWF', '2000 RWF', '1000 RWF', '500 RWF'];
      return rewards[rank - 1];
    }
    return '';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="w-6 h-6 mr-2" />
            🏆 Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 font-medium text-lg">Failed to load leaderboard</p>
            <p className="text-base text-gray-500 mt-1">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="w-6 h-6 mr-2" />
            🏆 Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse font-medium text-lg">Loading leaderboard...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Trophy className="w-6 h-6 mr-2" />
          🏆 Weekly Leaderboard (Top 10)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium">No rankings yet this week</p>
            <p className="text-sm mt-1">Be the first to earn points!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const reward = getRewardText(rank);
              
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankIcon(rank)}
                    <div>
                      <p className="font-mono text-base font-medium">
                        {entry.user?.promo_code || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        {entry.points} points
                      </p>
                    </div>
                  </div>
                  
                  {reward && (
                    <div className="text-right">
                      <span className="text-base font-medium text-green-600">
                        ✅ {reward}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* User's current position */}
        {userRank !== undefined && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-base text-center font-medium">
              <strong>Your current position:</strong> {userRank} points this week
              {userRank === 0 && " - Start referring to climb the ranks!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardBlock;
