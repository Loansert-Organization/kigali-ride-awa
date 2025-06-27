# Kigali Ride AWA - Component Guide

## Overview

This guide provides comprehensive documentation for all major components in the Kigali Ride AWA application. Components are organized by feature area and follow consistent patterns for props, state management, and styling.

## Component Organization

```
src/components/
├── admin/          # Admin dashboard components
├── ai/             # AI assistant components
├── auth/           # Authentication components
├── booking/        # Booking flow components
├── common/         # Shared components
├── driver/         # Driver-specific components
├── earnings/       # Earnings & financial components
├── favorites/      # Favorites management
├── maps/           # Map-related components
├── matches/        # Trip matching components
├── modals/         # Modal dialogs
├── navigation/     # Navigation components
├── passenger/      # Passenger-specific components
├── profile/        # Profile management
├── rewards/        # Rewards & referrals
├── settings/       # Settings components
├── trip/           # Trip creation/management
├── trips/          # Trip listing components
├── ui/             # Core UI components (shadcn/ui)
└── welcome/        # Onboarding components
```

## Core Components

### Authentication Components

#### PhoneInputOTP
Phone number input with OTP sending functionality.

```tsx
import { PhoneInputOTP } from '@/components';

<PhoneInputOTP
  onSuccess={(phoneNumber: string) => console.log('OTP sent to', phoneNumber)}
  onCancel={() => console.log('Cancelled')}
/>
```

**Props:**
- `onSuccess: (phoneNumber: string) => void` - Called when OTP is sent successfully
- `onCancel: () => void` - Called when user cancels

#### UnifiedWhatsAppOTP
Complete WhatsApp OTP authentication flow.

```tsx
import { UnifiedWhatsAppOTP } from '@/components';

<UnifiedWhatsAppOTP
  onSuccess={(session) => console.log('Authenticated', session)}
  onCancel={() => console.log('Cancelled')}
  className="max-w-md"
/>
```

**Props:**
- `onSuccess: (session: Session) => void` - Called on successful authentication
- `onCancel: () => void` - Called when cancelled
- `className?: string` - Additional CSS classes

### Booking Components

#### LocationInputBlock
Dual input for origin and destination with Google Places integration.

```tsx
import { LocationInputBlock } from '@/components';

<LocationInputBlock
  origin="Current Location"
  destination=""
  onOriginChange={(origin) => setOrigin(origin)}
  onDestinationChange={(destination) => setDestination(destination)}
/>
```

**Props:**
- `origin: string` - Current origin value
- `destination: string` - Current destination value
- `onOriginChange: (value: string) => void` - Origin change handler
- `onDestinationChange: (value: string) => void` - Destination change handler

**Features:**
- Google Places autocomplete
- Current location detection
- Location swap functionality

#### VehicleSelectBlock
Vehicle type and seat selection.

```tsx
import { VehicleSelectBlock } from '@/components';

<VehicleSelectBlock
  selectedType="sedan"
  seats={2}
  onTypeChange={(type) => setVehicleType(type)}
  onSeatsChange={(seats) => setSeats(seats)}
/>
```

**Props:**
- `selectedType: 'sedan' | 'suv' | 'minivan'` - Selected vehicle type
- `seats: number` - Number of seats
- `onTypeChange: (type: string) => void` - Vehicle type change handler
- `onSeatsChange: (seats: number) => void` - Seats change handler

#### BookingSummary
Summary card for booking details.

```tsx
import { BookingSummary } from '@/components';

<BookingSummary
  origin="Kigali City Center"
  destination="Kimironko Market"
  date="2024-12-25"
  time="14:30"
  vehicleType="sedan"
  seats={2}
  estimatedFare={2500}
/>
```

**Props:**
- `origin: string` - Trip origin
- `destination: string` - Trip destination
- `date: string` - Trip date
- `time: string` - Trip time
- `vehicleType: string` - Vehicle type
- `seats: number` - Number of seats
- `estimatedFare?: number` - Estimated fare

### Map Components

#### LocationPicker
Interactive map for selecting locations.

```tsx
import { LocationPicker } from '@/components';

<LocationPicker
  onLocationSelect={(location) => {
    console.log('Selected:', location);
    // { lat: -1.9536, lng: 30.0606, address: "Kigali, Rwanda" }
  }}
  initialLocation={{ lat: -1.9536, lng: 30.0606 }}
  placeholder="Search for a location"
  height="400px"
/>
```

**Props:**
- `onLocationSelect: (location: MapLocation) => void` - Location selection handler
- `initialLocation?: { lat: number; lng: number }` - Initial map center
- `placeholder?: string` - Search input placeholder
- `height?: string` - Map container height

#### LiveDriversMap
Real-time map showing online drivers.

```tsx
import { LiveDriversMap } from '@/components';

<LiveDriversMap
  userLocation={{ lat: -1.9536, lng: 30.0606 }}
  onDriverClick={(driver) => console.log('Selected driver:', driver)}
  height="500px"
/>
```

**Props:**
- `userLocation?: { lat: number; lng: number }` - User's current location
- `onDriverClick?: (driver: DriverProfile) => void` - Driver marker click handler
- `height?: string` - Map container height

### Driver Components

#### DriverStatusSummary
Overview of driver's current status and statistics.

```tsx
import { DriverStatusSummary } from '@/components';

<DriverStatusSummary
  isOnline={true}
  todayTrips={5}
  todayEarnings={15000}
  rating={4.8}
/>
```

**Props:**
- `isOnline: boolean` - Driver's online status
- `todayTrips: number` - Number of trips today
- `todayEarnings: number` - Today's earnings
- `rating?: number` - Driver rating

#### OnlineToggleBlock
Toggle switch for driver online/offline status.

```tsx
import { OnlineToggleBlock } from '@/components';

<OnlineToggleBlock
  isOnline={isOnline}
  onToggle={(status) => setIsOnline(status)}
  isLoading={false}
/>
```

**Props:**
- `isOnline: boolean` - Current online status
- `onToggle: (status: boolean) => void` - Status change handler
- `isLoading?: boolean` - Loading state

#### PassengerRequestCard
Card displaying passenger trip request.

```tsx
import { PassengerRequestCard } from '@/components';

<PassengerRequestCard
  request={{
    id: 'req-123',
    passenger_name: 'John Doe',
    origin: 'CBD',
    destination: 'Airport',
    fare: 5000,
    seats: 2,
    departure_time: '14:30'
  }}
  onAccept={(id) => acceptRequest(id)}
  onDecline={(id) => declineRequest(id)}
/>
```

**Props:**
- `request: PassengerRequest` - Request details
- `onAccept: (id: string) => void` - Accept handler
- `onDecline: (id: string) => void` - Decline handler

### Trip Components

#### CreateTripProgressIndicator
Progress indicator for multi-step trip creation.

```tsx
import { CreateTripProgressIndicator } from '@/components';

<CreateTripProgressIndicator 
  currentStep={2}
  totalSteps={3}
/>
```

**Props:**
- `currentStep: number` - Current step (1-based)
- `totalSteps?: number` - Total number of steps (default: 3)

#### RouteInputBlock
Combined route and time input for trips.

```tsx
import { RouteInputBlock } from '@/components';

<RouteInputBlock
  origin="Kigali"
  destination="Huye"
  scheduledTime="14:30"
  onUpdate={(updates) => setTripData({ ...tripData, ...updates })}
/>
```

**Props:**
- `origin: string` - Trip origin
- `destination: string` - Trip destination
- `scheduledTime: string` - Scheduled departure time
- `onUpdate: (updates: Partial<TripData>) => void` - Update handler

#### FareInputBlock
Fare amount input with negotiable option.

```tsx
import { FareInputBlock } from '@/components';

<FareInputBlock
  fareAmount={2500}
  paymentMethod="cash"
  onUpdate={(updates) => setTripData({ ...tripData, ...updates })}
/>
```

**Props:**
- `fareAmount: number` - Fare amount
- `paymentMethod: 'cash' | 'mobile_money'` - Payment method
- `onUpdate: (updates: Partial<TripData>) => void` - Update handler

### Admin Components

#### KPIStatsCards
Key performance indicator cards for admin dashboard.

```tsx
import { KPIStatsCards } from '@/components';

<KPIStatsCards
  stats={{
    totalUsers: 1234,
    activeTrips: 45,
    totalRevenue: 2500000,
    systemHealth: 98
  }}
  isLoading={false}
/>
```

**Props:**
- `stats: DashboardStats` - KPI statistics
- `isLoading?: boolean` - Loading state

#### GlobalAdminSearch
Universal search component for admin panel.

```tsx
import { GlobalAdminSearch } from '@/components';

<GlobalAdminSearch
  onResultClick={(result) => navigateToResult(result)}
/>
```

**Props:**
- `onResultClick?: (result: SearchResult) => void` - Result click handler

## Context Providers

### BookingContext
Manages booking flow state with reducer pattern.

```tsx
import { BookingProvider, useBookingContext } from '@/contexts/BookingContext';

// Wrap your app
<BookingProvider>
  <App />
</BookingProvider>

// Use in components
const { state, actions } = useBookingContext();

// Available actions
actions.setLocations({ origin: 'A', destination: 'B' });
actions.setTiming({ date: '2024-12-25', time: '14:30', isImmediate: false });
actions.setVehicle({ vehicleType: 'suv', seats: 3 });
actions.setPayment({ paymentMethod: 'mobile_money', estimatedFare: 3500 });
actions.nextStep();
actions.previousStep();
actions.reset();
```

## UI Components (shadcn/ui)

The application uses shadcn/ui components as the foundation. Key components include:

- `Button` - Versatile button with variants
- `Card` - Container component with header/content sections
- `Dialog` - Modal dialog wrapper
- `Input` - Form input with validation support
- `Select` - Dropdown selection component
- `Toast` - Notification system
- `Tabs` - Tabbed interface
- `Badge` - Status indicators
- `Alert` - Alert messages
- `Switch` - Toggle switches

### Example Usage

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components';

<Card>
  <CardHeader>
    <CardTitle>Trip Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your trip information here</p>
    <Button variant="default" size="lg">
      Book Now
    </Button>
  </CardContent>
</Card>
```

## Styling Guidelines

1. **Use Tailwind CSS** for styling
2. **Follow mobile-first** responsive design
3. **Use component variants** instead of custom styles
4. **Maintain consistent spacing** (use Tailwind spacing scale)
5. **Follow color scheme** defined in tailwind.config.ts

## Best Practices

1. **Props Interface**: Always define TypeScript interfaces for props
2. **Default Props**: Provide sensible defaults
3. **Error Boundaries**: Wrap complex components
4. **Loading States**: Always handle loading states
5. **Accessibility**: Include ARIA labels and keyboard navigation
6. **Memoization**: Use React.memo for expensive components
7. **Testing**: Write tests for all interactive components

## Component Template

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  variant?: 'default' | 'secondary';
  onAction?: () => void;
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  variant = 'default',
  onAction,
  className
}) => {
  return (
    <div className={cn(
      'base-styles',
      variant === 'secondary' && 'variant-styles',
      className
    )}>
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
``` 