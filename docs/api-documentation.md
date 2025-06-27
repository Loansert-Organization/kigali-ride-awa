# Kigali Ride AWA - API Documentation

## Overview

The Kigali Ride AWA API is built on Supabase Edge Functions and provides a comprehensive set of endpoints for managing ride-sharing operations. All API calls are made through the unified `APIClient` service.

## Authentication

### Endpoints

#### Send OTP
```typescript
apiClient.auth.sendOTP(phoneNumber: string)
```
Sends a one-time password to the specified phone number via WhatsApp.

**Parameters:**
- `phoneNumber` (string): Phone number in international format (e.g., "+250788123456")

**Response:**
```typescript
{
  success: boolean;
  data?: { messageId: string };
  error?: string;
}
```

#### Verify OTP
```typescript
apiClient.auth.verifyOTP(phoneNumber: string, otpCode: string)
```
Verifies the OTP code and creates/updates user session.

**Parameters:**
- `phoneNumber` (string): Phone number that received the OTP
- `otpCode` (string): 6-digit OTP code

**Response:**
```typescript
{
  success: boolean;
  data?: {
    user: UserProfile;
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
  error?: string;
}
```

#### Create/Update User Profile
```typescript
apiClient.auth.createOrUpdateProfile(profileData: Partial<UserProfile>)
```
Creates or updates user profile information.

**Parameters:**
```typescript
{
  phone_number?: string;
  role?: 'passenger' | 'driver';
  language?: string;
  location_enabled?: boolean;
  notifications_enabled?: boolean;
  // ... other UserProfile fields
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: UserProfile;
  error?: string;
}
```

## Trip Management

### Endpoints

#### Create Trip
```typescript
apiClient.trips.create(tripData: Partial<TripData>)
```
Creates a new trip (driver functionality).

**Parameters:**
```typescript
{
  origin: string;
  destination: string;
  origin_latitude?: number;
  origin_longitude?: number;
  destination_latitude?: number;
  destination_longitude?: number;
  departure_time: string; // ISO 8601 format
  available_seats: number;
  fare: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: TripData;
  error?: string;
}
```

#### Get Nearby Trips
```typescript
apiClient.trips.getNearby(location: { lat: number; lng: number }, radius?: number)
```
Fetches trips near a specific location.

**Parameters:**
- `location` (object): Coordinates with `lat` and `lng`
- `radius` (number, optional): Search radius in kilometers (default: 5)

**Response:**
```typescript
{
  success: boolean;
  data?: TripData[];
  error?: string;
}
```

#### Match Trips
```typescript
apiClient.trips.match(passengerTripId: string, driverTripId?: string)
```
Matches a passenger request with a driver's trip.

**Parameters:**
- `passengerTripId` (string): ID of the passenger's trip request
- `driverTripId` (string, optional): ID of the driver's trip to match with

**Response:**
```typescript
{
  success: boolean;
  data?: {
    match: {
      id: string;
      trip_id: string;
      driver_id: string;
      passenger_id: string;
      status: string;
    };
  };
  error?: string;
}
```

#### Smart Match
```typescript
apiClient.trips.smartMatch(passengerTripId: string, options?: { maxDistance?: number; maxTimeDiff?: number })
```
Uses AI to find optimal trip matches.

**Parameters:**
- `passengerTripId` (string): ID of the passenger's trip request
- `options` (object, optional):
  - `maxDistance` (number): Maximum distance deviation in km (default: 5)
  - `maxTimeDiff` (number): Maximum time difference in minutes (default: 30)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    matches: TripData[];
    matchCount: number;
  };
  error?: string;
}
```

## Driver Management

### Endpoints

#### Get Live Drivers
```typescript
apiClient.drivers.getLive(bounds?: { north: number; south: number; east: number; west: number })
```
Fetches currently online drivers within specified bounds.

**Parameters:**
- `bounds` (object, optional): Geographic bounds
  - `north`, `south`, `east`, `west` (numbers): Latitude/longitude boundaries

**Response:**
```typescript
{
  success: boolean;
  data?: DriverProfile[];
  error?: string;
}
```

#### Update Driver Status
```typescript
apiClient.drivers.updateStatus(driverId: string, isOnline: boolean)
```
Updates driver's online/offline status.

**Parameters:**
- `driverId` (string): Driver's unique identifier
- `isOnline` (boolean): Online status

**Response:**
```typescript
{
  success: boolean;
  data?: { success: boolean };
  error?: string;
}
```

## Notifications

### Endpoints

#### Send Push Notification
```typescript
apiClient.notifications.sendPush(notification: PushNotificationPayload & { userId: string })
```
Sends a push notification to a specific user.

**Parameters:**
```typescript
{
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: { success: boolean };
  error?: string;
}
```

#### Send WhatsApp Message
```typescript
apiClient.notifications.sendWhatsApp(phoneNumber: string, message: string, templateName?: string)
```
Sends a WhatsApp message using templates.

**Parameters:**
- `phoneNumber` (string): Recipient's phone number
- `message` (string): Message content
- `templateName` (string, optional): WhatsApp template name

**Response:**
```typescript
{
  success: boolean;
  data?: { messageId: string };
  error?: string;
}
```

## AI Assistant

### Endpoints

#### Generate Code
```typescript
apiClient.ai.generateCode(prompt: string, context?: string)
```
Generates code based on natural language prompt.

**Parameters:**
- `prompt` (string): Description of what code to generate
- `context` (string, optional): Additional context (e.g., "React component")

**Response:**
```typescript
{
  success: boolean;
  data?: {
    code: string;
    explanation: string;
  };
  error?: string;
}
```

#### Fix Code
```typescript
apiClient.ai.fixCode(code: string, error: string)
```
Fixes code based on error message.

**Parameters:**
- `code` (string): The code with errors
- `error` (string): Error message or description

**Response:**
```typescript
{
  success: boolean;
  data?: {
    fixedCode: string;
    explanation: string;
  };
  error?: string;
}
```

#### Localize Text
```typescript
apiClient.ai.localize(text: string, targetLanguage: string)
```
Translates text to target language.

**Parameters:**
- `text` (string): Text to translate
- `targetLanguage` (string): Target language code (e.g., "fr", "rw")

**Response:**
```typescript
{
  success: boolean;
  data?: {
    translatedText: string;
  };
  error?: string;
}
```

## Admin Functions

### Endpoints

#### Get App Configuration
```typescript
apiClient.admin.getConfig()
```
Fetches application configuration.

**Response:**
```typescript
{
  success: boolean;
  data?: {
    config: Record<string, unknown>;
  };
  error?: string;
}
```

#### Validate Referral Code
```typescript
apiClient.admin.validateReferral(referralCode: string, userId: string)
```
Validates and applies referral code.

**Parameters:**
- `referralCode` (string): The referral code to validate
- `userId` (string): User applying the code

**Response:**
```typescript
{
  success: boolean;
  data?: {
    valid: boolean;
    points: number;
  };
  error?: string;
}
```

#### Submit Incident Report
```typescript
apiClient.admin.submitIncident(report: { type: string; message: string; tripId?: string })
```
Submits an incident or feedback report.

**Parameters:**
```typescript
{
  type: string; // 'feedback' | 'safety' | 'payment' | 'driver' | 'app' | 'other'
  message: string;
  tripId?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    reportId: string;
  };
  error?: string;
}
```

## Utility Functions

### Endpoints

#### Reverse Geocode
```typescript
apiClient.utils.reverseGeocode(lat: number, lng: number)
```
Converts coordinates to human-readable address.

**Parameters:**
- `lat` (number): Latitude
- `lng` (number): Longitude

**Response:**
```typescript
{
  success: boolean;
  data?: {
    address: string;
    placeId: string;
  };
  error?: string;
}
```

#### Get Map Signature
```typescript
apiClient.utils.getMapSignature(params: Record<string, unknown>)
```
Generates signed URL for Google Maps Static API.

**Parameters:**
- `params` (object): Map parameters (size, markers, etc.)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}
```

## Error Handling

All API responses follow a consistent format:

```typescript
interface EdgeFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Common Error Codes

- `NETWORK_ERROR`: Network connectivity issues
- `AUTH_ERROR`: Authentication/authorization failure
- `VALIDATION_ERROR`: Invalid input parameters
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Trip endpoints**: 30 requests per minute per user
- **AI endpoints**: 10 requests per minute per user
- **Other endpoints**: 60 requests per minute per user

## Best Practices

1. **Always check response.success** before accessing data
2. **Handle errors gracefully** with user-friendly messages
3. **Use TypeScript types** for type safety
4. **Cache responses** when appropriate (React Query recommended)
5. **Implement retry logic** for network failures
6. **Validate inputs** before making API calls

## Example Usage

```typescript
import { apiClient } from '@/services/api/APIClient';

// Create a trip
const createTrip = async () => {
  const result = await apiClient.trips.create({
    origin: 'Kigali City Center',
    destination: 'Kimironko Market',
    departure_time: new Date().toISOString(),
    available_seats: 3,
    fare: 2500
  });

  if (result.success) {
    console.log('Trip created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};

// With error handling
try {
  const { success, data, error } = await apiClient.auth.sendOTP('+250788123456');
  
  if (success) {
    // Handle success
  } else {
    // Handle API error
    showError(error || 'Failed to send OTP');
  }
} catch (error) {
  // Handle network/unexpected errors
  showError('Network error. Please try again.');
}
``` 