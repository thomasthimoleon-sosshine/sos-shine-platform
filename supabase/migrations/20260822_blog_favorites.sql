-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Favoris sur les articles du blog
--
-- Toutes les autres sections ont leur table de favoris (protocoles,
-- publications, formats courts, Shine TV, Shine Audible, la librairie).
-- Le blog était le seul à ne pas en avoir : impossible d'y mettre un
-- article de côté, donc impossible de le retrouver dans « Mes favoris ».
--
-- On garde le slug plutôt qu'un identifiant : les articles du blog
-- existent en base ET en dur dans data/blog/articles.ts. Le slug est la
-- seule clé commune aux deux.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blog_favorites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_slug text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_favorites_user ON blog_favorites(user_id);

ALTER TABLE blog_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_favorites_select_own" ON blog_favorites;
CREATE POLICY "blog_favorites_select_own" ON blog_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_favorites_insert_own" ON blog_favorites;
CREATE POLICY "blog_favorites_insert_own" ON blog_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_favorites_delete_own" ON blog_favorites;
CREATE POLICY "blog_favorites_delete_own" ON blog_favorites
  FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
