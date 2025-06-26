
/* ──────────────────────────────────────────────────────────────
   1. Driver presence with location data (for online drivers)
   ────────────────────────────────────────────────────────────── */
DROP VIEW IF EXISTS public.driver_presence_map CASCADE;
CREATE VIEW public.driver_presence_map AS
SELECT
  driver_id as id,
  lat,
  lng,
  is_online
FROM public.driver_presence
WHERE is_online = true AND lat IS NOT NULL AND lng IS NOT NULL;

/* ──────────────────────────────────────────────────────────────
   2. Future driver trips
   ────────────────────────────────────────────────────────────── */
DROP VIEW IF EXISTS public.driver_trips_map CASCADE;
CREATE VIEW public.driver_trips_map AS
SELECT
  id,
  from_location,
  to_location,
  from_lat as lat,
  from_lng as lng,
  scheduled_time
FROM public.trips
WHERE role = 'driver' 
  AND scheduled_time > now() 
  AND from_lat IS NOT NULL 
  AND from_lng IS NOT NULL;

/* ──────────────────────────────────────────────────────────────
   3. Public promo codes
   ────────────────────────────────────────────────────────────── */
DROP VIEW IF EXISTS public.public_user_codes CASCADE;
CREATE VIEW public.public_user_codes AS
SELECT id, promo_code
FROM public.users
WHERE promo_code IS NOT NULL;
