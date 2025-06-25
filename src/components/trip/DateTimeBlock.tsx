
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Calendar } from 'lucide-react';

interface DateTimeBlockProps {
  scheduledTime: string;
  onUpdate: (updates: any) => void;
}

const DateTimeBlock: React.FC<DateTimeBlockProps> = ({
  scheduledTime,
  onUpdate
}) => {
  const quickTimes = [
    { 
      id: 'now', 
      label: 'Now', 
      icon: '⚡',
      getValue: () => new Date().toISOString().slice(0, 16)
    },
    { 
      id: 'in30', 
      label: 'In 30 min', 
      icon: '🕐',
      getValue: () => new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)
    },
    { 
      id: 'in1h', 
      label: 'In 1 hour', 
      icon: '🕓',
      getValue: () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
    },
    { 
      id: 'tomorrow', 
      label: 'Tomorrow', 
      icon: '📅',
      getValue: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        return tomorrow.toISOString().slice(0, 16);
      }
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          🕓 When are you leaving?
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {quickTimes.map((time) => (
              <Button
                key={time.id}
                onClick={() => onUpdate({ scheduledTime: time.getValue() })}
                variant={scheduledTime === time.getValue() ? "default" : "outline"}
                className="h-12"
              >
                <span className="mr-2">{time.icon}</span>
                {time.label}
              </Button>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or pick a specific time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateTimeBlock;
