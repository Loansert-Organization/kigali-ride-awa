# VEHICLE SAVING - FINAL COMPLETE FIX

## THE PROBLEM
When a driver saves a vehicle, it was NOT being saved to Supabase database. This caused CreateTrip to fail because it couldn't find any vehicles.

## ROOT CAUSES
1. **Wrong API approach** - Using Edge Functions instead of direct Supabase
2. **Wrong localStorage key** - Saving to 'vehicle' but CreateTrip expects 'driverVehicle'
3. **Missing database table** - driver_vehicles table might not exist
4. **RLS policies** - Too restrictive, blocking anonymous users

## THE SOLUTION

### 1. Direct Supabase Saving (VehicleSetup.tsx)
```javascript
// DIRECT save to Supabase - no Edge Functions!
const { data, error } = await supabase
  .from('driver_vehicles')
  .insert(vehicleData)
  .select()
  .single();
```

### 2. Correct localStorage Key
```javascript
// Save with the EXACT key CreateTrip expects
localStorage.setItem('driverVehicle', JSON.stringify(data));
```

### 3. Database Table Creation
Run this SQL in Supabase SQL Editor:

```sql
-- Re-create driver_vehicles with correct structure
DROP TABLE IF EXISTS public.driver_vehicles CASCADE;

CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('moto','car','tuktuk','minibus')),
    license_plate TEXT NOT NULL,
    model TEXT DEFAULT '',
    color TEXT DEFAULT '',
    year  INTEGER,
    is_active   BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_driver_license UNIQUE (driver_id, license_plate)
);

-- Performance indexes
CREATE INDEX idx_driver_vehicles_driver_id   ON public.driver_vehicles(driver_id);
CREATE INDEX idx_driver_vehicles_license_plate ON public.driver_vehicles(license_plate);
CREATE INDEX idx_driver_vehicles_active      ON public.driver_vehicles(is_active);

-- Enable RLS and allow any authenticated user (incl. anonymous)
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.driver_vehicles;

CREATE POLICY "Enable all access for authenticated users"
ON public.driver_vehicles
FOR ALL
USING     (auth.uid() IS NOT NULL)
WITH CHECK(auth.uid() IS NOT NULL);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_driver_vehicles_updated_at ON public.driver_vehicles;
CREATE TRIGGER update_driver_vehicles_updated_at
BEFORE UPDATE ON public.driver_vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant to anon & authenticated
GRANT ALL ON public.driver_vehicles TO authenticated;
GRANT ALL ON public.driver_vehicles TO anon;
```