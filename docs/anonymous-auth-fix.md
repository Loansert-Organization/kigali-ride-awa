# Anonymous Authentication Fix Guide

## Current Issue

The application is experiencing a configuration conflict:
- ✅ Anonymous authentication is **enabled** (`anonymous_users: true`)
- ❌ User signups are **disabled** (`disable_signup: true`)

This prevents anonymous users from being created, resulting in a 422 error: "Signups not allowed for this instance"

## Immediate Fix Required

### Option 1: Enable Signups in Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/ldbzarwjnnsoyoengheg/auth/settings
2. Find "Allow new users to sign up" setting
3. **Enable** this option
4. Save changes

### Option 2: Use Supabase Management API

If you have access to the Supabase Management API, you can update the settings programmatically:

```bash
# You'll need your Supabase access token
curl -X PATCH https://api.supabase.com/v1/projects/ldbzarwjnnsoyoengheg/config/auth \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disable_signup": false
  }'
```

## Verification Steps

After enabling signups:

1. Test anonymous signup directly:
```bash
curl -X POST https://ldbzarwjnnsoyoengheg.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

2. Check the response - it should return a user object with session tokens

3. Test in the application:
   - Clear browser storage
   - Reload the app
   - Check console for "Anonymous sign-in successful"

## Current Auth Flow

```
1. App loads → No session found
2. Welcome.tsx attempts supabase.auth.signInAnonymously()
3. Supabase checks: anonymous_users=true ✓
4. Supabase checks: disable_signup=true ✗
5. Returns error: "Signups not allowed"
```

## Expected Auth Flow (After Fix)

```
1. App loads → No session found
2. Welcome.tsx attempts supabase.auth.signInAnonymously()
3. Supabase checks: anonymous_users=true ✓
4. Supabase checks: disable_signup=false ✓
5. Creates anonymous user and returns session
6. AuthContext receives user and creates profile
7. User can select role and continue
```

## Additional Considerations

### Security
- Anonymous users are temporary by design
- They should upgrade to authenticated accounts for data persistence
- RLS policies already handle anonymous user access

### Data Migration
- When anonymous users authenticate (via phone/email), their data should be preserved
- Migration function exists: `merge_anonymous_to_verified_user()`

### Testing
- Always test with cleared browser storage
- Check Network tab for 422 errors
- Monitor Console for auth state changes

## Troubleshooting

If issues persist after enabling signups:

1. **Check JWT expiration**: The anon key might be expired
2. **Verify project ID**: Ensure using correct Supabase project
3. **Clear all storage**: localStorage, sessionStorage, cookies
4. **Check RLS policies**: Ensure policies allow anonymous user creation

## Contact Support

If you cannot enable signups via dashboard:
- This might be a project-level restriction
- Contact Supabase support for assistance
- Mention you need anonymous auth with signups enabled 