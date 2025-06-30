-- AI Trip Assistant Tables

-- 1. User Trip History (for learning patterns)
CREATE TABLE public.user_trip_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('driver', 'passenger')) NOT NULL,
  origin_text TEXT NOT NULL,
  origin_lat FLOAT,
  origin_lng FLOAT,
  dest_text TEXT NOT NULL,
  dest_lat FLOAT,
  dest_lng FLOAT,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  vehicle_type TEXT,
  seats INTEGER DEFAULT 1,
  fare_amount INTEGER,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- For embeddings and similarity search
  route_embedding vector(1536),
  time_pattern TEXT -- e.g., 'weekday_morning', 'weekend_evening'
);

-- 2. AI Draft Trips (proactive suggestions)
CREATE TABLE public.ai_draft_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  payload JSONB NOT NULL,
  generated_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Additional metadata
  confidence_score FLOAT DEFAULT 0.0,
  suggestion_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours')
);

-- 3. Dialog Messages (chat history)
CREATE TABLE public.dialog_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB, -- Store function calls, context, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. AI Threads (for persistent conversations)
CREATE TABLE public.ai_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  openai_thread_id TEXT UNIQUE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Voice Transcriptions (for audio inputs)
CREATE TABLE public.voice_transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  audio_url TEXT,
  transcription TEXT,
  language TEXT DEFAULT 'en',
  duration_seconds FLOAT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_user_trip_history_user_id ON public.user_trip_history(user_id);
CREATE INDEX idx_user_trip_history_departure ON public.user_trip_history(departure_time);
CREATE INDEX idx_user_trip_history_time_pattern ON public.user_trip_history(time_pattern);
CREATE INDEX idx_ai_draft_trips_user_status ON public.ai_draft_trips(user_id, status);
CREATE INDEX idx_dialog_messages_user_created ON public.dialog_messages(user_id, created_at);

-- Enable vector extension for embeddings (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector index for similarity search
CREATE INDEX idx_trip_history_embedding ON public.user_trip_history 
USING ivfflat (route_embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS Policies
ALTER TABLE public.user_trip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_draft_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialog_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- User Trip History policies
CREATE POLICY "Users can view their own trip history"
  ON public.user_trip_history FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own trip history"
  ON public.user_trip_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

-- AI Draft Trips policies
CREATE POLICY "Users can view their own draft trips"
  ON public.ai_draft_trips FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own draft trips"
  ON public.ai_draft_trips FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "System can insert draft trips"
  ON public.ai_draft_trips FOR INSERT
  WITH CHECK (true); -- Edge functions use service role

-- Dialog Messages policies
CREATE POLICY "Users can view their own messages"
  ON public.dialog_messages FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own messages"
  ON public.dialog_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

-- AI Threads policies
CREATE POLICY "Users can manage their own threads"
  ON public.ai_threads FOR ALL
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

-- Voice Transcriptions policies
CREATE POLICY "Users can manage their own transcriptions"
  ON public.voice_transcriptions FOR ALL
  USING (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

-- Helper functions for AI features

-- Function to extract time pattern from timestamp
CREATE OR REPLACE FUNCTION get_time_pattern(ts TIMESTAMP WITH TIME ZONE)
RETURNS TEXT AS $$
DECLARE
  hour_of_day INTEGER;
  day_of_week INTEGER;
  time_slot TEXT;
  day_type TEXT;
BEGIN
  hour_of_day := EXTRACT(HOUR FROM ts);
  day_of_week := EXTRACT(DOW FROM ts);
  
  -- Determine time slot
  IF hour_of_day >= 5 AND hour_of_day < 9 THEN
    time_slot := 'morning';
  ELSIF hour_of_day >= 9 AND hour_of_day < 12 THEN
    time_slot := 'late_morning';
  ELSIF hour_of_day >= 12 AND hour_of_day < 14 THEN
    time_slot := 'lunch';
  ELSIF hour_of_day >= 14 AND hour_of_day < 17 THEN
    time_slot := 'afternoon';
  ELSIF hour_of_day >= 17 AND hour_of_day < 20 THEN
    time_slot := 'evening';
  ELSIF hour_of_day >= 20 AND hour_of_day < 23 THEN
    time_slot := 'night';
  ELSE
    time_slot := 'late_night';
  END IF;
  
  -- Determine day type
  IF day_of_week IN (0, 6) THEN
    day_type := 'weekend';
  ELSE
    day_type := 'weekday';
  END IF;
  
  RETURN day_type || '_' || time_slot;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find similar trips using embeddings
CREATE OR REPLACE FUNCTION find_similar_trips(
  p_user_id UUID,
  p_embedding vector(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  origin_text TEXT,
  dest_text TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.origin_text,
    h.dest_text,
    h.departure_time,
    1 - (h.route_embedding <=> p_embedding) as similarity_score
  FROM public.user_trip_history h
  WHERE h.user_id = p_user_id
    AND h.route_embedding IS NOT NULL
  ORDER BY h.route_embedding <=> p_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's routine patterns
CREATE OR REPLACE FUNCTION get_user_routines(p_user_id UUID)
RETURNS TABLE(
  time_pattern TEXT,
  common_origin TEXT,
  common_dest TEXT,
  trip_count INTEGER,
  avg_departure_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.time_pattern,
    mode() WITHIN GROUP (ORDER BY h.origin_text) as common_origin,
    mode() WITHIN GROUP (ORDER BY h.dest_text) as common_dest,
    COUNT(*)::INTEGER as trip_count,
    AVG(h.departure_time::TIME)::TIME as avg_departure_time
  FROM public.user_trip_history h
  WHERE h.user_id = p_user_id
    AND h.created_at > now() - INTERVAL '30 days'
  GROUP BY h.time_pattern
  HAVING COUNT(*) >= 2
  ORDER BY trip_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate time pattern
CREATE OR REPLACE FUNCTION set_time_pattern()
RETURNS TRIGGER AS $$
BEGIN
  NEW.time_pattern := get_time_pattern(NEW.departure_time);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_trip_time_pattern
  BEFORE INSERT OR UPDATE ON public.user_trip_history
  FOR EACH ROW
  EXECUTE FUNCTION set_time_pattern();

-- Trigger to auto-expire old draft trips
CREATE OR REPLACE FUNCTION expire_old_drafts()
RETURNS void AS $$
BEGIN
  UPDATE public.ai_draft_trips
  SET status = 'dismissed'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to expire drafts (call from cron edge function) 