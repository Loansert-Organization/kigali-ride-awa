
-- First, drop ALL existing policies to ensure clean slate
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies from users table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.users';
    END LOOP;
    
    -- Drop all policies from driver_profiles table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'driver_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.driver_profiles';
    END LOOP;
    
    -- Drop all policies from trips table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'trips' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.trips';
    END LOOP;
    
    -- Drop all policies from bookings table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'bookings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.bookings';
    END LOOP;
    
    -- Drop all policies from favorites table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.favorites';
    END LOOP;
    
    -- Drop all policies from user_referrals table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_referrals' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.user_referrals';
    END LOOP;
    
    -- Drop all policies from user_rewards table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_rewards' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.user_rewards';
    END LOOP;
    
    -- Drop all policies from incidents table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'incidents' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.incidents';
    END LOOP;
    
    -- Drop all policies from trip_heatmap_logs table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'trip_heatmap_logs' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.trip_heatmap_logs';
    END LOOP;
END $$;

-- Now create new policies for anonymous users
-- Users table policies
CREATE POLICY "Anonymous users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Anonymous users can insert their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Anonymous users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = auth_user_id);

-- Driver profiles policies
CREATE POLICY "Anonymous drivers can view their own profile" 
  ON public.driver_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = driver_profiles.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous drivers can insert their own profile" 
  ON public.driver_profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = driver_profiles.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous drivers can update their own profile" 
  ON public.driver_profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = driver_profiles.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Trips policies - allow viewing all trips but only manage own
CREATE POLICY "Anonymous users can view all trips" 
  ON public.trips 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anonymous users can insert their own trips" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = trips.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can update their own trips" 
  ON public.trips 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = trips.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can delete their own trips" 
  ON public.trips 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = trips.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Anonymous users can view bookings involving their trips" 
  ON public.bookings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      JOIN public.users ON users.id = trips.user_id
      WHERE (trips.id = passenger_trip_id OR trips.id = driver_trip_id) 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert bookings for their trips" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      JOIN public.users ON users.id = trips.user_id
      WHERE (trips.id = passenger_trip_id OR trips.id = driver_trip_id) 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Anonymous users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = favorites.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert their own favorites" 
  ON public.favorites 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = favorites.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can update their own favorites" 
  ON public.favorites 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = favorites.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can delete their own favorites" 
  ON public.favorites 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = favorites.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- User referrals policies
CREATE POLICY "Anonymous users can view referrals they're involved in" 
  ON public.user_referrals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (users.id = user_referrals.referrer_id OR users.id = user_referrals.referee_id)
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert referrals as referrer" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = user_referrals.referrer_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- User rewards policies
CREATE POLICY "Anonymous users can view their own rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = user_rewards.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert their own rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = user_rewards.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Incidents policies
CREATE POLICY "Anonymous users can view their own incidents" 
  ON public.incidents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = incidents.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert their own incidents" 
  ON public.incidents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = incidents.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Trip heatmap logs policy (public data for analytics)
CREATE POLICY "Anonymous users can view heatmap logs" 
  ON public.trip_heatmap_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anonymous users can insert heatmap logs for their trips" 
  ON public.trip_heatmap_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      JOIN public.users ON users.id = trips.user_id
      WHERE trips.id = trip_heatmap_logs.trip_id 
      AND users.auth_user_id = auth.uid()
    )
  );
