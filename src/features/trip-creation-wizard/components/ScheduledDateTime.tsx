import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledDateTimeProps {
  label: string;
  minTime: Date;
  maxDaysAhead: number;
  value?: Date;
  onSelect: (date: Date) => void;
}

export const ScheduledDateTime = ({ 
  label, 
  minTime, 
  maxDaysAhead, 
  value, 
  onSelect 
}: ScheduledDateTimeProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + maxDaysAhead);

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      
      // If it's today, set a time that's at least 5 minutes from now
      if (date.toDateString() === today.toDateString()) {
        const minDateTime = new Date(minTime.getTime() + 5 * 60 * 1000); // 5 minutes from minTime
        date.setHours(minDateTime.getHours(), minDateTime.getMinutes(), 0, 0);
      } else {
        // For future dates, default to 8 AM
        date.setHours(8, 0, 0, 0);
      }
      
      onSelect(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      // Validate minimum time if it's today
      if (newDate.toDateString() === today.toDateString() && newDate < minTime) {
        return; // Don't allow past times for today
      }
      
      setSelectedDate(newDate);
      onSelect(newDate);
      setIsOpen(false);
    }
  };

  const isTimeDisabled = (time: string): boolean => {
    if (!selectedDate) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const timeDate = new Date(selectedDate);
    timeDate.setHours(hours, minutes, 0, 0);
    
    return selectedDate.toDateString() === today.toDateString() && timeDate < minTime;
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP 'at' HH:mm")
            ) : (
              <span>Pick travel time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date < today || date > maxDate
              }
              initialFocus
              className="rounded-md border-r"
            />
            
            {selectedDate && (
              <div className="w-32 max-h-60 overflow-y-auto border-l">
                <div className="p-2 border-b bg-muted">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Time
                  </div>
                </div>
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    disabled={isTimeDisabled(time)}
                    className={cn(
                      "w-full p-2 text-left text-sm hover:bg-accent",
                      selectedDate && 
                      format(selectedDate, 'HH:mm') === time && 
                      "bg-primary text-primary-foreground",
                      isTimeDisabled(time) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};