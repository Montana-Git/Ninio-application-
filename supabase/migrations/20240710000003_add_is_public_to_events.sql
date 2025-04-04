-- Add is_public column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Update the database types to include the new column
COMMENT ON TABLE events IS 'Events table with public visibility control';
