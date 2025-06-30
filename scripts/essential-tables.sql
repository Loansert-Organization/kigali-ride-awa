-- Essential Tables for Kigali Ride AWA
-- This creates only the core tables needed for basic app functionality
-- Run this if you need to get the app working quickly

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Enhanced Users Table (combines multiple user tables)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    role TEXT CHECK (role IN ('passenger', 'driver', 'both')) DEFAULT 'passenger',
    country VARCHAR(2) DEFAULT 'RW',
    language TEXT CHECK (language IN ('en', 'kn', 'fr')) DEFAULT 'en',
    promo_code TEXT UNIQUE,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trips Wizard Table (for new trip creation flow)
CREATE TABLE IF NOT EXISTS public.trips_wizard (
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

-- 3. Trip Matches Table
CREATE TABLE IF NOT EXISTS public.trip_matches_wizard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_trip_id UUID REFERENCES trips_wizard(id) ON DELETE CASCADE,
    passenger_trip_id UUID REFERENCES trips_wizard(id) ON DELETE CASCADE,
    match_score DECIMAL(5, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_trip_id, passenger_trip_id)
);

-- 4. Locations Cache Table
CREATE TABLE IF NOT EXISTS public.locations_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    trip_id UUID REFERENCES trips_wizard(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Points Table (for gamification)
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 7. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. AI Assistant Tables
CREATE TABLE IF NOT EXISTS public.ai_assistant_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_assistant_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES ai_assistant_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips_wizard(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips_wizard(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips_wizard(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_origin ON trips_wizard USING GIST(origin_location);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips_wizard USING GIST(destination_location);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips_wizard ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_matches_wizard ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR ALL USING (auth.uid() = auth_user_id);

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

CREATE POLICY "Users can manage their messages" ON messages
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can view their points" ON user_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = user_points.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view referrals" ON referrals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM users WHERE id = referrer_id
            UNION
            SELECT auth_user_id FROM users WHERE id = referred_id
        )
    );

CREATE POLICY "Users can manage their AI sessions" ON ai_assistant_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their AI messages" ON ai_assistant_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_assistant_sessions s
            WHERE s.id = session_id AND s.user_id = auth.uid()
        )
    );

-- Essential Functions

-- Function to generate promo codes
CREATE OR REPLACE FUNCTION generate_promo_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        code := 'RIDE-' || upper(substr(md5(random()::text), 1, 5));
        SELECT EXISTS(SELECT 1 FROM users WHERE promo_code = code) INTO exists_check;
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trip price
CREATE OR REPLACE FUNCTION calculate_trip_price(distance_km DECIMAL, country_code TEXT DEFAULT 'RW')
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(distance_km * CASE country_code
        WHEN 'RW' THEN 150  -- Rwanda
        WHEN 'TZ' THEN 50   -- Tanzania
        WHEN 'ET' THEN 15   -- Ethiopia
        WHEN 'GH' THEN 2    -- Ghana
        ELSE 150  -- Default
    END, -1);
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips_wizard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_updated_at BEFORE UPDATE ON user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample locations for Kigali
INSERT INTO locations_cache (place_id, name, address, location, country) VALUES
    ('kigali_airport', 'Kigali International Airport', 'KN 5 Rd, Kigali', ST_SetSRID(ST_MakePoint(30.1395, -1.9689), 4326), 'RW'),
    ('kigali_heights', 'Kigali Heights', 'KG 7 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.0945, -1.9536), 4326), 'RW'),
    ('kimironko_market', 'Kimironko Market', 'KG 15 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.1132, -1.9298), 4326), 'RW'),
    ('nyamirambo', 'Nyamirambo', 'KN 3 Rd, Kigali', ST_SetSRID(ST_MakePoint(30.0419, -1.9777), 4326), 'RW'),
    ('convention_center', 'Kigali Convention Centre', 'KN 3 Ave, Kigali', ST_SetSRID(ST_MakePoint(30.0894, -1.9544), 4326), 'RW')
ON CONFLICT (place_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Essential tables created successfully! Your app should now be functional.';
END $$; 