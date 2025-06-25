
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Car, Clock, DollarSign } from 'lucide-react';

interface DriverStatusSummaryProps {
  todayTrips: number;
  todayEarnings: number;
  weeklyPoints: number;
  leaderboardRank?: number;
  lastTripSummary?: {
    destination: string;
    completedAt: string;
    fare: number;
  };
}

const DriverStatusSummary: React.FC<DriverStatusSummaryProps> = ({
  todayTrips,
  todayEarnings,
  weeklyPoints,
  leaderboardRank,
  lastTripSummary
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="w-5 h-5 mr-2" />
          🎯 Today's Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{todayTrips}</div>
            <div className="text-xs text-gray-500">Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{todayEarnings.toLocaleString()}</div>
            <div className="text-xs text-gray-500">RWF Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{weeklyPoints}</div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
        </div>

        {leaderboardRank && (
          <div className="text-center mb-3">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              🏆 #{leaderboardRank} on leaderboard
            </Badge>
          </div>
        )}

        {lastTripSummary && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600 mb-1">Last completed trip:</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium truncate">{lastTripSummary.destination}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500">{lastTripSummary.completedAt}</span>
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-medium text-green-600">{lastTripSummary.fare}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverStatusSummary;
