
import React from 'react';
import { SmartMap } from './SmartMap';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  name: string;
  vehicleType: string;
}

interface LiveDriversMapProps {
  drivers: Driver[];
  center?: { lat: number; lng: number };
  onDriverSelect?: (driver: Driver) => void;
}

const LiveDriversMap: React.FC<LiveDriversMapProps> = ({
  drivers,
  center,
  onDriverSelect
}) => {
  const markers = drivers.map(driver => ({
    lat: driver.lat,
    lng: driver.lng,
    title: `${driver.name} - ${driver.vehicleType}`,
    type: 'driver' as const
  }));

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    // Find the nearest driver to the clicked location
    const nearestDriver = drivers.reduce((nearest, driver) => {
      const distance = Math.sqrt(
        Math.pow(driver.lat - location.lat, 2) + 
        Math.pow(driver.lng - location.lng, 2)
      );
      return !nearest || distance < nearest.distance 
        ? { driver, distance }
        : nearest;
    }, null as { driver: Driver; distance: number } | null);

    if (nearestDriver && onDriverSelect) {
      onDriverSelect(nearestDriver.driver);
    }
  };

  return (
    <SmartMap
      center={center}
      markers={markers}
      onLocationSelect={handleLocationSelect}
      className="w-full h-80"
    />
  );
};

export default LiveDriversMap;
