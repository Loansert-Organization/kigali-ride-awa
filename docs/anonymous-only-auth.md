# Anonymous-Only Authentication for Kigali Ride

## Overview

Kigali Ride uses **anonymous authentication only** - no sign-up or login required. Both passengers and drivers can use the app immediately without creating an account.

## How It Works

1. **First Visit**: 
   - User opens the app
   - App automatically creates an anonymous session
   - User selects their role (Passenger or Driver)
   - User can start using the app immediately

2. **Data Persistence**:
   - All user data is tied to their anonymous session
   - Data persists across app sessions
   - Users can optionally add phone number later for account recovery

3. **No Barriers**:
   - No email required
   - No password required
   - No phone verification required to start
   - Full app functionality available immediately

## Implementation Details

### Authentication Flow

```typescript
// In Welcome.tsx - Automatic anonymous sign-in
useEffect(() => {
  const signInAnonymously = async () => {
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      // User is automatically signed in
    }
  };
  signInAnonymously();
}, [user]);
```

### User Profile Creation

```typescript
// In AuthContext.tsx - Automatic profile creation
if (!profile) {
  const newProfile = {
    auth_user_id: authUser.id,
    role: null,
    auth_method: 'anonymous',
    // No personal info required
  };
  // Profile created automatically
}
```

### Role Selection

Users simply choose their role and start using the app:
- **Passenger**: Can immediately request rides
- **Driver**: Can add vehicle and start offering rides

## Database Schema

The `users` table supports anonymous users:
- `auth_user_id`: Links to Supabase auth
- `auth_method`: Set to 'anonymous'
- `phone_number`: Optional (can be added later)
- `role`: Selected during onboarding

## Benefits

1. **Instant Access**: Users can try the app without commitment
2. **Privacy First**: No personal information required
3. **Reduced Friction**: No sign-up forms or verification emails
4. **Higher Conversion**: Users more likely to try the app

## Optional Account Upgrade

Users can optionally:
- Add phone number for account recovery
- Add profile information
- Link social accounts
- But none of this is required to use the app

## Security Considerations

- Anonymous sessions are secure and isolated
- RLS policies ensure users can only access their own data
- Sessions persist in browser localStorage
- Optional phone verification for sensitive operations

## Configuration Requirements

In Supabase Dashboard:
1. **Enable Anonymous Sign-ins**: Auth → Settings → Enable anonymous sign-ins
2. **Allow Sign-ups**: Required for anonymous users to be created
3. **RLS Policies**: Already configured to support anonymous users

## Testing

1. Clear browser data
2. Visit the app
3. Should automatically sign in anonymously
4. Select role and start using the app
5. No sign-up or login required! 