import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Clock, Car } from 'lucide-react';

interface TravelTimeSelectorProps {
  label: string;
  value: 'now' | 'schedule';
  onChange: (value: 'now' | 'schedule') => void;
}

export const TravelTimeSelector = ({ label, value, onChange }: TravelTimeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center gap-2">
        🕒 {label}
      </Label>
      
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            value === 'now' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-accent'
          }`}
          onClick={() => onChange('now')}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-medium">🚗 Book Now</div>
              <div className="text-xs text-muted-foreground">Immediate pickup</div>
            </div>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            value === 'schedule' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-accent'
          }`}
          onClick={() => onChange('schedule')}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">🕓 Schedule for Later</div>
              <div className="text-xs text-muted-foreground">Pick date & time</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};