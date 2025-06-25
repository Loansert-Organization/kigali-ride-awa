
import React from 'react';

interface BookingSummaryProps {
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  scheduledTime: string;
  customTime: string;
  comments: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  fromLocation,
  toLocation,
  vehicleType,
  scheduledTime,
  customTime,
  comments
}) => {
  const getTimeDisplay = () => {
    switch (scheduledTime) {
      case 'now':
        return 'Now';
      case 'custom':
        return new Date(customTime).toLocaleString();
      case 'in15':
        return 'In 15 minutes';
      case 'in30':
        return 'In 30 minutes';
      case 'in1h':
        return 'In 1 hour';
      default:
        return scheduledTime;
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 p-4 rounded-lg border">
      <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
      <div className="space-y-2 text-sm">
        <div><strong>From:</strong> {fromLocation}</div>
        <div><strong>To:</strong> {toLocation}</div>
        <div><strong>Vehicle:</strong> {vehicleType}</div>
        <div><strong>Time:</strong> {getTimeDisplay()}</div>
        {comments && <div><strong>Notes:</strong> {comments}</div>}
      </div>
    </div>
  );
};

export default BookingSummary;
