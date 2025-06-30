-- Kigali Ride AWA – Phase 1 (Users table + RLS)
-- Safe to run multiple times. If the users table already exists it
-- only ensures RLS / policies are present and records the migration.
-- Version tag: 20240726120000_core_users

BEGIN;

/* One-time migration history schema */
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version     text PRIMARY KEY,
  inserted_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

/* ------------------------------------------------------------------ */
DO $$
DECLARE
  tbl_exists  boolean;
BEGIN
  /* Already applied? */
  IF EXISTS (
      SELECT 1
      FROM   supabase_migrations.schema_migrations
      WHERE  version = '20240726120000_core_users')
  THEN
      RAISE NOTICE 'Phase 1 already recorded – nothing to do.';
      RETURN;
  END IF;

  /* Check if public.users exists */
  SELECT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN   pg_namespace n ON n.oid = c.relnamespace
      WHERE  n.nspname = 'public' AND c.relname = 'users' AND c.relkind = 'r')
  INTO tbl_exists;

  IF NOT tbl_exists THEN
      /* Table does NOT exist – create it */
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE public.users (
        id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        phone                varchar(20) UNIQUE,
        name                 varchar(100),
        role                 text CHECK (role IN ('passenger','driver','both')) DEFAULT 'passenger',
        country              varchar(2) DEFAULT 'RW',
        language             text CHECK (language IN ('en','kn','fr')) DEFAULT 'en',
        promo_code           text UNIQUE,
        onboarding_completed boolean DEFAULT false,
        created_at           timestamptz DEFAULT now(),
        updated_at           timestamptz DEFAULT now()
      );
  END IF;

  /* ---- RLS / policies (idempotent) ---- */
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  /* Create policy only if it does not already exist */
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_manage_own_row')
  THEN
      CREATE POLICY users_manage_own_row
        ON public.users
        USING      (auth.uid() = auth_user_id)
        WITH CHECK (auth.uid() = auth_user_id);
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_insert_own_row')
  THEN
      CREATE POLICY users_insert_own_row
        ON public.users
        FOR INSERT
        WITH CHECK (auth.uid() = auth_user_id);
  END IF;

  /* Record migration */
  INSERT INTO supabase_migrations.schema_migrations(version)
  VALUES ('20240726120000_core_users');

  RAISE NOTICE 'Phase 1 completed (users table verified, RLS/policies ensured).';
END $$;

COMMIT; 