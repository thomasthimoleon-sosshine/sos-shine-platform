-- ═══════════════════════════════════════════════════════════
-- COURRIER ANONYME — Espace recommandations et demandes
-- ═══════════════════════════════════════════════════════════

-- Table principale
CREATE TABLE IF NOT EXISTS courrier_anonyme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'question' CHECK (category IN ('question', 'recommandation', 'temoignage', 'suggestion', 'autre')),
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'planned', 'answered', 'archived')),
  admin_note TEXT,
  answered_via TEXT CHECK (answered_via IN ('shine_tv', 'podcast', 'article', 'direct', NULL)),
  answered_url TEXT,
  answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_courrier_anonyme_status ON courrier_anonyme(status);
CREATE INDEX IF NOT EXISTS idx_courrier_anonyme_category ON courrier_anonyme(category);
CREATE INDEX IF NOT EXISTS idx_courrier_anonyme_created ON courrier_anonyme(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE courrier_anonyme ENABLE ROW LEVEL SECURITY;

-- Les membres authentifiés peuvent insérer (envoyer un courrier)
CREATE POLICY "Members can insert courrier"
  ON courrier_anonyme FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Les membres ne peuvent PAS lire les courriers (anonymat total)
-- Seuls les admins/fondateurs y ont accès

-- Les fondateurs et admins peuvent tout voir
CREATE POLICY "Admins can view all courrier"
  ON courrier_anonyme FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );

-- Les fondateurs et admins peuvent modifier (changer statut, ajouter notes)
CREATE POLICY "Admins can update courrier"
  ON courrier_anonyme FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_courrier_anonyme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courrier_anonyme_updated_at
  BEFORE UPDATE ON courrier_anonyme
  FOR EACH ROW
  EXECUTE FUNCTION update_courrier_anonyme_updated_at();
