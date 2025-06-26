
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ReferralListBlock = () => {
  const { user } = useAuth();

  const { data: referrals, isLoading, error } = useQuery({
    queryKey: ['user-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_referrals')
        .select(`
          *,
          referee:users!user_referrals_referee_id_fkey(promo_code, role)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000 // Cache for 30 seconds
  });

  const getStatusInfo = (referral: any) => {
    switch (referral.validation_status) {
      case 'valid':
        return { icon: '✅', text: 'Completed', color: 'text-green-600' };
      case 'validated':
        return { icon: '✅', text: 'Completed', color: 'text-green-600' };
      case 'pending':
        if (referral.referee_role === 'passenger') {
          return { icon: '⏳', text: '0/1 trips', color: 'text-yellow-600' };
        } else {
          return { icon: '⏳', text: `${Math.min(referral.points_awarded || 0, 4)}/5 trips`, color: 'text-yellow-600' };
        }
      case 'rejected':
        return { icon: '❌', text: 'Invalid', color: 'text-red-600' };
      default:
        return { icon: '⏳', text: 'Pending', color: 'text-gray-600' };
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="w-6 h-6 mr-2" />
            👥 People You Referred
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 font-medium text-lg">Failed to load referrals</p>
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
            <Users className="w-6 h-6 mr-2" />
            👥 People You Referred
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse font-medium text-lg">Loading referrals...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="w-6 h-6 mr-2" />
          👥 People You Referred ({referrals?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!referrals || referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium">No referrals yet</p>
            <p className="text-sm mt-1">Share your code to start earning points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => {
              const status = getStatusInfo(referral);
              const roleIcon = referral.referee_role === 'passenger' ? '👩' : '🚗';
              
              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{roleIcon}</span>
                    <div>
                      <p className="font-medium text-base">
                        {referral.referee?.promo_code || `Referral #${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-500 capitalize font-medium">
                        {referral.referee_role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{status.icon}</span>
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralListBlock;
