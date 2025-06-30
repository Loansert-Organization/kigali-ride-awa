import { useState } from 'react';
import { MapLocation } from '@/types';

export interface PassengerRequestFormState {
  from: MapLocation | null;
  to: MapLocation | null;
  departureTime: string;
}

export const usePassengerRequestForm = () => {
  const [formState, setFormState] = useState<PassengerRequestFormState>({
    from: null,
    to: null,
    departureTime: new Date().toISOString().slice(0, 16),
  });

  const updateField = (
    field: keyof PassengerRequestFormState,
    value: MapLocation | string | null
  ) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  const resetForm = () => {
    setFormState({
      from: null,
      to: null,
      departureTime: new Date().toISOString().slice(0, 16),
    });
  };

  return {
    formState,
    updateField,
    resetForm,
    isValid: !!formState.from && !!formState.to,
  };
}; 