
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Shield, Star } from 'lucide-react';

const RewardsExplainerBlock = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          📖 How It Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">👩</span>
            <div>
              <p className="font-medium text-sm">Passenger Referrals</p>
              <p className="text-xs text-gray-600">
                <strong>1 point</strong> per passenger after they complete their first ride
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="font-medium text-sm">Driver Referrals</p>
              <p className="text-xs text-gray-600">
                <strong>5 points</strong> per driver after they complete 5 verified rides
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Star className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <p className="font-medium text-sm">Weekly Rewards</p>
              <p className="text-xs text-gray-600">
                Top 5 users each week win cash rewards from 500-5000 RWF
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-500 mt-1" />
            <div>
              <p className="font-medium text-sm">Anti-Fraud Protection</p>
              <p className="text-xs text-gray-600">
                🛡️ Advanced checks prevent self-referrals and fake accounts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg mt-4">
          <p className="text-xs text-gray-600 text-center">
            <strong>Fair Play:</strong> All referrals are verified for authenticity. 
            Invalid or suspicious activity will be removed from the leaderboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsExplainerBlock;
