-- Trip Wizard Schema Migration
-- Implements the unified trip creation system as specified

-- ============================================================================
-- 1. CORE ENUMS
-- ============================================================================

-- Trip role enum  
CREATE TYPE public.trip_role AS ENUM ('driver', 'passenger');

-- Trip status enum
CREATE TYPE public.trip_status_new AS ENUM ('open', 'matched', 'closed');

-- Trip match status enum
CREATE TYPE public.trip_match_status_new AS ENUM ('pending', 'confirmed', 'cancelled');

-- Vehicle type enum
CREATE TYPE public.vehicle_type_new AS ENUM ('moto', 'car', 'tuktuk', 'minibus');

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Unified trips table (both driver and passenger trips)
CREATE TABLE IF NOT EXISTS public.trips_wizard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role public.trip_role NOT NULL,
  
  -- Origin location
  origin_geom GEOGRAPHY(Point),
  origin_text TEXT NOT NULL,
  
  -- Destination location  
  dest_geom GEOGRAPHY(Point),
  dest_text TEXT NOT NULL,
  
  -- Trip details
  seats_offered INTEGER, -- For drivers
  seats_needed INTEGER,  -- For passengers
  departure_time TIMESTAMPTZ NOT NULL,
  price_local NUMERIC(10,2),
  currency TEXT DEFAULT 'RWF',
  vehicle_type public.vehicle_type_new,
  notes TEXT,
  
  -- Status
  status public.trip_status_new DEFAULT 'open',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trip matches table
CREATE TABLE IF NOT EXISTS public.trip_matches_wizard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_driver_id UUID REFERENCES public.trips_wizard(id) ON DELETE CASCADE,
  trip_passenger_id UUID REFERENCES public.trips_wizard(id) ON DELETE CASCADE,
  match_score NUMERIC(3,2) DEFAULT 0.5,
  status public.trip_match_status_new DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations cache for fast autocomplete
CREATE TABLE IF NOT EXISTS public.locations_cache (
  place_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT DEFAULT 'RW',
  geom GEOGRAPHY(Point),
  popularity_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_trips_wizard_origin_geom ON public.trips_wizard USING GIST (origin_geom);
CREATE INDEX IF NOT EXISTS idx_trips_wizard_dest_geom ON public.trips_wizard USING GIST (dest_geom);
CREATE INDEX IF NOT EXISTS idx_locations_cache_geom ON public.locations_cache USING GIST (geom);

-- Query optimization indexes
CREATE INDEX IF NOT EXISTS idx_trips_wizard_status_role ON public.trips_wizard (status, role);
CREATE INDEX IF NOT EXISTS idx_trips_wizard_departure_time ON public.trips_wizard (departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_wizard_creator_id ON public.trips_wizard (creator_id);
CREATE INDEX IF NOT EXISTS idx_locations_cache_name ON public.locations_cache (name);
CREATE INDEX IF NOT EXISTS idx_locations_cache_popularity ON public.locations_cache (popularity_score DESC);

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.trips_wizard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_matches_wizard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations_cache ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "trips_creator_full_access" ON public.trips_wizard
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "trips_public_read_open" ON public.trips_wizard
  FOR SELECT USING (status = 'open');

-- Trip matches policies  
CREATE POLICY "trip_matches_involved_parties" ON public.trip_matches_wizard
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips_wizard t1 
      WHERE t1.id = trip_driver_id AND t1.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.trips_wizard t2 
      WHERE t2.id = trip_passenger_id AND t2.creator_id = auth.uid()
    )
  );

CREATE POLICY "trip_matches_create_involved" ON public.trip_matches_wizard
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips_wizard t1 
      WHERE t1.id = trip_driver_id AND t1.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.trips_wizard t2 
      WHERE t2.id = trip_passenger_id AND t2.creator_id = auth.uid()
    )
  );

-- Locations cache - public read
CREATE POLICY "locations_cache_public_read" ON public.locations_cache
  FOR SELECT USING (true);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Smart price estimator based on distance and seats
CREATE OR REPLACE FUNCTION public.estimate_price_km(distance_km NUMERIC, seats INTEGER)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT ROUND(distance_km * 150 * GREATEST(1, seats))::NUMERIC; -- 150 RWF per km base
$$;

-- Enhanced price estimator with geography points
CREATE OR REPLACE FUNCTION public.estimate_price(
  origin GEOGRAPHY, 
  destination GEOGRAPHY, 
  seats INTEGER DEFAULT 1
)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT public.estimate_price_km(
    ST_Distance(origin, destination) / 1000.0, -- Convert meters to km
    seats
  );
$$;

-- Fuzzy location search function
CREATE OR REPLACE FUNCTION public.search_locations(query_text TEXT, max_results INTEGER DEFAULT 10)
RETURNS TABLE(place_id TEXT, name TEXT, geom GEOGRAPHY)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    l.place_id,
    l.name,
    l.geom
  FROM public.locations_cache l
  WHERE 
    l.name ILIKE '%' || query_text || '%'
    OR l.place_id ILIKE '%' || query_text || '%'
  ORDER BY 
    l.popularity_score DESC,
    SIMILARITY(l.name, query_text) DESC
  LIMIT max_results;
$$;

-- Trip matching algorithm
CREATE OR REPLACE FUNCTION public.match_trips(p_trip_id UUID)
RETURNS SETOF public.trip_matches_wizard
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  trip_record public.trips_wizard%ROWTYPE;
  match_record public.trip_matches_wizard%ROWTYPE;
BEGIN
  -- Get the trip details
  SELECT * INTO trip_record 
  FROM public.trips_wizard 
  WHERE id = p_trip_id AND status = 'open';
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find matching trips based on role
  IF trip_record.role = 'passenger' THEN
    -- Find matching driver trips
    INSERT INTO public.trip_matches_wizard (trip_driver_id, trip_passenger_id, match_score)
    SELECT 
      dt.id,
      p_trip_id,
      CASE 
        WHEN ST_Distance(dt.origin_geom, trip_record.origin_geom) < 5000 
         AND ST_Distance(dt.dest_geom, trip_record.dest_geom) < 5000
         AND dt.departure_time BETWEEN trip_record.departure_time - INTERVAL '30 minutes' 
                                   AND trip_record.departure_time + INTERVAL '30 minutes'
        THEN 0.9
        ELSE 0.3
      END as match_score
    FROM public.trips_wizard dt
    WHERE dt.role = 'driver' 
      AND dt.status = 'open'
      AND dt.id != p_trip_id
      AND dt.creator_id != trip_record.creator_id
      AND dt.seats_offered >= trip_record.seats_needed
    RETURNING * INTO match_record;
    
  ELSIF trip_record.role = 'driver' THEN
    -- Find matching passenger trips
    INSERT INTO public.trip_matches_wizard (trip_driver_id, trip_passenger_id, match_score)
    SELECT 
      p_trip_id,
      pt.id,
      CASE 
        WHEN ST_Distance(pt.origin_geom, trip_record.origin_geom) < 5000 
         AND ST_Distance(pt.dest_geom, trip_record.dest_geom) < 5000
         AND pt.departure_time BETWEEN trip_record.departure_time - INTERVAL '30 minutes' 
                                   AND trip_record.departure_time + INTERVAL '30 minutes'
        THEN 0.9
        ELSE 0.3
      END as match_score
    FROM public.trips_wizard pt
    WHERE pt.role = 'passenger' 
      AND pt.status = 'open'
      AND pt.id != p_trip_id
      AND pt.creator_id != trip_record.creator_id
      AND trip_record.seats_offered >= pt.seats_needed
    RETURNING * INTO match_record;
  END IF;
  
  -- Return all matches for this trip
  RETURN QUERY
  SELECT * FROM public.trip_matches_wizard tm
  WHERE tm.trip_driver_id = p_trip_id OR tm.trip_passenger_id = p_trip_id;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER trips_wizard_updated_at
  BEFORE UPDATE ON public.trips_wizard
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trip_matches_wizard_updated_at  
  BEFORE UPDATE ON public.trip_matches_wizard
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert some sample locations for Kigali
INSERT INTO public.locations_cache (place_id, name, country_code, geom, popularity_score) VALUES
('kigali_airport', 'Kigali International Airport', 'RW', ST_GeogFromText('POINT(30.1394 -1.9683)'), 0.9),
('downtown_kigali', 'Downtown Kigali', 'RW', ST_GeogFromText('POINT(30.0619 -1.9441)'), 0.95),
('kimisagara', 'Kimisagara', 'RW', ST_GeogFromText('POINT(30.0419 -1.9641)'), 0.8),
('nyamirambo', 'Nyamirambo', 'RW', ST_GeogFromText('POINT(30.0319 -1.9741)'), 0.8),
('remera', 'Remera', 'RW', ST_GeogFromText('POINT(30.0919 -1.9341)'), 0.85),
('kicukiro', 'Kicukiro', 'RW', ST_GeogFromText('POINT(30.0819 -1.9841)'), 0.75)
ON CONFLICT (place_id) DO NOTHING; 