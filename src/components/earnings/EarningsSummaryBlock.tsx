
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Calendar, Trophy } from 'lucide-react';

interface EarningsSummaryBlockProps {
  data: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  } | undefined;
  formatCurrency: (amount: number) => string;
}

export const EarningsSummaryBlock: React.FC<EarningsSummaryBlockProps> = ({ 
  data, 
  formatCurrency 
}) => {
  if (!data) return null;

  const summaryCards = [
    {
      label: "Today",
      amount: data.today,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "This Week",
      amount: data.thisWeek,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "This Month",
      amount: data.thisMonth,
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "All Time",
      amount: data.allTime,
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(card.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
