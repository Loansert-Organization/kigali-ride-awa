-- Create driver_vehicles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vehicle_type public.vehicle_type NOT NULL,
    license_plate TEXT NOT NULL,
    model TEXT DEFAULT '',
    color TEXT DEFAULT '',
    year INTEGER,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(driver_id, license_plate)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_driver_id ON public.driver_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_license_plate ON public.driver_vehicles(license_plate);

-- Enable RLS
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drivers can view their own vehicles
CREATE POLICY "Drivers can view own vehicles" 
ON public.driver_vehicles 
FOR SELECT 
USING (
    driver_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
    )
);

-- Drivers can insert their own vehicles
CREATE POLICY "Drivers can insert own vehicles" 
ON public.driver_vehicles 
FOR INSERT 
WITH CHECK (
    driver_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
    )
);

-- Drivers can update their own vehicles
CREATE POLICY "Drivers can update own vehicles" 
ON public.driver_vehicles 
FOR UPDATE 
USING (
    driver_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
    )
);

-- Drivers can delete their own vehicles
CREATE POLICY "Drivers can delete own vehicles" 
ON public.driver_vehicles 
FOR DELETE 
USING (
    driver_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
    )
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update the updated_at column
CREATE TRIGGER update_driver_vehicles_updated_at 
BEFORE UPDATE ON public.driver_vehicles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column(); 