-- ═══════════════════════════════════════════════════════════
-- SOS SHINE — Questionnaire d'onboarding
-- Table pour stocker les réponses des utilisateurs
-- ═══════════════════════════════════════════════════════════

-- Table principale : réponses au questionnaire d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goals TEXT[] NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour recherche rapide par user_id
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id ON onboarding_responses(user_id);

-- RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leurs propres réponses
CREATE POLICY "Users can read own onboarding responses"
  ON onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres réponses
CREATE POLICY "Users can insert own onboarding responses"
  ON onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres réponses
CREATE POLICY "Users can update own onboarding responses"
  ON onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can read all onboarding responses"
  ON onboarding_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );

-- ═══════════════════════════════════════════════════════════
-- Table pour les objectifs personnalisés générés par l'onboarding
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_key TEXT NOT NULL,
  recommended_slug TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  source TEXT DEFAULT 'onboarding' CHECK (source IN ('onboarding', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);
