-- Drop the existing RLS policy for users table
DROP POLICY IF EXISTS "Users can only view and update their own data" ON "public"."users";

-- Create a more permissive policy for the users table
CREATE POLICY "Enable insert for authenticated users" 
ON "public"."users"
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view and update their own data" 
ON "public"."users"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
ON "public"."users"
FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage all users
CREATE POLICY "Service role can manage all users" 
ON "public"."users"
FOR ALL 
TO service_role
USING (true);
