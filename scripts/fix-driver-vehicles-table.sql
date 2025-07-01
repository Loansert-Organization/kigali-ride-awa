-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS public.driver_vehicles CASCADE;

-- Create driver_vehicles table with correct structure
CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('moto', 'car', 'tuktuk', 'minibus')),
    license_plate TEXT NOT NULL,
    model TEXT DEFAULT '',
    color TEXT DEFAULT '',
    year INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_driver_license UNIQUE(driver_id, license_plate)
);

-- Create indexes for performance
CREATE INDEX idx_driver_vehicles_driver_id ON public.driver_vehicles(driver_id);
CREATE INDEX idx_driver_vehicles_license_plate ON public.driver_vehicles(license_plate);
CREATE INDEX idx_driver_vehicles_active ON public.driver_vehicles(is_active);

-- Enable RLS
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Drivers can view own vehicles" ON public.driver_vehicles;
DROP POLICY IF EXISTS "Drivers can insert own vehicles" ON public.driver_vehicles;
DROP POLICY IF EXISTS "Drivers can update own vehicles" ON public.driver_vehicles;
DROP POLICY IF EXISTS "Drivers can delete own vehicles" ON public.driver_vehicles;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.driver_vehicles;

-- Create simple policy for authenticated users (including anonymous)
CREATE POLICY "Enable all access for authenticated users" 
ON public.driver_vehicles 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update the updated_at column
DROP TRIGGER IF EXISTS update_driver_vehicles_updated_at ON public.driver_vehicles;
CREATE TRIGGER update_driver_vehicles_updated_at 
BEFORE UPDATE ON public.driver_vehicles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.driver_vehicles TO authenticated;
GRANT ALL ON public.driver_vehicles TO anon; 