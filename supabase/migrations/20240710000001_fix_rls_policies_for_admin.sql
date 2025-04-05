-- Fix RLS policies to allow admins to view and manage all data

-- First, drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all children" ON children;
DROP POLICY IF EXISTS "Admins can manage children" ON children;

-- Create more permissive policies for admins
-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to view all children
CREATE POLICY "Admins can view all children"
  ON children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to manage all children
CREATE POLICY "Admins can manage children"
  ON children FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create a policy to allow public access to users table for development
-- WARNING: This should be removed in production
CREATE POLICY "Allow public access to users for development"
  ON users FOR SELECT
  USING (true);

-- Create a policy to allow public access to children table for development
-- WARNING: This should be removed in production
CREATE POLICY "Allow public access to children for development"
  ON children FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT ON children TO anon, authenticated;
