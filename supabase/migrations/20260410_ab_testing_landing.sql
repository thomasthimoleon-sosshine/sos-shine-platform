-- ═══════════════════════════════════════════════════════════
-- Migration: A/B Testing Landing Pages
-- 1. Add page_version to landing_sections for independent pages
-- 2. Create ab_tests and ab_test_events tables
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Add page_version column ───
ALTER TABLE landing_sections
  ADD COLUMN IF NOT EXISTS page_version TEXT NOT NULL DEFAULT 'julia';

-- Drop old unique on section_key alone, add composite unique
ALTER TABLE landing_sections
  DROP CONSTRAINT IF EXISTS landing_sections_section_key_key;

ALTER TABLE landing_sections
  ADD CONSTRAINT landing_sections_version_key UNIQUE (page_version, section_key);

-- Clone existing Julia rows into Standard version
INSERT INTO landing_sections
  (section_key, label, position, is_visible, content, styles, updated_by, updated_at, page_version)
SELECT
  section_key, label, position, is_visible, content, styles, updated_by, now(), 'standard'
FROM landing_sections
WHERE page_version = 'julia'
ON CONFLICT (page_version, section_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_landing_sections_version_pos
  ON landing_sections(page_version, position);

-- ─── 2. A/B Test configuration ───
CREATE TABLE IF NOT EXISTS ab_tests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  variant_a     TEXT NOT NULL DEFAULT 'julia',
  variant_b     TEXT NOT NULL DEFAULT 'standard',
  split_ratio   NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. A/B Test events (views + conversions) ───
CREATE TABLE IF NOT EXISTS ab_test_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id       UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant       TEXT NOT NULL,
  event_type    TEXT NOT NULL DEFAULT 'view',
  session_id    TEXT,
  user_agent    TEXT,
  referrer      TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ab_events_test
  ON ab_test_events(test_id, variant, event_type);
CREATE INDEX IF NOT EXISTS idx_ab_events_date
  ON ab_test_events(created_at);

-- ─── 4. RLS — ab_tests ───
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_tests_select"  ON ab_tests FOR SELECT USING (true);
CREATE POLICY "ab_tests_insert"  ON ab_tests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder','admin_content'))
);
CREATE POLICY "ab_tests_update"  ON ab_tests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder','admin_content'))
);
CREATE POLICY "ab_tests_delete"  ON ab_tests FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder','admin_content'))
);

-- ─── 5. RLS — ab_test_events ───
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_events_select" ON ab_test_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder','admin_content'))
);
-- Public insert so anonymous visitors can log events
CREATE POLICY "ab_events_insert" ON ab_test_events FOR INSERT WITH CHECK (true);

-- ─── 6. Seed default A/B test ───
INSERT INTO ab_tests (name, variant_a, variant_b, split_ratio, is_active)
SELECT 'Landing Page A/B Test', 'julia', 'standard', 0.50, true
WHERE NOT EXISTS (SELECT 1 FROM ab_tests WHERE name = 'Landing Page A/B Test');
