-- Add country support to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS country TEXT CHECK (
  country IN (
    -- West Africa
    'GH', 'SN', 'ML', 'BF', 'CI', 'LR', 'SL', 'GW', 'GN', 'TG', 'BJ',
    -- Central Africa  
    'CM', 'CF', 'TD', 'CG', 'CD', 'GQ', 'GA',
    -- East Africa (excluding Kenya, Uganda)
    'RW', 'BI', 'TZ', 'ET', 'ER', 'DJ', 'SO',
    -- Southern Africa (excluding South Africa)
    'BW', 'LS', 'SZ', 'NA', 'ZW', 'ZM', 'MW', 'MZ', 'MG', 'MU', 'SC'
  )
);

-- Add default country as Rwanda for existing users
UPDATE public.users 
SET country = 'RW' 
WHERE country IS NULL;

-- Create index for better country-based queries
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);

-- Update location cache table to use geography type for better spatial queries
ALTER TABLE public.locations_cache 
ALTER COLUMN location TYPE geography(POINT, 4326);

-- Create spatial index for better location queries
CREATE INDEX IF NOT EXISTS idx_locations_cache_location_gist 
ON public.locations_cache USING GIST(location);

-- Update trip wizard tables to support country-specific features
ALTER TABLE public.trips_wizard 
ADD COLUMN IF NOT EXISTS country TEXT REFERENCES (
  SELECT unnest(ARRAY[
    'GH', 'SN', 'ML', 'BF', 'CI', 'LR', 'SL', 'GW', 'GN', 'TG', 'BJ',
    'CM', 'CF', 'TD', 'CG', 'CD', 'GQ', 'GA',
    'RW', 'BI', 'TZ', 'ET', 'ER', 'DJ', 'SO',
    'BW', 'LS', 'SZ', 'NA', 'ZW', 'ZM', 'MW', 'MZ', 'MG', 'MU', 'SC'
  ])
);

-- Create function to get country-specific price per km
CREATE OR REPLACE FUNCTION get_country_price_per_km(country_code TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE country_code
    -- West Africa (XOF/other currencies)
    WHEN 'GH' THEN 3
    WHEN 'SN' THEN 500
    WHEN 'ML' THEN 500
    WHEN 'BF' THEN 500
    WHEN 'CI' THEN 500
    WHEN 'TG' THEN 500
    WHEN 'BJ' THEN 500
    WHEN 'GW' THEN 500
    WHEN 'LR' THEN 50
    WHEN 'SL' THEN 25
    WHEN 'GN' THEN 25
    
    -- Central Africa
    WHEN 'CM' THEN 500
    WHEN 'CF' THEN 500
    WHEN 'TD' THEN 500
    WHEN 'CG' THEN 500
    WHEN 'GA' THEN 500
    WHEN 'GQ' THEN 500
    WHEN 'CD' THEN 2000
    
    -- East Africa
    WHEN 'RW' THEN 150
    WHEN 'BI' THEN 3000
    WHEN 'TZ' THEN 2500
    WHEN 'ET' THEN 50
    WHEN 'ER' THEN 30
    WHEN 'DJ' THEN 200
    WHEN 'SO' THEN 600
    
    -- Southern Africa
    WHEN 'BW' THEN 12
    WHEN 'LS' THEN 20
    WHEN 'SZ' THEN 15
    WHEN 'NA' THEN 15
    WHEN 'ZW' THEN 500
    WHEN 'ZM' THEN 25
    WHEN 'MW' THEN 800
    WHEN 'MZ' THEN 70
    WHEN 'MG' THEN 4000
    WHEN 'MU' THEN 40
    WHEN 'SC' THEN 25
    
    ELSE 150 -- Default to Rwanda pricing
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update price estimation function to use country-specific pricing
CREATE OR REPLACE FUNCTION estimate_trip_price(
  origin_lat FLOAT,
  origin_lng FLOAT,
  destination_lat FLOAT,
  destination_lng FLOAT,
  seats INTEGER,
  country_code TEXT DEFAULT 'RW'
)
RETURNS INTEGER AS $$
DECLARE
  distance_km FLOAT;
  price_per_km INTEGER;
  total_price INTEGER;
BEGIN
  -- Calculate distance using PostGIS (simplified)
  distance_km := ST_Distance(
    ST_Point(origin_lng, origin_lat)::geography,
    ST_Point(destination_lng, destination_lat)::geography
  ) / 1000.0;
  
  -- Get country-specific price per km
  price_per_km := get_country_price_per_km(country_code);
  
  -- Calculate total price
  total_price := ROUND(distance_km * price_per_km * seats);
  
  RETURN total_price;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create country-aware location search function
CREATE OR REPLACE FUNCTION search_locations_by_country(
  search_query TEXT,
  country_code TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  country TEXT,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    lc.name,
    lc.address,
    lc.lat,
    lc.lng,
    lc.country,
    -- Boost relevance for same country
    CASE 
      WHEN lc.country = country_code THEN 
        similarity(lc.name, search_query) * 1.5
      ELSE 
        similarity(lc.name, search_query)
    END as relevance_score
  FROM public.locations_cache lc
  WHERE 
    (lc.name ILIKE '%' || search_query || '%' OR lc.address ILIKE '%' || search_query || '%')
    AND (lc.country = country_code OR country_code IS NULL)
  ORDER BY relevance_score DESC, lc.country = country_code DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 