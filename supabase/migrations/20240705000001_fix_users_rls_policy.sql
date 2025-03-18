-- Fix the RLS policy for the users table to allow new user registration
-- This migration adds a policy that allows inserting new users

-- First, drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data." ON public.users;
DROP POLICY IF EXISTS "Admins can view all users." ON public.users;

-- Enable RLS on the users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view their own data." 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
-- This is the critical policy for registration
CREATE POLICY "Users can insert their own data." 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policy to allow admins to view all users
CREATE POLICY "Admins can view all users." 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policy to allow service role to insert users
-- This is needed for the registration process
CREATE POLICY "Service role can insert users." 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Grant necessary permissions to authenticated and anon roles
GRANT SELECT, INSERT ON public.users TO authenticated, anon;
