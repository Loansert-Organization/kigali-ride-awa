
import React from 'react';

interface ValidationMessageProps {
  canCreateTrip: boolean;
  fromLocation: string;
  toLocation: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  canCreateTrip,
  fromLocation,
  toLocation
}) => {
  if (canCreateTrip) return null;

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-gray-500">
        Please complete the following:
      </p>
      <div className="text-xs text-gray-400 space-y-1">
        {!fromLocation && <p>• Enter starting location</p>}
        {!toLocation && <p>• Enter destination</p>}
      </div>
    </div>
  );
};

export default ValidationMessage;
