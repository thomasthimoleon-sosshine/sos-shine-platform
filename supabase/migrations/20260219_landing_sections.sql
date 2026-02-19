-- ─── Landing Sections (CMS pour la landing page) ───
CREATE TABLE IF NOT EXISTS landing_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key   TEXT UNIQUE NOT NULL,
  label         TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  content       JSONB NOT NULL DEFAULT '{}',
  styles        JSONB NOT NULL DEFAULT '{}',
  updated_by    UUID REFERENCES profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_sections_position ON landing_sections(position);

-- RLS
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- Lecture publique (landing visible par tous)
CREATE POLICY "landing_sections_select"
  ON landing_sections FOR SELECT USING (true);

-- Écriture réservée aux admins
CREATE POLICY "landing_sections_insert"
  ON landing_sections FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

CREATE POLICY "landing_sections_update"
  ON landing_sections FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

CREATE POLICY "landing_sections_delete"
  ON landing_sections FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );
