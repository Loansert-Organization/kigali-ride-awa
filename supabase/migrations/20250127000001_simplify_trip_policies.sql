-- Simplify passenger trips policies to allow any authenticated or anonymous user
DROP POLICY IF EXISTS "Users can create trip requests" ON "public"."passenger_trips";
DROP POLICY IF EXISTS "Users can view trip requests" ON "public"."passenger_trips";

-- Allow anyone to create trips (for testing/demo purposes)
CREATE POLICY "Anyone can create trip requests" ON "public"."passenger_trips" 
FOR INSERT WITH CHECK (true);

-- Allow anyone to view their own trips
CREATE POLICY "Anyone can view trip requests" ON "public"."passenger_trips" 
FOR SELECT USING (true);

-- Same for driver trips
DROP POLICY IF EXISTS "Users can create driver trips" ON "public"."driver_trips";
DROP POLICY IF EXISTS "Authenticated users can see all open trips." ON "public"."driver_trips";
DROP POLICY IF EXISTS "Drivers can view their own trips." ON "public"."driver_trips";

-- Allow anyone to create driver trips
CREATE POLICY "Anyone can create driver trips" ON "public"."driver_trips" 
FOR INSERT WITH CHECK (true);

-- Allow anyone to view driver trips
CREATE POLICY "Anyone can view driver trips" ON "public"."driver_trips" 
FOR SELECT USING (true); 