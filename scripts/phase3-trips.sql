-- Kigali Ride AWA – Phase 3  (trip-wizard core)
-- Creates trips_wizard, trip_matches_wizard, locations_cache,
-- adds indexes, enables RLS, adds policies.
-- Idempotent via TRY-CREATE pattern (catches duplicate_object).
-- Version tag: 20240726120020_trip_wizard_core

BEGIN;

DO $$
DECLARE already boolean;
BEGIN
  /* skip if already applied */
  SELECT EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations
      WHERE  version = '20240726120020_trip_wizard_core')
  INTO already;
  IF already THEN
      RAISE NOTICE 'Phase 3 already recorded – skipping';
      RETURN;
  END IF;

  -- 1 ░░░  tables  ░░░
  CREATE TABLE IF NOT EXISTS public.trips_wizard (
      id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      role                 text NOT NULL CHECK (role IN ('driver','passenger')),
      origin_text          text NOT NULL,
      destination_text     text NOT NULL,
      origin_location      geography(point,4326) NOT NULL,
      destination_location geography(point,4326) NOT NULL,
      departure_time       timestamptz NOT NULL,
      seats                integer,
      vehicle_type         text,
      price                numeric(10,2),
      status               text DEFAULT 'active' CHECK (status IN ('active','matched','cancelled','completed')),
      created_at           timestamptz DEFAULT now(),
      updated_at           timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.trip_matches_wizard (
      id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      driver_trip_id    uuid REFERENCES public.trips_wizard(id) ON DELETE CASCADE,
      passenger_trip_id uuid REFERENCES public.trips_wizard(id) ON DELETE CASCADE,
      match_score       numeric(5,2),
      status            text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
      created_at        timestamptz DEFAULT now(),
      UNIQUE(driver_trip_id, passenger_trip_id)
  );

  CREATE TABLE IF NOT EXISTS public.locations_cache (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      place_id   text UNIQUE NOT NULL,
      name       text NOT NULL,
      address    text NOT NULL,
      location   geography(point,4326) NOT NULL,
      country    text,
      created_at timestamptz DEFAULT now()
  );

  -- 2 ░░░  indexes  ░░░
  CREATE INDEX IF NOT EXISTS idx_tw_user   ON public.trips_wizard(user_id);
  CREATE INDEX IF NOT EXISTS idx_tw_status ON public.trips_wizard(status);
  CREATE INDEX IF NOT EXISTS idx_tw_dep    ON public.trips_wizard(departure_time);
  CREATE INDEX IF NOT EXISTS idx_tw_orig   ON public.trips_wizard USING gist(origin_location);
  CREATE INDEX IF NOT EXISTS idx_tw_dest   ON public.trips_wizard USING gist(destination_location);

  CREATE INDEX IF NOT EXISTS idx_tm_driver    ON public.trip_matches_wizard(driver_trip_id);
  CREATE INDEX IF NOT EXISTS idx_tm_passenger ON public.trip_matches_wizard(passenger_trip_id);

  CREATE INDEX IF NOT EXISTS idx_loc_geo ON public.locations_cache USING gist(location);

  -- 3 ░░░  RLS enable  ░░░
  ALTER TABLE public.trips_wizard        ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.trip_matches_wizard ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.locations_cache     ENABLE ROW LEVEL SECURITY;

  -- 4 ░░░  policies  ░░░ (use exception block to ignore duplicates) 
  BEGIN
    CREATE POLICY tw_owner_manage ON public.trips_wizard
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    CREATE POLICY tw_select_active ON public.trips_wizard
      FOR SELECT USING (status = 'active');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    CREATE POLICY tm_participants_view ON public.trip_matches_wizard
      FOR SELECT USING (
        auth.uid() IN (
          SELECT user_id FROM public.trips_wizard t WHERE t.id = driver_trip_id
          UNION
          SELECT user_id FROM public.trips_wizard t WHERE t.id = passenger_trip_id));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    CREATE POLICY locations_public_read ON public.locations_cache
      FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- 5 ░░░ record migration  ░░░
  INSERT INTO supabase_migrations.schema_migrations(version)
  VALUES ('20240726120020_trip_wizard_core');

  RAISE NOTICE 'Phase 3 completed successfully';
END $$;

COMMIT; 