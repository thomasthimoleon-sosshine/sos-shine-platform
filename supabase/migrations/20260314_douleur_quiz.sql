-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Quiz QCM pour les challenges émotionnels (douleurs)       ║
-- ║  - Questions à choix multiples par challenge               ║
-- ║  - Seuil de réussite : 8/10                                ║
-- ║  - Suivi des tentatives                                    ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── Questions QCM ──
CREATE TABLE IF NOT EXISTS douleur_quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  douleur_id  UUID NOT NULL REFERENCES douleurs(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',   -- ["Option A", "Option B", "Option C", "Option D"]
  correct_indices JSONB NOT NULL DEFAULT '[]', -- [0, 2] = indices des bonnes réponses
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quiz_questions_douleur ON douleur_quiz_questions(douleur_id);

-- ── Tentatives de quiz ──
CREATE TABLE IF NOT EXISTS douleur_quiz_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  douleur_id  UUID NOT NULL REFERENCES douleurs(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL,          -- nombre de bonnes réponses
  total       INTEGER NOT NULL,          -- nombre total de questions
  passed      BOOLEAN NOT NULL,          -- score >= seuil (8/10)
  answers     JSONB DEFAULT '[]',        -- détail des réponses données
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user ON douleur_quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_douleur ON douleur_quiz_attempts(douleur_id);
CREATE INDEX idx_quiz_attempts_user_douleur ON douleur_quiz_attempts(user_id, douleur_id);

-- ── RLS ──
ALTER TABLE douleur_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE douleur_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Questions visibles par tous les authentifiés
CREATE POLICY "Questions quiz visibles par tous"
  ON douleur_quiz_questions FOR SELECT
  USING (true);

-- Seuls les admins/fondateurs peuvent gérer les questions
CREATE POLICY "Admins gèrent les questions quiz"
  ON douleur_quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content')
    )
  );

-- Les utilisateurs peuvent voir leurs propres tentatives
CREATE POLICY "Utilisateurs voient leurs tentatives"
  ON douleur_quiz_attempts FOR SELECT
  USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs propres tentatives
CREATE POLICY "Utilisateurs créent leurs tentatives"
  ON douleur_quiz_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Les admins peuvent voir toutes les tentatives
CREATE POLICY "Admins voient toutes les tentatives"
  ON douleur_quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content')
    )
  );
