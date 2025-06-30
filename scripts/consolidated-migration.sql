-- Consolidated Migration for Kigali Ride AWA
-- This file combines all migrations to be run in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/nireplgrlwhwppjtfxbb/sql/new

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create migration history table if not exists
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    inserted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check if migration has been applied
CREATE OR REPLACE FUNCTION migration_exists(version text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations WHERE schema_migrations.version = migration_exists.version);
END;
$$ LANGUAGE plpgsql;

-- Start migrations

-- 1. Initial Schema (20240726120000)
DO $$
BEGIN
    IF NOT migration_exists('20240726120000') THEN
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            phone VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100),
            role VARCHAR(20) CHECK (role IN ('passenger', 'driver', 'both')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            country VARCHAR(2)
        );

        -- Trips table
        CREATE TABLE IF NOT EXISTS trips (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            driver_id UUID REFERENCES users(id),
            origin_text TEXT NOT NULL,
            destination_text TEXT NOT NULL,
            origin_coords GEOGRAPHY(POINT, 4326),
            destination_coords GEOGRAPHY(POINT, 4326),
            departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
            available_seats INTEGER NOT NULL CHECK (available_seats > 0),
            price_per_seat DECIMAL(10, 2),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Vehicles table
        CREATE TABLE IF NOT EXISTS vehicles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            driver_id UUID REFERENCES users(id),
            make VARCHAR(50),
            model VARCHAR(50),
            year INTEGER,
            color VARCHAR(30),
            license_plate VARCHAR(20) UNIQUE,
            seats INTEGER NOT NULL CHECK (seats > 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Trip matches table
        CREATE TABLE IF NOT EXISTS trip_matches (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trip_id UUID REFERENCES trips(id),
            passenger_id UUID REFERENCES users(id),
            seats_booked INTEGER NOT NULL DEFAULT 1,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(trip_id, passenger_id)
        );

        -- Messages table
        CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sender_id UUID REFERENCES users(id),
            receiver_id UUID REFERENCES users(id),
            trip_id UUID REFERENCES trips(id),
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Referrals table
        CREATE TABLE IF NOT EXISTS referrals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            referrer_id UUID REFERENCES users(id),
            referred_id UUID REFERENCES users(id),
            code VARCHAR(20) UNIQUE NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP WITH TIME ZONE
        );

        -- Points table
        CREATE TABLE IF NOT EXISTS points (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id),
            points INTEGER NOT NULL DEFAULT 0,
            reason VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Rewards table
        CREATE TABLE IF NOT EXISTS rewards (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            description TEXT,
            points_required INTEGER NOT NULL,
            available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_trips_driver_id ON trips(driver_id);
        CREATE INDEX idx_trips_status ON trips(status);
        CREATE INDEX idx_trips_departure ON trips(departure_time);
        CREATE INDEX idx_trip_matches_trip_id ON trip_matches(trip_id);
        CREATE INDEX idx_trip_matches_passenger_id ON trip_matches(passenger_id);
        CREATE INDEX idx_messages_sender ON messages(sender_id);
        CREATE INDEX idx_messages_receiver ON messages(receiver_id);
        CREATE INDEX idx_points_user_id ON points(user_id);

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20240726120000');
    END IF;
END $$;

-- 2. Trip Wizard Schema (20250101000000)
DO $$
BEGIN
    IF NOT migration_exists('20250101000000') THEN
        -- Create trips_wizard table
        CREATE TABLE IF NOT EXISTS trips_wizard (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('driver', 'passenger')),
            origin_text TEXT NOT NULL,
            destination_text TEXT NOT NULL,
            origin_location GEOGRAPHY(POINT, 4326) NOT NULL,
            destination_location GEOGRAPHY(POINT, 4326) NOT NULL,
            departure_time TIMESTAMPTZ NOT NULL,
            seats INTEGER,
            vehicle_type TEXT,
            price DECIMAL(10, 2),
            distance_km DECIMAL(10, 2),
            duration_minutes INTEGER,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create trip_matches_wizard table
        CREATE TABLE IF NOT EXISTS trip_matches_wizard (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            driver_trip_id UUID REFERENCES trips_wizard(id) ON DELETE CASCADE,
            passenger_trip_id UUID REFERENCES trips_wizard(id) ON DELETE CASCADE,
            match_score DECIMAL(5, 2),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(driver_trip_id, passenger_trip_id)
        );

        -- Create locations_cache table
        CREATE TABLE IF NOT EXISTS locations_cache (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            place_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            location GEOGRAPHY(POINT, 4326) NOT NULL,
            country TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX idx_trips_wizard_user_id ON trips_wizard(user_id);
        CREATE INDEX idx_trips_wizard_status ON trips_wizard(status);
        CREATE INDEX idx_trips_wizard_departure ON trips_wizard(departure_time);
        CREATE INDEX idx_trips_wizard_origin ON trips_wizard USING GIST(origin_location);
        CREATE INDEX idx_trips_wizard_destination ON trips_wizard USING GIST(destination_location);
        CREATE INDEX idx_locations_cache_location ON locations_cache USING GIST(location);

        -- Enable RLS
        ALTER TABLE trips_wizard ENABLE ROW LEVEL SECURITY;
        ALTER TABLE trip_matches_wizard ENABLE ROW LEVEL SECURITY;
        ALTER TABLE locations_cache ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can view their own trips" ON trips_wizard
            FOR ALL USING (auth.uid() = user_id);

        CREATE POLICY "Users can view active trips" ON trips_wizard
            FOR SELECT USING (status = 'active');

        CREATE POLICY "Users can view their matches" ON trip_matches_wizard
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM trips_wizard t
                    WHERE (t.id = driver_trip_id OR t.id = passenger_trip_id)
                    AND t.user_id = auth.uid()
                )
            );

        CREATE POLICY "Anyone can read location cache" ON locations_cache
            FOR SELECT USING (true);

        -- Function to calculate trip price
        CREATE OR REPLACE FUNCTION calculate_trip_price(distance_km DECIMAL)
        RETURNS DECIMAL AS $$
        BEGIN
            RETURN ROUND(distance_km * 150, -1); -- 150 RWF per km, rounded to nearest 10
        END;
        $$ LANGUAGE plpgsql;

        -- Function to match trips
        CREATE OR REPLACE FUNCTION match_trips(trip_id UUID)
        RETURNS TABLE(matched_trip_id UUID, match_score DECIMAL) AS $$
        DECLARE
            trip_record trips_wizard%ROWTYPE;
        BEGIN
            SELECT * INTO trip_record FROM trips_wizard WHERE id = trip_id;
            
            IF trip_record.role = 'driver' THEN
                RETURN QUERY
                SELECT 
                    t.id,
                    CASE 
                        WHEN ST_DWithin(t.origin_location::geography, trip_record.origin_location::geography, 5000)
                            AND ST_DWithin(t.destination_location::geography, trip_record.destination_location::geography, 5000)
                            AND ABS(EXTRACT(EPOCH FROM (t.departure_time - trip_record.departure_time))) < 3600
                        THEN 95.0
                        ELSE 50.0
                    END AS score
                FROM trips_wizard t
                WHERE t.role = 'passenger'
                    AND t.status = 'active'
                    AND t.id != trip_id
                    AND t.departure_time::date = trip_record.departure_time::date
                ORDER BY score DESC
                LIMIT 10;
            ELSE
                RETURN QUERY
                SELECT 
                    t.id,
                    CASE 
                        WHEN ST_DWithin(t.origin_location::geography, trip_record.origin_location::geography, 5000)
                            AND ST_DWithin(t.destination_location::geography, trip_record.destination_location::geography, 5000)
                            AND ABS(EXTRACT(EPOCH FROM (t.departure_time - trip_record.departure_time))) < 3600
                        THEN 95.0
                        ELSE 50.0
                    END AS score
                FROM trips_wizard t
                WHERE t.role = 'driver'
                    AND t.status = 'active'
                    AND t.id != trip_id
                    AND t.departure_time::date = trip_record.departure_time::date
                    AND (t.seats IS NULL OR t.seats > 0)
                ORDER BY score DESC
                LIMIT 10;
            END IF;
        END;
        $$ LANGUAGE plpgsql;

        -- Insert sample Kigali locations
        INSERT INTO locations_cache (place_id, name, address, location, country) VALUES
            ('kigali_airport', 'Kigali International Airport', 'KN 5 Rd, Kigali', ST_SetSRID(ST_MakePoint(30.1395, -1.9689), 4326), 'RW'),
            ('kigali_heights', 'Kigali Heights', 'KG 7 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.0945, -1.9536), 4326), 'RW'),
            ('kimironko_market', 'Kimironko Market', 'KG 15 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.1132, -1.9298), 4326), 'RW'),
            ('nyamirambo', 'Nyamirambo', 'KN 3 Rd, Kigali', ST_SetSRID(ST_MakePoint(30.0419, -1.9777), 4326), 'RW'),
            ('convention_center', 'Kigali Convention Centre', 'KN 3 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.0894, -1.9544), 4326), 'RW')
        ON CONFLICT (place_id) DO NOTHING;

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250101000000');
    END IF;
END $$;

-- 3. Country Support (20250101000001)
DO $$
BEGIN
    IF NOT migration_exists('20250101000001') THEN
        -- Add country column to users table if not exists
        ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2);

        -- Create country pricing function
        CREATE OR REPLACE FUNCTION get_country_price_per_km(country_code TEXT)
        RETURNS DECIMAL AS $$
        BEGIN
            RETURN CASE country_code
                WHEN 'RW' THEN 150  -- Rwanda
                WHEN 'TZ' THEN 50   -- Tanzania
                WHEN 'ET' THEN 15   -- Ethiopia
                WHEN 'GH' THEN 2    -- Ghana
                WHEN 'SN' THEN 100  -- Senegal
                WHEN 'CI' THEN 100  -- Côte d'Ivoire
                WHEN 'CM' THEN 100  -- Cameroon
                WHEN 'BF' THEN 100  -- Burkina Faso
                WHEN 'ML' THEN 100  -- Mali
                WHEN 'NE' THEN 100  -- Niger
                WHEN 'TD' THEN 100  -- Chad
                WHEN 'MG' THEN 800  -- Madagascar
                WHEN 'MW' THEN 300  -- Malawi
                WHEN 'ZM' THEN 5    -- Zambia
                WHEN 'ZW' THEN 1    -- Zimbabwe
                WHEN 'MZ' THEN 15   -- Mozambique
                WHEN 'AO' THEN 100  -- Angola
                WHEN 'BW' THEN 3    -- Botswana
                WHEN 'NA' THEN 5    -- Namibia
                ELSE 150  -- Default
            END;
        END;
        $$ LANGUAGE plpgsql;

        -- Update calculate_trip_price function to use country pricing
        CREATE OR REPLACE FUNCTION calculate_trip_price(distance_km DECIMAL, country_code TEXT DEFAULT 'RW')
        RETURNS DECIMAL AS $$
        DECLARE
            price_per_km DECIMAL;
        BEGIN
            price_per_km := get_country_price_per_km(country_code);
            RETURN ROUND(distance_km * price_per_km, -1);
        END;
        $$ LANGUAGE plpgsql;

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250101000001');
    END IF;
END $$;

-- 4. AI Assistant Tables (20250101000002)
DO $$
BEGIN
    IF NOT migration_exists('20250101000002') THEN
        -- AI Assistant Sessions
        CREATE TABLE IF NOT EXISTS ai_assistant_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- AI Assistant Messages
        CREATE TABLE IF NOT EXISTS ai_assistant_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id UUID REFERENCES ai_assistant_sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- AI Usage Tracking
        CREATE TABLE IF NOT EXISTS ai_usage (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            function_name TEXT NOT NULL,
            tokens_used INTEGER,
            cost_usd DECIMAL(10, 6),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Indexes
        CREATE INDEX idx_ai_sessions_user ON ai_assistant_sessions(user_id);
        CREATE INDEX idx_ai_messages_session ON ai_assistant_messages(session_id);
        CREATE INDEX idx_ai_usage_user ON ai_usage(user_id);
        CREATE INDEX idx_ai_usage_created ON ai_usage(created_at);

        -- Enable RLS
        ALTER TABLE ai_assistant_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can manage their own sessions" ON ai_assistant_sessions
            FOR ALL USING (auth.uid() = user_id);

        CREATE POLICY "Users can view their own messages" ON ai_assistant_messages
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM ai_assistant_sessions s
                    WHERE s.id = session_id AND s.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can view their own usage" ON ai_usage
            FOR SELECT USING (auth.uid() = user_id);

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250101000002');
    END IF;
END $$;

-- 5. Push Notifications Table (20250627000000)
DO $$
BEGIN
    IF NOT migration_exists('20250627000000') THEN
        -- Push registrations table
        CREATE TABLE IF NOT EXISTS push_registrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            token TEXT NOT NULL,
            platform TEXT CHECK (platform IN ('web', 'ios', 'android')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, token)
        );

        -- Index for user lookups
        CREATE INDEX idx_push_registrations_user ON push_registrations(user_id);

        -- Enable RLS
        ALTER TABLE push_registrations ENABLE ROW LEVEL SECURITY;

        -- RLS Policy
        CREATE POLICY "Users can manage their own push tokens" ON push_registrations
            FOR ALL USING (auth.uid() = user_id);

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250627000000');
    END IF;
END $$;

-- Clean up migration helper function
DROP FUNCTION IF EXISTS migration_exists(text);

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'All migrations completed successfully!';
END $$; 