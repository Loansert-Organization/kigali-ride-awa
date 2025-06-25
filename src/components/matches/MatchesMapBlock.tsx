
import React from 'react';
import TripMapView from '@/components/maps/TripMapView';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
}

interface MatchesMapBlockProps {
  passengerTrip: Trip;
  driverTrips: Trip[];
}

const MatchesMapBlock: React.FC<MatchesMapBlockProps> = ({
  passengerTrip,
  driverTrips
}) => {
  // Use coordinates if available, otherwise fallback to Kigali area with some offset
  const fromLocation = {
    lat: passengerTrip.from_lat || -1.9441,
    lng: passengerTrip.from_lng || 30.0619,
    address: passengerTrip.from_location
  };

  const toLocation = {
    lat: passengerTrip.to_lat || -1.9341,
    lng: passengerTrip.to_lng || 30.0719,
    address: passengerTrip.to_location
  };

  return (
    <div className="mx-4 mt-4">
      <TripMapView
        fromLocation={fromLocation}
        toLocation={toLocation}
        showRoute={true}
        showNavigationButton={false}
        height="250px"
        interactive={true}
      />
    </div>
  );
};

export default MatchesMapBlock;
