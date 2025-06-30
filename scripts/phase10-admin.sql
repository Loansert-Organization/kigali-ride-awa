-- Kigali Ride AWA – Phase 10  (admin helpers)
-- Corrected function syntax (LANGUAGE after $$).
-- Version tag: 20240726120090_admin_helpers

BEGIN;

DO $$
DECLARE applied boolean;
BEGIN
  SELECT EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations
      WHERE  version = '20240726120090_admin_helpers')
  INTO applied;
  IF applied THEN
    RAISE NOTICE 'Phase 10 already recorded – skipping';
    RETURN;
  END IF;

  /* refresh_all_materialized_views() */
  CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
  RETURNS void
  AS $$
  DECLARE
    rec record;
  BEGIN
    FOR rec IN
      SELECT schemaname, matviewname
      FROM   pg_matviews
      WHERE  schemaname = 'public'
    LOOP
      EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I.%I',
                     rec.schemaname, rec.matviewname);
    END LOOP;
  END;
  $$ LANGUAGE plpgsql;

  /* expire_old_passenger_requests() */
  CREATE OR REPLACE FUNCTION public.expire_old_passenger_requests(hours int DEFAULT 24)
  RETURNS int
  AS $$
  DECLARE
    affected int;
  BEGIN
    UPDATE public.trips_wizard
    SET    status     = 'cancelled',
           updated_at = now()
    WHERE  role        = 'passenger'
      AND  status      = 'active'
      AND  departure_time < (now() - make_interval(hours => hours));

    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
  END;
  $$ LANGUAGE plpgsql;

  INSERT INTO supabase_migrations.schema_migrations(version)
  VALUES ('20240726120090_admin_helpers');

  RAISE NOTICE 'Phase 10 completed successfully';
END $$;

COMMIT; 