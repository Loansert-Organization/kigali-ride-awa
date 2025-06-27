
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Settings } from 'lucide-react';

interface QuickActionButtonsProps {
  onCreateTrip: () => void;
  onViewRequests: () => void;
  onOpenSettings: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onCreateTrip,
  onViewRequests,
  onOpenSettings
}) => {
  const actions = [
    {
      label: 'Create Trip',
      icon: Plus,
      onClick: onCreateTrip,
      variant: 'default' as const,
      description: 'Post a new trip'
    },
    {
      label: 'View Requests',
      icon: Users,
      onClick: onViewRequests,
      variant: 'outline' as const,
      description: 'See passenger requests'
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: onOpenSettings,
      variant: 'ghost' as const,
      description: 'Adjust preferences'
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Icon className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionButtons;
