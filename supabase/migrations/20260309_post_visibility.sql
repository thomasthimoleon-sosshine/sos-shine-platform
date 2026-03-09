-- ══════════════════════════════════════════════════════════════
-- Ajout de la visibilité sur les posts (public / rayons uniquement)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'rayons_only'));

CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
