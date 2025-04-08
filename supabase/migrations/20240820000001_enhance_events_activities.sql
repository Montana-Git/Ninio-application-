-- Add additional fields to events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS visible_to_parents BOOLEAN DEFAULT TRUE;

-- Add additional fields to activities table
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS instructor TEXT,
  ADD COLUMN IF NOT EXISTS visible_to_parents BOOLEAN DEFAULT TRUE;

-- Create notifications table for events and activities
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Function to get upcoming events for parents
CREATE OR REPLACE FUNCTION get_parent_events(parent_id UUID)
RETURNS TABLE (
  event_id UUID,
  title TEXT,
  date DATE,
  time TEXT,
  description TEXT,
  location TEXT,
  type TEXT,
  status TEXT,
  image_url TEXT,
  color TEXT,
  icon TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.title,
    e.date,
    e.time,
    e.description,
    e.location,
    e.type,
    e.status,
    e.image_url,
    e.color,
    e.icon
  FROM events e
  WHERE e.visible_to_parents = TRUE
  AND e.date >= CURRENT_DATE
  ORDER BY e.date ASC, e.time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get activities for parents
CREATE OR REPLACE FUNCTION get_parent_activities()
RETURNS TABLE (
  activity_id UUID,
  name TEXT,
  description TEXT,
  age_group TEXT,
  duration TEXT,
  date DATE,
  image_url TEXT,
  category TEXT,
  status TEXT,
  instructor TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.name,
    a.description,
    a.age_group,
    a.duration,
    a.date,
    a.image_url,
    a.category,
    a.status,
    a.instructor
  FROM activities a
  WHERE a.visible_to_parents = TRUE
  ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql;
