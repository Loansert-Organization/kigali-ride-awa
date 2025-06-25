
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CheckCircle, Gift, Activity } from 'lucide-react';

interface KPIData {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  totalReferrals: number;
  weeklyActiveUsers: number;
  totalRewards: number;
  usersDelta?: number;
  tripsDelta?: number;
}

interface KPIStatsCardsProps {
  data?: KPIData;
}

export const KPIStatsCards: React.FC<KPIStatsCardsProps> = ({ data }) => {
  const kpis = [
    {
      title: 'Total Users',
      value: data?.totalUsers || 0,
      delta: data?.usersDelta || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Trips',
      value: data?.totalTrips || 0,
      delta: data?.tripsDelta || 0,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Bookings',
      value: data?.totalBookings || 0,
      delta: 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Referrals',
      value: data?.totalReferrals || 0,
      delta: 0,
      icon: Gift,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Weekly Active Users',
      value: data?.weeklyActiveUsers || 0,
      delta: 0,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              {kpi.delta !== 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  kpi.delta > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {kpi.delta > 0 ? '+' : ''}{kpi.delta}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {kpi.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
