-- Add visibility field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS visible_to_parents BOOLEAN DEFAULT true;

-- Update existing events to be visible by default
UPDATE events SET visible_to_parents = true WHERE visible_to_parents IS NULL;

-- Add comment to explain the field
COMMENT ON COLUMN events.visible_to_parents IS 'Controls whether this event is visible to parents in their dashboard';
