
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TripSummaryBlockProps {
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
}

const TripSummaryBlock: React.FC<TripSummaryBlockProps> = ({
  fromLocation,
  toLocation,
  scheduledTime
}) => {
  const timeFromNow = formatDistanceToNow(new Date(scheduledTime), { addSuffix: true });
  const isToday = new Date(scheduledTime).toDateString() === new Date().toDateString();
  const timeDisplay = isToday ? 
    `${new Date(scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} Today` :
    new Date(scheduledTime).toLocaleDateString('en-US', { 
      weekday: 'short', 
      hour: 'numeric', 
      minute: '2-digit' 
    });

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {/* Route */}
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-0.5 h-8 bg-gray-300"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-gray-900">{fromLocation}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-gray-900">{toLocation}</span>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-800">{timeDisplay}</span>
        <span className="text-sm text-gray-500">({timeFromNow})</span>
      </div>
    </div>
  );
};

export default TripSummaryBlock;
