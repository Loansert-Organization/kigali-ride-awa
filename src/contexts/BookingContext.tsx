import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TripData, BookingData, MapLocation } from '@/types/api';

// Booking state types
interface BookingState {
  // Trip details
  origin: string;
  destination: string;
  originLocation?: MapLocation;
  destinationLocation?: MapLocation;
  
  // Timing
  date: string;
  time: string;
  isImmediate: boolean;
  
  // Vehicle & preferences
  vehicleType: 'sedan' | 'suv' | 'minivan';
  seats: number;
  
  // Pricing
  estimatedFare?: number;
  paymentMethod: 'cash' | 'mobile_money';
  
  // Status
  status: 'idle' | 'searching' | 'matched' | 'confirmed' | 'cancelled';
  matchedTrip?: TripData;
  booking?: BookingData;
  
  // UI state
  currentStep: number;
  isLoading: boolean;
  error?: string;
}

// Action types
type BookingAction =
  | { type: 'SET_LOCATIONS'; payload: { origin: string; destination: string; originLocation?: MapLocation; destinationLocation?: MapLocation } }
  | { type: 'SET_TIMING'; payload: { date: string; time: string; isImmediate: boolean } }
  | { type: 'SET_VEHICLE'; payload: { vehicleType: BookingState['vehicleType']; seats: number } }
  | { type: 'SET_PAYMENT'; payload: { paymentMethod: BookingState['paymentMethod']; estimatedFare?: number } }
  | { type: 'SET_STATUS'; payload: BookingState['status'] }
  | { type: 'SET_MATCHED_TRIP'; payload: TripData }
  | { type: 'SET_BOOKING'; payload: BookingData }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'RESET' };

// Initial state
const initialState: BookingState = {
  origin: '',
  destination: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  isImmediate: true,
  vehicleType: 'sedan',
  seats: 1,
  paymentMethod: 'cash',
  status: 'idle',
  currentStep: 0,
  isLoading: false
};

// Reducer
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_LOCATIONS':
      return {
        ...state,
        origin: action.payload.origin,
        destination: action.payload.destination,
        originLocation: action.payload.originLocation,
        destinationLocation: action.payload.destinationLocation
      };
      
    case 'SET_TIMING':
      return {
        ...state,
        date: action.payload.date,
        time: action.payload.time,
        isImmediate: action.payload.isImmediate
      };
      
    case 'SET_VEHICLE':
      return {
        ...state,
        vehicleType: action.payload.vehicleType,
        seats: action.payload.seats
      };
      
    case 'SET_PAYMENT':
      return {
        ...state,
        paymentMethod: action.payload.paymentMethod,
        estimatedFare: action.payload.estimatedFare
      };
      
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        error: action.payload === 'cancelled' ? undefined : state.error
      };
      
    case 'SET_MATCHED_TRIP':
      return {
        ...state,
        matchedTrip: action.payload,
        status: 'matched'
      };
      
    case 'SET_BOOKING':
      return {
        ...state,
        booking: action.payload,
        status: 'confirmed'
      };
      
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
      
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 4)
      };
      
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

// Context type
interface BookingContextType {
  state: BookingState;
  actions: {
    setLocations: (locations: { origin: string; destination: string; originLocation?: MapLocation; destinationLocation?: MapLocation }) => void;
    setTiming: (timing: { date: string; time: string; isImmediate: boolean }) => void;
    setVehicle: (vehicle: { vehicleType: BookingState['vehicleType']; seats: number }) => void;
    setPayment: (payment: { paymentMethod: BookingState['paymentMethod']; estimatedFare?: number }) => void;
    setStatus: (status: BookingState['status']) => void;
    setMatchedTrip: (trip: TripData) => void;
    setBooking: (booking: BookingData) => void;
    nextStep: () => void;
    previousStep: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
    reset: () => void;
  };
}

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const actions = {
    setLocations: (locations: { origin: string; destination: string; originLocation?: MapLocation; destinationLocation?: MapLocation }) => {
      dispatch({ type: 'SET_LOCATIONS', payload: locations });
    },
    
    setTiming: (timing: { date: string; time: string; isImmediate: boolean }) => {
      dispatch({ type: 'SET_TIMING', payload: timing });
    },
    
    setVehicle: (vehicle: { vehicleType: BookingState['vehicleType']; seats: number }) => {
      dispatch({ type: 'SET_VEHICLE', payload: vehicle });
    },
    
    setPayment: (payment: { paymentMethod: BookingState['paymentMethod']; estimatedFare?: number }) => {
      dispatch({ type: 'SET_PAYMENT', payload: payment });
    },
    
    setStatus: (status: BookingState['status']) => {
      dispatch({ type: 'SET_STATUS', payload: status });
    },
    
    setMatchedTrip: (trip: TripData) => {
      dispatch({ type: 'SET_MATCHED_TRIP', payload: trip });
    },
    
    setBooking: (booking: BookingData) => {
      dispatch({ type: 'SET_BOOKING', payload: booking });
    },
    
    nextStep: () => {
      dispatch({ type: 'NEXT_STEP' });
    },
    
    previousStep: () => {
      dispatch({ type: 'PREVIOUS_STEP' });
    },
    
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    
    setError: (error: string | undefined) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    
    reset: () => {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <BookingContext.Provider value={{ state, actions }}>
      {children}
    </BookingContext.Provider>
  );
}

// Hook to use booking context
export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
} 