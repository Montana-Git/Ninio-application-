-- Add sample activities and events for testing

-- First, check if the child_activities table exists, if not create it
CREATE TABLE IF NOT EXISTS child_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add visible_to_parents column to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'visible_to_parents'
  ) THEN
    ALTER TABLE events ADD COLUMN visible_to_parents BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Insert sample activities one by one with individual conflict handling
INSERT INTO activities (id, name, description, age_group, duration, date, image_url, category)
VALUES ('11111111-1111-1111-1111-111111111111', 'Painting Class', 'Children learn to paint with watercolors', '3-5', '1 hour', CURRENT_DATE - INTERVAL '7 days', 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80', 'Art')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, name, description, age_group, duration, date, image_url, category)
VALUES ('22222222-2222-2222-2222-222222222222', 'Story Time', 'Reading classic children stories', '3-6', '30 minutes', CURRENT_DATE - INTERVAL '5 days', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', 'Reading')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, name, description, age_group, duration, date, image_url, category)
VALUES ('33333333-3333-3333-3333-333333333333', 'Music and Movement', 'Dancing and singing to children songs', '3-6', '45 minutes', CURRENT_DATE - INTERVAL '3 days', 'https://images.unsplash.com/photo-1445743432342-eac500ce72b7?w=600&q=80', 'Music')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, name, description, age_group, duration, date, image_url, category)
VALUES ('sample-activity-science', 'Science Experiments', 'Simple and fun science experiments', '4-6', '1 hour', CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80', 'Science')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities (id, name, description, age_group, duration, date, image_url, category)
VALUES ('55555555-5555-5555-5555-555555555555', 'Outdoor Play', 'Structured outdoor activities', '3-6', '1 hour', CURRENT_DATE - INTERVAL '1 day', 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&q=80', 'Physical')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, title, date, time, description, location, type, visible_to_parents)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Parent-Teacher Meeting', CURRENT_DATE + INTERVAL '7 days', '15:00', 'Discuss your child''s progress', 'Main Hall', 'meeting', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Summer Festival', CURRENT_DATE + INTERVAL '14 days', '10:00', 'Annual summer celebration with games and food', 'Kindergarten Playground', 'activity', TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Art Exhibition', CURRENT_DATE + INTERVAL '21 days', '14:00', 'Display of children''s artwork', 'Art Room', 'activity', TRUE),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'End of Term', CURRENT_DATE + INTERVAL '30 days', '00:00', 'Last day of the term', 'Kindergarten', 'holiday', TRUE),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Staff Training Day', CURRENT_DATE + INTERVAL '10 days', '09:00', 'No children in attendance', 'Kindergarten', 'holiday', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Function to link activities to children
CREATE OR REPLACE FUNCTION link_activities_to_children() RETURNS VOID AS $$
DECLARE
  child_rec RECORD;
  activity_rec RECORD;
  activity_count INTEGER;
  i INTEGER;
BEGIN
  -- Get count of activities
  SELECT COUNT(*) INTO activity_count FROM activities;

  -- Exit if no activities or no children
  IF activity_count = 0 THEN
    RAISE NOTICE 'No activities found to link';
    RETURN;
  END IF;

  -- For each child, link to 2-3 random activities
  FOR child_rec IN SELECT id FROM children LOOP
    -- Random number of activities (2-3)
    i := floor(random() * 2) + 2;

    RAISE NOTICE 'Linking % activities to child %', i, child_rec.id;

    -- Link random activities
    FOR activity_rec IN
      SELECT id FROM activities ORDER BY random() LIMIT i
    LOOP
      -- Insert with random date in the last 30 days
      INSERT INTO child_activities (child_id, activity_id, date)
      VALUES (
        child_rec.id,
        activity_rec.id,
        CURRENT_DATE - (floor(random() * 30) || ' days')::INTERVAL
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to link activities to children
SELECT link_activities_to_children();
