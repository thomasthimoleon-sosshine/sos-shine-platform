-- ═══════════════════════════════════════════════════════
-- Dynamic steps for douleurs (challenges émotionnels)
-- Allows unlimited steps instead of hardcoded 3
-- ═══════════════════════════════════════════════════════

-- Table for dynamic steps per douleur
CREATE TABLE IF NOT EXISTS douleur_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  douleur_id UUID NOT NULL REFERENCES douleurs(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT '#D4AF37',
  video_url TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  image_url TEXT,
  exercise_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(douleur_id, step_number)
);

-- Add steps_completed JSONB to user_progress for dynamic step tracking
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS steps_completed JSONB DEFAULT '{}'::jsonb;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_douleur_steps_douleur_id ON douleur_steps(douleur_id);
CREATE INDEX IF NOT EXISTS idx_douleur_steps_order ON douleur_steps(douleur_id, step_number);

-- RLS policies
ALTER TABLE douleur_steps ENABLE ROW LEVEL SECURITY;

-- Everyone can read steps
CREATE POLICY "douleur_steps_select_all" ON douleur_steps
  FOR SELECT USING (true);

-- Admins can insert/update/delete
CREATE POLICY "douleur_steps_insert_admin" ON douleur_steps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "douleur_steps_update_admin" ON douleur_steps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "douleur_steps_delete_admin" ON douleur_steps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_douleur_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_douleur_steps_updated_at
  BEFORE UPDATE ON douleur_steps
  FOR EACH ROW EXECUTE FUNCTION update_douleur_steps_updated_at();
