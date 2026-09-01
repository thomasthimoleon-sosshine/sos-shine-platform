-- ─── A/B Testing: Landing Page Variants ───
-- Adds variant support to landing_sections and creates ab_test_visits tracking table

-- 1. Add variant column to landing_sections
-- 'julia' = Landing Page Julia (existing content)
-- 'thomas' = Landing Page Thomas (new variant)
ALTER TABLE landing_sections ADD COLUMN IF NOT EXISTS variant TEXT NOT NULL DEFAULT 'julia';

-- Drop the unique constraint on section_key (now section_key + variant is unique)
ALTER TABLE landing_sections DROP CONSTRAINT IF EXISTS landing_sections_section_key_key;

-- Create new unique constraint on (section_key, variant)
ALTER TABLE landing_sections ADD CONSTRAINT landing_sections_section_key_variant_key UNIQUE (section_key, variant);

-- 2. Create ab_test_visits table for tracking conversions
CREATE TABLE IF NOT EXISTS ab_test_visits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id   TEXT NOT NULL,           -- Cookie-based persistent visitor ID
  variant      TEXT NOT NULL,           -- 'julia' or 'thomas'
  visitor_ip   TEXT,                    -- Hashed IP for unique counting
  user_agent   TEXT,                    -- For device type detection
  referrer     TEXT,                    -- Traffic source
  visited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted    BOOLEAN NOT NULL DEFAULT false,  -- Did they sign up?
  converted_at TIMESTAMPTZ,            -- When did they convert?
  conversion_type TEXT                  -- 'signup', 'test_started', 'test_completed', 'subscription'
);

CREATE INDEX IF NOT EXISTS idx_ab_test_visits_variant ON ab_test_visits(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_visits_visited_at ON ab_test_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_visits_visitor_id ON ab_test_visits(visitor_id);

-- RLS for ab_test_visits
ALTER TABLE ab_test_visits ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can be tracked)
CREATE POLICY "ab_test_visits_insert" ON ab_test_visits
  FOR INSERT WITH CHECK (true);

-- Admin read
CREATE POLICY "ab_test_visits_select" ON ab_test_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );

-- 3. Create ab_test_config table for controlling the split
CREATE TABLE IF NOT EXISTS ab_test_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name    TEXT UNIQUE NOT NULL DEFAULT 'landing_page',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  split_ratio  NUMERIC(3,2) NOT NULL DEFAULT 0.50,  -- 0.50 = 50/50
  variant_a    TEXT NOT NULL DEFAULT 'julia',
  variant_b    TEXT NOT NULL DEFAULT 'thomas',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID REFERENCES profiles(id),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ab_test_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_test_config_select" ON ab_test_config
  FOR SELECT USING (true);

CREATE POLICY "ab_test_config_update" ON ab_test_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

CREATE POLICY "ab_test_config_insert" ON ab_test_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

-- Insert default config (A/B testing OFF by default until Thomas activates)
INSERT INTO ab_test_config (test_name, is_active, split_ratio, variant_a, variant_b)
VALUES ('landing_page', false, 0.50, 'julia', 'thomas')
ON CONFLICT (test_name) DO NOTHING;

-- 4. Clone existing Julia sections into Thomas variant
INSERT INTO landing_sections (section_key, label, position, is_visible, content, styles, variant, updated_at)
SELECT section_key, label, position, is_visible, content, styles, 'thomas', now()
FROM landing_sections
WHERE variant = 'julia'
ON CONFLICT (section_key, variant) DO NOTHING;
