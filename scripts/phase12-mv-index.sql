-- Kigali Ride AWA – Phase 12  (MV index for concurrent refresh)
-- Adds a UNIQUE index on mv_top_locations(location) so CONCURRENTLY
-- refresh works without blocking.
-- Version tag: 20240726120110_mv_index

BEGIN;

DO $$
BEGIN
  IF EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations
      WHERE  version = '20240726120110_mv_index')
  THEN
    RAISE NOTICE 'Phase 12 already recorded – skipping';
    RETURN;
  END IF;

  -- create unique index only if not exists
  CREATE UNIQUE INDEX IF NOT EXISTS mv_top_locations_location_idx
    ON public.mv_top_locations (location);

  INSERT INTO supabase_migrations.schema_migrations(version)
  VALUES ('20240726120110_mv_index');

  RAISE NOTICE 'Phase 12 completed: unique index added to mv_top_locations';
END $$;

COMMIT; 