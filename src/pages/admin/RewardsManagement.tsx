
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Trophy, Users, TrendingUp, Search, Award, Star } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from '@/components/admin/AdminHeader';

const RewardsManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [rewardsData, setRewardsData] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load leaderboard data
      const { data: leaderboard } = await supabase
        .from('user_referrals')
        .select(`
          referrer_id,
          users!user_referrals_referrer_id_fkey(promo_code),
          points_awarded
        `)
        .eq('validation_status', 'validated');

      // Load rewards data
      const { data: rewards } = await supabase
        .from('user_rewards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load referral data
      const { data: referrals } = await supabase
        .from('user_referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setLeaderboardData(leaderboard || []);
      setRewardsData(rewards || []);
      setReferralData(referrals || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleValidateReferral = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('user_referrals')
        .update({ validation_status: 'validated' })
        .eq('id', referralId);

      if (error) throw error;

      toast({
        title: "Referral Validated",
        description: "Points will be awarded to the referrer"
      });

      handleRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate referral",
        variant: "destructive"
      });
    }
  };

  const handleRejectReferral = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('user_referrals')
        .update({ validation_status: 'rejected' })
        .eq('id', referralId);

      if (error) throw error;

      toast({
        title: "Referral Rejected",
        description: "Referral has been marked as invalid"
      });

      handleRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject referral",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      validated: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onRefresh={handleRefresh} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎁 Rewards Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboardData.slice(0, 10).map((user: any, index) => (
                      <div key={user.referrer_id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            {index < 3 ? (
                              <Award className="w-5 h-5 text-purple-600" />
                            ) : (
                              <span className="font-bold text-purple-600">#{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">User {user.users?.promo_code || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">Referrer ID: {user.referrer_id}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">{user.points_awarded || 0} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referral Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading referrals...</div>
                ) : (
                  <div className="space-y-4">
                    {referralData.map((referral: any) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-medium">Referral #{referral.id.slice(0, 8)}</div>
                              <div className="text-sm text-gray-500">
                                {referral.referee_role} • {new Date(referral.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={getStatusBadge(referral.validation_status)}>
                              {referral.validation_status}
                            </Badge>
                          </div>
                        </div>
                        {referral.validation_status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleValidateReferral(referral.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Validate
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectReferral(referral.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Reward Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading rewards...</div>
                ) : (
                  <div className="space-y-4">
                    {rewardsData.map((reward: any) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">Reward #{reward.id.slice(0, 8)}</div>
                          <div className="text-sm text-gray-500">
                            {reward.reward_type} • {reward.points} points • {new Date(reward.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={reward.reward_issued ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {reward.reward_issued ? 'Issued' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RewardsManagement;
