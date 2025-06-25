
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Users, Trophy } from 'lucide-react';

const RewardsExplainerBlock = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="w-5 h-5 mr-2" />
          🎯 How It Works
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-sm">Share Your Code</p>
              <p className="text-xs text-gray-600">
                Send your promo code to friends via WhatsApp, SMS, or social media
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚖</span>
            <div>
              <p className="font-medium text-sm">They Complete Rides</p>
              <p className="text-xs text-gray-600">
                <strong>Passengers:</strong> +1 point when they complete their first ride<br />
                <strong>Drivers:</strong> +5 points when they complete 5 rides
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-medium text-sm">Climb the Leaderboard</p>
              <p className="text-xs text-gray-600">
                Top 5 weekly performers win cash rewards: 5000, 3000, 2000, 1000, 500 RWF
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-purple-800">
              <strong>🚫 Anti-Fraud:</strong> We verify all referrals to ensure fairness. 
              Fake accounts or abuse will result in point removal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsExplainerBlock;
