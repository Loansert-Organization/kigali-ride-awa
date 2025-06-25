
import React from 'react';
import LiveDriversMap from '@/components/maps/LiveDriversMap';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  vehicle_type: string;
  is_online: boolean;
  name?: string;
}

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
  fare?: number;
}

interface MapBlockProps {
  currentLocation: {lat: number, lng: number} | null;
  nearbyDrivers: Driver[];
  openDriverTrips: Trip[];
}

const MapBlock: React.FC<MapBlockProps> = ({
  currentLocation,
  nearbyDrivers,
  openDriverTrips
}) => {
  const handleDriverSelect = (driver: Driver) => {
    console.log('Driver selected:', driver);
    // TODO: Show driver details modal or navigate to booking with driver pre-selected
  };

  return (
    <LiveDriversMap
      drivers={nearbyDrivers}
      currentLocation={currentLocation}
      onDriverSelect={handleDriverSelect}
      height="320px"
      showControls={true}
    />
  );
};

export default MapBlock;
