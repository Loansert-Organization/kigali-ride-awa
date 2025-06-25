
-- Create driver_profiles table
CREATE TABLE public.driver_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_type TEXT CHECK (vehicle_type IN ('moto', 'car', 'tuktuk', 'minibus')) NOT NULL,
  plate_number TEXT NOT NULL,
  preferred_zone TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('passenger', 'driver')) NOT NULL,
  from_location TEXT NOT NULL,
  from_lat FLOAT,
  from_lng FLOAT,
  to_location TEXT NOT NULL,
  to_lat FLOAT,
  to_lng FLOAT,
  vehicle_type TEXT CHECK (vehicle_type IN ('moto', 'car', 'tuktuk', 'minibus')) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fare NUMERIC(10,2),
  is_negotiable BOOLEAN DEFAULT true,
  seats_available INTEGER DEFAULT 1,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'matched', 'expired', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  driver_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  whatsapp_launched BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_referrals table
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referee_role TEXT CHECK (referee_role IN ('passenger', 'driver')) NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  validation_status TEXT CHECK (validation_status IN ('pending', 'valid', 'rejected')) DEFAULT 'pending',
  reward_week DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_rewards table
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week DATE NOT NULL,
  points INTEGER DEFAULT 0,
  reward_issued BOOLEAN DEFAULT false,
  reward_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week)
);

-- Create trip_heatmap_logs table
CREATE TABLE public.trip_heatmap_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('passenger', 'driver')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('late', 'no-show', 'wrong-car', 'feedback', 'safety', 'other')) NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_heatmap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_profiles
CREATE POLICY "Drivers can view their own profile" 
  ON public.driver_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert their own profile" 
  ON public.driver_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile" 
  ON public.driver_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for trips
CREATE POLICY "Users can view all trips" 
  ON public.trips 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own trips" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
  ON public.trips 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
  ON public.trips 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view bookings involving their trips" 
  ON public.bookings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE (trips.id = passenger_trip_id OR trips.id = driver_trip_id) 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bookings for their trips" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE (trips.id = passenger_trip_id OR trips.id = driver_trip_id) 
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON public.favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" 
  ON public.favorites 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_referrals
CREATE POLICY "Users can view referrals they're involved in" 
  ON public.user_referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can insert referrals as referrer" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trip_heatmap_logs (public data for analytics)
CREATE POLICY "Anyone can view heatmap logs" 
  ON public.trip_heatmap_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert heatmap logs for their trips" 
  ON public.trip_heatmap_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_id AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for incidents
CREATE POLICY "Users can view their own incidents" 
  ON public.incidents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incidents" 
  ON public.incidents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers for all tables
CREATE TRIGGER driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
