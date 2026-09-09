-- ============================================
-- SQL Migration: Community Hub (Post Bookmarks + Message Acceptances)
-- Appliquer dans Supabase SQL Editor
-- ============================================

-- 1. Table des posts enregistrés / favoris
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'default' CHECK (category IN ('default', 'watch_later')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post ON post_bookmarks(post_id);

-- RLS pour post_bookmarks
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON post_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON post_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON post_bookmarks FOR DELETE
  USING (auth.uid() = user_id);


-- 2. Table des contacts de messagerie acceptés (modèle hybride Instagram/TikTok)
-- Permet d'accepter des messages de non-Rayons vers la boîte principale
CREATE TABLE IF NOT EXISTS message_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_message_acceptances_user ON message_acceptances(user_id);

-- RLS pour message_acceptances
ALTER TABLE message_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own acceptances"
  ON message_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create acceptances"
  ON message_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own acceptances"
  ON message_acceptances FOR DELETE
  USING (auth.uid() = user_id);
