-- Add children_count column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0;

-- Add children_names column to users table (JSON array of names)
ALTER TABLE users ADD COLUMN IF NOT EXISTS children_names JSONB DEFAULT '[]'::jsonb;

-- Enable realtime for users table
alter publication supabase_realtime add table users;