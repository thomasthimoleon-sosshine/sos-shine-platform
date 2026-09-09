-- Site visits tracking table
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  country TEXT,
  device_type TEXT DEFAULT 'desktop',
  session_id TEXT,
  is_authenticated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_page_path ON site_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON site_visits(user_id);

-- RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (anon + authenticated)
CREATE POLICY "Anyone can insert visits" ON site_visits FOR INSERT WITH CHECK (true);

-- Only admins can read visits
CREATE POLICY "Admins can read visits" ON site_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );
