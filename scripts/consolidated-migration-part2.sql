-- Consolidated Migration for Kigali Ride AWA - Part 2
-- Continue from Part 1
-- This file contains the remaining migrations from the Supabase project

-- Function to check if migration has been applied (recreate for part 2)
CREATE OR REPLACE FUNCTION migration_exists(version text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations WHERE schema_migrations.version = migration_exists.version);
END;
$$ LANGUAGE plpgsql;

-- 6. Auth Users Table Enhancement (20250625172839)
DO $$
BEGIN
    IF NOT migration_exists('20250625172839') THEN
        -- Create enhanced users table for storing user profiles and preferences
        CREATE TABLE IF NOT EXISTS public.users_enhanced (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT CHECK (role IN ('passenger', 'driver')),
            language TEXT CHECK (language IN ('en', 'kn', 'fr')) DEFAULT 'en',
            location_enabled BOOLEAN DEFAULT false,
            notifications_enabled BOOLEAN DEFAULT false,
            referred_by TEXT,
            promo_code TEXT UNIQUE,
            onboarding_completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable Row Level Security
        ALTER TABLE public.users_enhanced ENABLE ROW LEVEL SECURITY;

        -- Create policies for users table
        CREATE POLICY "Users can view their own profile" 
            ON public.users_enhanced 
            FOR SELECT 
            USING (auth.uid() = auth_user_id);

        CREATE POLICY "Users can insert their own profile" 
            ON public.users_enhanced 
            FOR INSERT 
            WITH CHECK (auth.uid() = auth_user_id);

        CREATE POLICY "Users can update their own profile" 
            ON public.users_enhanced 
            FOR UPDATE 
            USING (auth.uid() = auth_user_id);

        -- Create function to generate unique promo codes
        CREATE OR REPLACE FUNCTION generate_promo_code()
        RETURNS TEXT AS $$
        DECLARE
            code TEXT;
            exists_check BOOLEAN;
        BEGIN
            LOOP
                -- Generate a random 5-character code
                code := 'RIDE-' || upper(substr(md5(random()::text), 1, 5));
                
                -- Check if code already exists
                SELECT EXISTS(SELECT 1 FROM public.users_enhanced WHERE promo_code = code) INTO exists_check;
                
                -- If code doesn't exist, break the loop
                IF NOT exists_check THEN
                    EXIT;
                END IF;
            END LOOP;
            
            RETURN code;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger to auto-generate promo codes
        CREATE OR REPLACE FUNCTION auto_generate_promo_code()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.promo_code IS NULL THEN
                NEW.promo_code := generate_promo_code();
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER users_auto_promo_code
            BEFORE INSERT ON public.users_enhanced
            FOR EACH ROW
            EXECUTE FUNCTION auto_generate_promo_code();

        -- Create trigger to auto-update updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER users_updated_at
            BEFORE UPDATE ON public.users_enhanced
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250625172839');
    END IF;
END $$;

-- 7. Trips and Requests Tables (20250625173458)
DO $$
BEGIN
    IF NOT migration_exists('20250625173458') THEN
        -- Create trips table for drivers
        CREATE TABLE IF NOT EXISTS public.driver_trips (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            origin_place_id TEXT NOT NULL,
            origin_text TEXT NOT NULL,
            origin_coords GEOGRAPHY(POINT, 4326),
            destination_place_id TEXT NOT NULL,
            destination_text TEXT NOT NULL,
            destination_coords GEOGRAPHY(POINT, 4326),
            departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
            available_seats INTEGER NOT NULL CHECK (available_seats > 0 AND available_seats <= 8),
            price_per_seat DECIMAL(10, 2) CHECK (price_per_seat > 0),
            notes TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create passenger requests table
        CREATE TABLE IF NOT EXISTS public.passenger_requests (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            origin_place_id TEXT NOT NULL,
            origin_text TEXT NOT NULL,
            origin_coords GEOGRAPHY(POINT, 4326),
            destination_place_id TEXT NOT NULL,
            destination_text TEXT NOT NULL,
            destination_coords GEOGRAPHY(POINT, 4326),
            departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
            seats_needed INTEGER NOT NULL DEFAULT 1 CHECK (seats_needed > 0 AND seats_needed <= 8),
            max_price DECIMAL(10, 2) CHECK (max_price > 0),
            notes TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create matches table
        CREATE TABLE IF NOT EXISTS public.trip_request_matches (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            trip_id UUID NOT NULL REFERENCES public.driver_trips(id) ON DELETE CASCADE,
            request_id UUID NOT NULL REFERENCES public.passenger_requests(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
            driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
            passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(trip_id, request_id)
        );

        -- Create indexes for better performance
        CREATE INDEX idx_driver_trips_driver_id ON public.driver_trips(driver_id);
        CREATE INDEX idx_driver_trips_departure ON public.driver_trips(departure_time);
        CREATE INDEX idx_driver_trips_status ON public.driver_trips(status);
        CREATE INDEX idx_driver_trips_origin ON public.driver_trips USING GIST(origin_coords);
        CREATE INDEX idx_driver_trips_destination ON public.driver_trips USING GIST(destination_coords);

        CREATE INDEX idx_passenger_requests_passenger_id ON public.passenger_requests(passenger_id);
        CREATE INDEX idx_passenger_requests_departure ON public.passenger_requests(departure_time);
        CREATE INDEX idx_passenger_requests_status ON public.passenger_requests(status);
        CREATE INDEX idx_passenger_requests_origin ON public.passenger_requests USING GIST(origin_coords);
        CREATE INDEX idx_passenger_requests_destination ON public.passenger_requests USING GIST(destination_coords);

        CREATE INDEX idx_matches_trip_id ON public.trip_request_matches(trip_id);
        CREATE INDEX idx_matches_request_id ON public.trip_request_matches(request_id);
        CREATE INDEX idx_matches_status ON public.trip_request_matches(status);

        -- Enable RLS
        ALTER TABLE public.driver_trips ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.passenger_requests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.trip_request_matches ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for driver_trips
        CREATE POLICY "Drivers can manage their own trips"
            ON public.driver_trips
            FOR ALL
            USING (auth.uid() = driver_id);

        CREATE POLICY "Everyone can view active trips"
            ON public.driver_trips
            FOR SELECT
            USING (status = 'active');

        -- RLS Policies for passenger_requests
        CREATE POLICY "Passengers can manage their own requests"
            ON public.passenger_requests
            FOR ALL
            USING (auth.uid() = passenger_id);

        CREATE POLICY "Drivers can view active requests"
            ON public.passenger_requests
            FOR SELECT
            USING (status = 'active');

        -- RLS Policies for matches
        CREATE POLICY "Users can view their own matches"
            ON public.trip_request_matches
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.driver_trips t
                    WHERE t.id = trip_request_matches.trip_id
                    AND t.driver_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.passenger_requests r
                    WHERE r.id = trip_request_matches.request_id
                    AND r.passenger_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update their own matches"
            ON public.trip_request_matches
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.driver_trips t
                    WHERE t.id = trip_request_matches.trip_id
                    AND t.driver_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.passenger_requests r
                    WHERE r.id = trip_request_matches.request_id
                    AND r.passenger_id = auth.uid()
                )
            );

        -- Add update triggers
        CREATE TRIGGER driver_trips_updated_at
            BEFORE UPDATE ON public.driver_trips
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER passenger_requests_updated_at
            BEFORE UPDATE ON public.passenger_requests
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER matches_updated_at
            BEFORE UPDATE ON public.trip_request_matches
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250625173458');
    END IF;
END $$;

-- 8. Vehicles and Driver Details (20250625180052)
DO $$
BEGIN
    IF NOT migration_exists('20250625180052') THEN
        -- Create vehicles table
        CREATE TABLE IF NOT EXISTS public.driver_vehicles (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER CHECK (year >= 1900 AND year <= extract(year from CURRENT_DATE) + 1),
            color TEXT NOT NULL,
            license_plate TEXT NOT NULL,
            vehicle_type TEXT CHECK (vehicle_type IN ('sedan', 'suv', 'minivan', 'pickup', 'other')),
            total_seats INTEGER NOT NULL CHECK (total_seats >= 2 AND total_seats <= 8),
            is_primary BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(license_plate)
        );

        -- Create driver details table
        CREATE TABLE IF NOT EXISTS public.driver_details (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            license_number TEXT NOT NULL,
            license_expiry DATE NOT NULL,
            years_driving INTEGER CHECK (years_driving >= 0),
            preferred_radius_km INTEGER DEFAULT 50 CHECK (preferred_radius_km > 0),
            bio TEXT,
            rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
            total_trips INTEGER DEFAULT 0 CHECK (total_trips >= 0),
            verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX idx_vehicles_driver_id ON public.driver_vehicles(driver_id);
        CREATE INDEX idx_vehicles_is_primary ON public.driver_vehicles(is_primary);
        CREATE INDEX idx_driver_details_driver_id ON public.driver_details(driver_id);
        CREATE INDEX idx_driver_details_verified ON public.driver_details(verified);

        -- Enable RLS
        ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.driver_details ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for vehicles
        CREATE POLICY "Drivers can manage their own vehicles"
            ON public.driver_vehicles
            FOR ALL
            USING (auth.uid() = driver_id);

        CREATE POLICY "Everyone can view vehicles"
            ON public.driver_vehicles
            FOR SELECT
            USING (true);

        -- RLS Policies for driver details
        CREATE POLICY "Drivers can manage their own details"
            ON public.driver_details
            FOR ALL
            USING (auth.uid() = driver_id);

        CREATE POLICY "Everyone can view verified driver details"
            ON public.driver_details
            FOR SELECT
            USING (verified = true);

        -- Add update triggers
        CREATE TRIGGER vehicles_updated_at
            BEFORE UPDATE ON public.driver_vehicles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER driver_details_updated_at
            BEFORE UPDATE ON public.driver_details
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- Function to ensure only one primary vehicle per driver
        CREATE OR REPLACE FUNCTION ensure_single_primary_vehicle()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.is_primary = true THEN
                UPDATE public.driver_vehicles
                SET is_primary = false
                WHERE driver_id = NEW.driver_id
                AND id != NEW.id;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER ensure_single_primary
            BEFORE INSERT OR UPDATE ON public.driver_vehicles
            FOR EACH ROW
            EXECUTE FUNCTION ensure_single_primary_vehicle();

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250625180052');
    END IF;
END $$;

-- 9. Messaging System (20250625195323)
DO $$
BEGIN
    IF NOT migration_exists('20250625195323') THEN
        -- Create conversations table
        CREATE TABLE IF NOT EXISTS public.conversations (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            match_id UUID NOT NULL REFERENCES public.trip_request_matches(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create messages table
        CREATE TABLE IF NOT EXISTS public.conversation_messages (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX idx_conversations_match_id ON public.conversations(match_id);
        CREATE INDEX idx_messages_conversation_id ON public.conversation_messages(conversation_id);
        CREATE INDEX idx_messages_sender_id ON public.conversation_messages(sender_id);
        CREATE INDEX idx_messages_is_read ON public.conversation_messages(is_read);

        -- Enable RLS
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can view their conversations"
            ON public.conversations
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.trip_request_matches m
                    JOIN public.driver_trips t ON t.id = m.trip_id
                    JOIN public.passenger_requests r ON r.id = m.request_id
                    WHERE m.id = conversations.match_id
                    AND (t.driver_id = auth.uid() OR r.passenger_id = auth.uid())
                )
            );

        CREATE POLICY "Users can view and send messages in their conversations"
            ON public.conversation_messages
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.conversations c
                    JOIN public.trip_request_matches m ON m.id = c.match_id
                    JOIN public.driver_trips t ON t.id = m.trip_id
                    JOIN public.passenger_requests r ON r.id = m.request_id
                    WHERE c.id = conversation_messages.conversation_id
                    AND (t.driver_id = auth.uid() OR r.passenger_id = auth.uid())
                )
            );

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250625195323');
    END IF;
END $$;

-- 10. Points and Rewards System (20250625212832)
DO $$
BEGIN
    IF NOT migration_exists('20250625212832') THEN
        -- Create user points table
        CREATE TABLE IF NOT EXISTS public.user_points (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
            available_points INTEGER NOT NULL DEFAULT 0 CHECK (available_points >= 0),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(user_id)
        );

        -- Create points transactions table
        CREATE TABLE IF NOT EXISTS public.points_transactions (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            points INTEGER NOT NULL,
            transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired', 'bonus')),
            description TEXT NOT NULL,
            reference_type TEXT CHECK (reference_type IN ('trip', 'referral', 'reward', 'promo')),
            reference_id UUID,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create rewards catalog table
        CREATE TABLE IF NOT EXISTS public.rewards_catalog (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            points_cost INTEGER NOT NULL CHECK (points_cost > 0),
            category TEXT CHECK (category IN ('discount', 'free_ride', 'merchandise', 'charity')),
            value_amount DECIMAL(10, 2),
            stock_quantity INTEGER,
            is_active BOOLEAN DEFAULT true,
            valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
            valid_until TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create user rewards table
        CREATE TABLE IF NOT EXISTS public.user_rewards (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            reward_id UUID NOT NULL REFERENCES public.rewards_catalog(id),
            points_spent INTEGER NOT NULL,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
            code TEXT UNIQUE,
            used_at TIMESTAMP WITH TIME ZONE,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Create referral tracking table
        CREATE TABLE IF NOT EXISTS public.referral_tracking (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            referral_code TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
            referrer_points_earned INTEGER DEFAULT 0,
            referred_points_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            completed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(referred_id)
        );

        -- Create indexes
        CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
        CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
        CREATE INDEX idx_points_transactions_type ON public.points_transactions(transaction_type);
        CREATE INDEX idx_rewards_catalog_active ON public.rewards_catalog(is_active);
        CREATE INDEX idx_user_rewards_user_id ON public.user_rewards(user_id);
        CREATE INDEX idx_user_rewards_status ON public.user_rewards(status);
        CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
        CREATE INDEX idx_referral_tracking_referred ON public.referral_tracking(referred_id);
        CREATE INDEX idx_referral_tracking_code ON public.referral_tracking(referral_code);

        -- Enable RLS
        ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can view their own points"
            ON public.user_points
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can view their own transactions"
            ON public.points_transactions
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Everyone can view active rewards"
            ON public.rewards_catalog
            FOR SELECT
            USING (is_active = true);

        CREATE POLICY "Users can view and manage their rewards"
            ON public.user_rewards
            FOR ALL
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can view their referrals"
            ON public.referral_tracking
            FOR SELECT
            USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

        -- Function to update user points
        CREATE OR REPLACE FUNCTION update_user_points()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                INSERT INTO public.user_points (user_id, total_points, available_points)
                VALUES (NEW.user_id, 
                    CASE WHEN NEW.transaction_type = 'spent' THEN 0 ELSE NEW.points END,
                    CASE WHEN NEW.transaction_type = 'spent' THEN 0 ELSE NEW.points END
                )
                ON CONFLICT (user_id) DO UPDATE
                SET total_points = user_points.total_points + 
                    CASE WHEN NEW.transaction_type = 'spent' THEN 0 ELSE NEW.points END,
                    available_points = user_points.available_points + 
                    CASE WHEN NEW.transaction_type = 'spent' THEN -NEW.points ELSE NEW.points END,
                    updated_at = now();
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_points_on_transaction
            AFTER INSERT ON public.points_transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_user_points();

        -- Add update triggers
        CREATE TRIGGER user_points_updated_at
            BEFORE UPDATE ON public.user_points
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER rewards_catalog_updated_at
            BEFORE UPDATE ON public.rewards_catalog
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20250625212832');
    END IF;
END $$;

-- Continue with remaining migrations...
-- Note: Due to length, run this script first, then run consolidated-migration-part3.sql

-- Clean up migration helper function
DROP FUNCTION IF EXISTS migration_exists(text);

-- Intermediate message
DO $$
BEGIN
    RAISE NOTICE 'Part 2 migrations completed. Please run consolidated-migration-part3.sql next.';
END $$; 