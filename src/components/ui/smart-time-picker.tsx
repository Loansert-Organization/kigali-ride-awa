import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

type SmartTimeValue = string | Date;

interface SmartTimePickerProps {
  value: SmartTimeValue;
  onChange: (value: SmartTimeValue) => void;
  label?: string;
  minDate?: SmartTimeValue;
  maxDate?: SmartTimeValue;
}

export const SmartTimePicker = ({ value, onChange, label = "Departure Time", minDate, maxDate }: SmartTimePickerProps) => {
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isNow, setIsNow] = useState(true);

  // Initialize with current time
  useEffect(() => {
    if (!value) {
      const now = new Date();
      onChange(now.toISOString());
      setIsNow(true);
    }
  }, [value, onChange]);

  // Generate quick time options (next few hours)
  const generateQuickTimes = () => {
    const times = [];
    const now = new Date();
    
    // Add "Now" option
    times.push({
      value: now.toISOString(),
      label: 'Now',
      description: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    });
    
    // Add next 6 hours in 30-minute intervals
    for (let i = 1; i <= 12; i++) {
      const time = new Date(now);
      time.setMinutes(time.getMinutes() + (i * 30));
      
      const isToday = time.toDateString() === now.toDateString();
      times.push({
        value: time.toISOString(),
        label: isToday ? 
          time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) :
          `Tomorrow ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        description: isToday ? 'Today' : 'Tomorrow'
      });
    }
    
    return times;
  };

  // Generate date options (next 7 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : 
               i === 1 ? 'Tomorrow' : 
               date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    
    return dates;
  };

  // Generate time options for selected date
  const generateTimeOptions = () => {
    const times = [];
    const selectedDateObj = new Date(selectedDate);
    const now = new Date();
    const isToday = selectedDateObj.toDateString() === now.toDateString();
    
    // Start from 5 AM or current hour (whichever is later)
    const startHour = isToday ? Math.max(5, now.getHours()) : 5;
    const startMinute = isToday && now.getHours() === startHour ? 
      Math.ceil(now.getMinutes() / 30) * 30 : 0;
    
    for (let hour = startHour; hour <= 23; hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
        const time = new Date(selectedDateObj);
        time.setHours(hour, minute, 0, 0);
        
        // Skip if time is in the past
        if (time <= now) continue;
        
        times.push({
          value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          label: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        });
      }
    }
    
    return times;
  };

  const handleQuickTimeSelect = (isoString: string) => {
    onChange(isoString);
    setIsNow(isoString === generateQuickTimes()[0].value);
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      onChange(scheduledTime.toISOString());
      setIsNow(false);
      setIsSchedulingOpen(false);
    }
  };

  const formatSelectedTime = () => {
    if (!value) return 'Select time';
    
    const isoString = typeof value === 'string' ? value : value.toISOString();
    const time = new Date(isoString);
    const now = new Date();
    
    if (isNow && Math.abs(time.getTime() - now.getTime()) < 60000) {
      return 'Now';
    }
    
    const isToday = time.toDateString() === now.toDateString();
    const isTomorrow = time.toDateString() === new Date(now.getTime() + 24*60*60*1000).toDateString();
    
    if (isToday) {
      return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (isTomorrow) {
      return `Tomorrow ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return time.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const quickTimes = generateQuickTimes();
  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4" />
        {label}
      </div>
      
      {/* Selected Time Display */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{formatSelectedTime()}</div>
              <div className="text-sm text-gray-500">
                {isNow ? 'Leaving immediately' : 'Scheduled departure'}
              </div>
            </div>
            <div className="flex gap-2">
              {!isNow && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickTimeSelect(new Date().toISOString())}
                >
                  Change to Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Time Options */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Quick Options</div>
        <div className="grid grid-cols-2 gap-2">
          {quickTimes.slice(0, 6).map((time) => (
            <Button
              key={time.value}
              variant={typeof value === 'string' ? (value === time.value ? "default" : "outline") : "outline"}
              size="sm"
              onClick={() => handleQuickTimeSelect(time.value)}
              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{time.label}</div>
                <div className="text-xs opacity-70">{time.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Schedule for Later */}
      <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule for Later
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Your Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsSchedulingOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Schedule Trip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 