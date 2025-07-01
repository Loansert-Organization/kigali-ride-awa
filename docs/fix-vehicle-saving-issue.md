# Fix for Vehicle Saving Issue

## Problem
Vehicles are being saved to localStorage but not to the database because the `driver_vehicles` table is missing.

## Immediate Solution

### 1. Run this SQL in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/ldbzarwjnnsoyoengheg/sql/new

Copy and paste this SQL:

```sql
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
```

Click "Run" to execute the SQL.

### 2. Code Fixes Already Applied

✅ **VehicleSetup.tsx**:
- Saves to localStorage for local sessions
- Creates driver profile if missing
- Retries vehicle creation after driver profile creation

✅ **CreateTrip.tsx**:
- Checks localStorage for vehicles in local sessions
- Falls back to localStorage if database fetch fails
- Handles minimal vehicle data

## How It Works Now

1. **Local Sessions (Development)**:
   - Vehicle saved to localStorage
   - CreateTrip reads from localStorage
   - No database interaction needed

2. **Real Sessions (With Auth)**:
   - Vehicle saved to database via Edge Function
   - Falls back to localStorage if database fails
   - CreateTrip tries database first, then localStorage

## Testing

1. Clear localStorage: `localStorage.clear()`
2. Create a new vehicle in Vehicle Setup
3. Go to Create Trip - vehicle should appear
4. Check localStorage: `localStorage.getItem('driverVehicle')`

## Note

Once you enable signups in Supabase and run the SQL above, vehicles will save to the database properly. 