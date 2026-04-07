-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — A/B Testing Landing Pages
-- Tables pour les variantes de landing page et le suivi des conversions
-- ═══════════════════════════════════════════════════════════════

-- Table des variantes de landing page (chaque variante a ses propres sections)
CREATE TABLE IF NOT EXISTS landing_page_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- ex: 'default', 'julia'
  label TEXT NOT NULL,                 -- ex: 'Landing Page Actuelle', 'Landing Page Julia'
  is_active BOOLEAN DEFAULT true,      -- participe à l'A/B test
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sections de chaque variante (identique à landing_sections mais avec variant_id)
CREATE TABLE IF NOT EXISTS landing_variant_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES landing_page_variants(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  label TEXT NOT NULL,
  position REAL NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  content JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(variant_id, section_key)
);

-- Table de tracking A/B : chaque visite est associée à une variante
CREATE TABLE IF NOT EXISTS ab_test_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_ip TEXT NOT NULL,
  variant_id UUID NOT NULL REFERENCES landing_page_variants(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT now(),
  converted BOOLEAN DEFAULT false,      -- true si inscription/abonnement
  converted_at TIMESTAMPTZ,
  conversion_type TEXT,                 -- 'signup', 'subscription', 'signature_test'
  user_agent TEXT
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_ab_visits_ip ON ab_test_visits(visitor_ip);
CREATE INDEX IF NOT EXISTS idx_ab_visits_variant ON ab_test_visits(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_visits_date ON ab_test_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_landing_variant_sections_variant ON landing_variant_sections(variant_id);

-- Insérer les 2 variantes par défaut
INSERT INTO landing_page_variants (name, label, is_active) VALUES
  ('default', 'Landing Page A (Actuelle)', true),
  ('julia', 'Landing Page Julia (B)', true)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE landing_page_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_variant_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_visits ENABLE ROW LEVEL SECURITY;

-- Lecture publique des variantes actives
CREATE POLICY "Public read active variants" ON landing_page_variants
  FOR SELECT USING (is_active = true);

-- Lecture publique des sections de variantes
CREATE POLICY "Public read variant sections" ON landing_variant_sections
  FOR SELECT USING (true);

-- Les fondateurs/admins peuvent tout faire sur les variantes
CREATE POLICY "Founders manage variants" ON landing_page_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

CREATE POLICY "Founders manage variant sections" ON landing_variant_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Insert public pour le tracking (anonyme)
CREATE POLICY "Public insert visits" ON ab_test_visits
  FOR INSERT WITH CHECK (true);

-- Les fondateurs peuvent lire les visits pour les stats
CREATE POLICY "Founders read visits" ON ab_test_visits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Update visits pour marquer les conversions
CREATE POLICY "Public update visits" ON ab_test_visits
  FOR UPDATE USING (true);
