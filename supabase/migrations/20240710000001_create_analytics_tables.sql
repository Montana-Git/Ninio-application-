-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_role TEXT,
  page_path TEXT,
  component TEXT,
  action TEXT,
  target_id TEXT,
  target_type TEXT,
  value NUMERIC,
  duration NUMERIC,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);

-- Create analytics_sessions table to track user sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration NUMERIC,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  referrer TEXT,
  landing_page TEXT,
  exit_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS analytics_sessions_session_id_idx ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS analytics_sessions_user_id_idx ON analytics_sessions(user_id);

-- Create analytics_page_views table for detailed page view tracking
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  time_spent NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS analytics_page_views_session_id_idx ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS analytics_page_views_user_id_idx ON analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS analytics_page_views_page_path_idx ON analytics_page_views(page_path);

-- Create analytics_feature_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS analytics_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feature_name TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS analytics_feature_usage_session_id_idx ON analytics_feature_usage(session_id);
CREATE INDEX IF NOT EXISTS analytics_feature_usage_user_id_idx ON analytics_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS analytics_feature_usage_feature_name_idx ON analytics_feature_usage(feature_name);

-- Create RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics data
CREATE POLICY "Admins can read analytics events" 
  ON analytics_events FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can read analytics sessions" 
  ON analytics_sessions FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can read analytics page views" 
  ON analytics_page_views FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can read analytics feature usage" 
  ON analytics_feature_usage FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Anyone can insert analytics data
CREATE POLICY "Anyone can insert analytics events" 
  ON analytics_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics sessions" 
  ON analytics_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics page views" 
  ON analytics_page_views FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics feature usage" 
  ON analytics_feature_usage FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for analytics tables
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_feature_usage;
