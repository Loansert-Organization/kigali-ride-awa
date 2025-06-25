
-- Create admin_trip_flags table for tracking flagged trips
CREATE TABLE public.admin_trip_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  admin_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  flag_reason TEXT NOT NULL,
  flag_type TEXT CHECK (flag_type IN ('suspicious', 'cancelled', 'disputed', 'other')) DEFAULT 'other',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_trip_flags
ALTER TABLE public.admin_trip_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin_trip_flags (admin only)
CREATE POLICY "Admins can manage trip flags" 
  ON public.admin_trip_flags 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger for admin_trip_flags
CREATE TRIGGER admin_trip_flags_updated_at
  BEFORE UPDATE ON public.admin_trip_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_admin_trip_flags_trip_id ON public.admin_trip_flags(trip_id);
CREATE INDEX idx_admin_trip_flags_admin_user_id ON public.admin_trip_flags(admin_user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_role ON public.trips(role);
CREATE INDEX idx_trips_scheduled_time ON public.trips(scheduled_time);
