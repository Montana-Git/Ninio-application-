-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_group TEXT NOT NULL,
  allergies TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  age_group TEXT NOT NULL,
  duration TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holiday', 'activity', 'meeting')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  payment_type TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  category TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create child_activities table (to track which activities a child participates in)
CREATE TABLE IF NOT EXISTS child_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(child_id, activity_id, date)
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  age_group TEXT NOT NULL,
  schedule TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Children policies
DROP POLICY IF EXISTS "Parents can view their own children" ON children;
CREATE POLICY "Parents can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Admins can view all children" ON children;
CREATE POLICY "Admins can view all children"
  ON children FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can insert children" ON children;
CREATE POLICY "Admins can insert children"
  ON children FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update children" ON children;
CREATE POLICY "Admins can update children"
  ON children FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Activities policies
DROP POLICY IF EXISTS "Everyone can view activities" ON activities;
CREATE POLICY "Everyone can view activities"
  ON activities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage activities" ON activities;
CREATE POLICY "Admins can manage activities"
  ON activities FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Events policies
DROP POLICY IF EXISTS "Everyone can view events" ON events;
CREATE POLICY "Everyone can view events"
  ON events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Payments policies
DROP POLICY IF EXISTS "Parents can view their own payments" ON payments;
CREATE POLICY "Parents can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Child activities policies
DROP POLICY IF EXISTS "Parents can view their children's activities" ON child_activities;
CREATE POLICY "Parents can view their children's activities"
  ON child_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM children
    WHERE children.id = child_activities.child_id
    AND children.parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can view all child activities" ON child_activities;
CREATE POLICY "Admins can view all child activities"
  ON child_activities FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can manage child activities" ON child_activities;
CREATE POLICY "Admins can manage child activities"
  ON child_activities FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Programs policies
DROP POLICY IF EXISTS "Everyone can view programs" ON programs;
CREATE POLICY "Everyone can view programs"
  ON programs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Facilities policies
DROP POLICY IF EXISTS "Everyone can view facilities" ON facilities;
CREATE POLICY "Everyone can view facilities"
  ON facilities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage facilities" ON facilities;
CREATE POLICY "Admins can manage facilities"
  ON facilities FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Enable realtime for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table children;
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table child_activities;
alter publication supabase_realtime add table programs;
alter publication supabase_realtime add table facilities;

-- Create functions
CREATE OR REPLACE FUNCTION get_child_activities(child_id UUID)
RETURNS TABLE (
  activity_id UUID,
  activity_name TEXT,
  activity_description TEXT,
  activity_date DATE,
  age_group TEXT,
  duration TEXT,
  image_url TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.name as activity_name,
    a.description as activity_description,
    ca.date as activity_date,
    a.age_group,
    a.duration,
    a.image_url,
    a.category
  FROM child_activities ca
  JOIN activities a ON ca.activity_id = a.id
  WHERE ca.child_id = get_child_activities.child_id
  ORDER BY ca.date DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_parent_payments(parent_id UUID)
RETURNS TABLE (
  payment_id UUID,
  child_name TEXT,
  amount DECIMAL(10, 2),
  date DATE,
  due_date DATE,
  status TEXT,
  payment_type TEXT,
  payment_method TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as payment_id,
    CONCAT(c.first_name, ' ', c.last_name) as child_name,
    p.amount,
    p.date,
    p.due_date,
    p.status,
    p.payment_type,
    p.payment_method,
    p.category
  FROM payments p
  LEFT JOIN children c ON p.child_id = c.id
  WHERE p.parent_id = get_parent_payments.parent_id
  ORDER BY p.date DESC;
END;
$$ LANGUAGE plpgsql;
