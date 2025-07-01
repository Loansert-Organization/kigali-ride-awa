-- Allow anonymous users to create passenger trips
DROP POLICY IF EXISTS "Passengers can create their own trip requests." ON "public"."passenger_trips";

CREATE POLICY "Users can create trip requests" ON "public"."passenger_trips" 
FOR INSERT WITH CHECK (
  -- Allow if user is authenticated and creating for themselves
  (auth.uid() = passenger_id) 
  OR 
  -- Allow anonymous users to create trips
  (auth.role() = 'anon' AND passenger_id IS NOT NULL)
);

-- Also fix the select policy to allow anonymous users to view their trips
DROP POLICY IF EXISTS "Passengers can view their own trip requests." ON "public"."passenger_trips";

CREATE POLICY "Users can view trip requests" ON "public"."passenger_trips" 
FOR SELECT USING (
  -- Allow if user is authenticated and viewing their own
  (auth.uid() = passenger_id) 
  OR 
  -- Allow anonymous users with matching session
  (auth.role() = 'anon' AND passenger_id IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'session_id' = current_setting('request.headers', true)::json->>'x-session-id'
  ))
);

-- Do the same for driver trips
DROP POLICY IF EXISTS "Drivers can create their own trips." ON "public"."driver_trips";

CREATE POLICY "Users can create driver trips" ON "public"."driver_trips" 
FOR INSERT WITH CHECK (
  -- Allow if user is authenticated and creating for themselves
  (auth.uid() = driver_id) 
  OR 
  -- Allow anonymous users to create trips
  (auth.role() = 'anon' AND driver_id IS NOT NULL)
); 