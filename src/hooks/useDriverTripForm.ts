import { useState } from 'react';
import { MapLocation, VehicleType } from '@/types';

export interface DriverTripFormState {
  from: MapLocation | null;
  to: MapLocation | null;
  departureTime: string;
  vehicleType: VehicleType | null;
  availableSeats: number;
  farePerSeat: number;
}

export const useDriverTripForm = () => {
  const [formState, setFormState] = useState<DriverTripFormState>({
    from: null,
    to: null,
    departureTime: new Date().toISOString().slice(0, 16),
    vehicleType: null,
    availableSeats: 1,
    farePerSeat: 1000,
  });

  const updateField = (
    field: keyof DriverTripFormState,
    value: MapLocation | string | number | VehicleType | null
  ) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  const resetForm = () => {
    setFormState({
      from: null,
      to: null,
      departureTime: new Date().toISOString().slice(0, 16),
      vehicleType: null,
      availableSeats: 1,
      farePerSeat: 1000,
    });
  };

  return {
    formState,
    updateField,
    resetForm,
    isValid: !!formState.from && !!formState.to && !!formState.vehicleType,
  };
}; 