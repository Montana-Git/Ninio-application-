-- Fix login issues by simplifying RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Allow public access to users for development" ON users;
DROP POLICY IF EXISTS "Allow public access to children for development" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all children" ON children;
DROP POLICY IF EXISTS "Admins can manage children" ON children;

-- Create simpler policies that work reliably
-- Allow authenticated users to view all users (for development purposes)
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all children (for development purposes)
CREATE POLICY "Authenticated users can view all children"
  ON children FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to manage children (for development purposes)
CREATE POLICY "Authenticated users can manage children"
  ON children FOR ALL
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON children TO anon, authenticated;
