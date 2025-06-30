# Kigali Ride AWA - Database Migration Instructions

## Overview
Your project has 21 migration files that need to be applied to set up the complete database schema.

## Quick Method - Using Consolidated Files

1. **Go to Supabase SQL Editor**: https://supabase.com/dashboard/project/nireplgrlwhwppjtfxbb/sql/new

2. **Run migrations in this order:**
   - First run: `scripts/consolidated-migration.sql` (contains migrations 1-5)
   - Second run: `scripts/consolidated-migration-part2.sql` (contains migrations 6-10)
   - Then run each remaining migration file individually (see list below)

## Remaining Individual Migrations to Run

After running the consolidated files, run these migrations in order:

11. `supabase/migrations/20250625215428-cd3da499-a788-48f4-9b55-53a735fde8c3.sql` - Notifications and Alerts
12. `supabase/migrations/20250625222350-d0246534-3ec7-4c11-8feb-fabdeb18f550.sql` - Trip History Views
13. `supabase/migrations/20250625225126-1791d62d-f5b2-41bb-ad7e-e491e4e22b63.sql` - Analytics Tables
14. `supabase/migrations/20250625230052-cd465e40-a1ef-40c5-bad3-6c84eec6ace6.sql` - Admin Functions
15. `supabase/migrations/20250625232055-d3b98397-42a9-4fbc-89e2-139274d22dc5.sql` - Search Optimization
16. `supabase/migrations/20250625235917-6540272f-e996-47f3-b771-c211bf6651ac.sql` - Performance Indexes
17. `supabase/migrations/20250626012153-fcacfa58-fce6-47eb-ae19-d3225bd6b7ac.sql` - Security Enhancements
18. `supabase/migrations/20250626021448-1b72c7d9-d84c-4909-97fc-cc4259301aa2.sql` - API Views
19. `supabase/migrations/20250626043048-673b9fd5-68d2-40e7-b65e-07735d926ab1.sql` - Cleanup Functions
20. `supabase/migrations/20250626145346-aad23903-2a51-41a3-a00c-99a5897316b5.sql` - Final Optimizations
21. `supabase/migrations/20250626180359-d9106761-8a66-4ff1-bbd1-27d17d22e293.sql` - Production Settings

## How to Apply Each Migration

1. Open the SQL Editor
2. Copy the entire contents of the migration file
3. Paste into the SQL Editor
4. Click "Run"
5. Wait for success message
6. Move to the next file

## Verification

After all migrations are applied, run this query to verify:

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

You should see 21 entries if all migrations were applied successfully.

## What These Migrations Create

- **Core Tables**: users, trips, vehicles, messages
- **Trip Management**: driver_trips, passenger_requests, trip_matches
- **Points & Rewards**: user_points, rewards_catalog, referral_tracking
- **Messaging**: conversations, conversation_messages
- **AI Features**: ai_assistant_sessions, ai_assistant_messages, ai_usage
- **Notifications**: push_registrations, notification_preferences
- **Analytics**: trip_analytics, user_analytics
- **Security**: RLS policies, authentication functions
- **Performance**: Indexes, materialized views, search optimization

## Troubleshooting

If a migration fails:
1. Check if it was already partially applied
2. Look for the specific error message
3. The consolidated scripts check for existing migrations, so they're safe to re-run
4. Individual migration files may need manual checking if they fail

## Alternative: Using Supabase CLI

If you can resolve the password issue:
```bash
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.nireplgrlwhwppjtfxbb.supabase.co:5432/postgres"
```

Replace [YOUR_PASSWORD] with your actual database password from the Supabase dashboard. 