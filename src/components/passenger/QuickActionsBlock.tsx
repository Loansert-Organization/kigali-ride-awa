
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Clock, FileText, Zap } from 'lucide-react';

interface QuickActionsBlockProps {
  onActionClick: (action: string) => void;
}

const QuickActionsBlock: React.FC<QuickActionsBlockProps> = ({
  onActionClick
}) => {
  const actions = [
    {
      id: 'request_ride',
      icon: Car,
      label: '🚖 Request a Ride',
      description: 'Book your next trip',
      color: 'from-purple-600 to-orange-500',
      textColor: 'text-white'
    },
    {
      id: 'view_trips',
      icon: Clock,
      label: '🕒 View Driver Trips',
      description: 'See what drivers are offering',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-white'
    },
    {
      id: 'my_rides',
      icon: FileText,
      label: '📂 My Rides',
      description: 'Past & upcoming trips',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-white'
    }
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          ⚡ Quick Actions
        </h3>
        
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                className={`w-full h-16 bg-gradient-to-r ${action.color} hover:opacity-90 transition-opacity ${action.textColor} justify-start`}
                onClick={() => onActionClick(action.id)}
              >
                <div className="flex items-center space-x-4">
                  <Icon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsBlock;
