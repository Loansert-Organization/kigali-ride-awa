
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Calendar } from 'lucide-react';

interface TimePickerBlockProps {
  scheduledTime: string;
  onTimeChange: (time: string) => void;
  customTime: string;
  onCustomTimeChange: (time: string) => void;
}

const TimePickerBlock: React.FC<TimePickerBlockProps> = ({
  scheduledTime,
  onTimeChange,
  customTime,
  onCustomTimeChange
}) => {
  const quickTimes = [
    { id: 'now', label: 'Now', icon: '⚡' },
    { id: 'in15', label: 'In 15 min', icon: '🕐' },
    { id: 'in30', label: 'In 30 min', icon: '🕕' },
    { id: 'in1h', label: 'In 1 hour', icon: '🕓' }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          When do you need the ride?
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickTimes.map((time) => (
            <Button
              key={time.id}
              onClick={() => onTimeChange(time.id)}
              variant={scheduledTime === time.id ? "default" : "outline"}
              className={`h-12 ${
                scheduledTime === time.id 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-purple-50'
              }`}
            >
              <span className="mr-2">{time.icon}</span>
              {time.label}
            </Button>
          ))}
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => onTimeChange('custom')}
            variant={scheduledTime === 'custom' ? "default" : "outline"}
            className={`w-full h-12 ${
              scheduledTime === 'custom' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-purple-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            🗓️ Pick date & time
          </Button>
          
          {scheduledTime === 'custom' && (
            <Input
              type="datetime-local"
              value={customTime}
              onChange={(e) => onCustomTimeChange(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="h-12"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimePickerBlock;
