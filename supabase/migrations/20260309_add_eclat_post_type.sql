-- ══════════════════════════════════════════════════════════════
-- Migration: Add 'eclat' post_type for personal wall "Mon Éclat"
-- Each member can publish on their personal wall (visible to all)
-- Idempotent: can be re-run safely
-- ══════════════════════════════════════════════════════════════

-- 1. Add missing columns
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS delete_locked BOOLEAN NOT NULL DEFAULT false;

-- 2. Add visibility CHECK constraint (drop first if exists)
DO $$
BEGIN
  ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_visibility_check;
  ALTER TABLE public.posts ADD CONSTRAINT posts_visibility_check
    CHECK (visibility IN ('public', 'rayons_only'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);

-- 3. Update post_type constraint to include 'eclat'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community', 'eclat'));

-- 4. RLS: Allow members to insert their own eclat posts (with ban check)
DROP POLICY IF EXISTS "Members can create eclat posts" ON public.posts;
CREATE POLICY "Members can create eclat posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'eclat'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND publish_banned_until IS NOT NULL
      AND publish_banned_until > now()
    )
  );

-- 5. RLS: Allow everyone to read eclat posts
DROP POLICY IF EXISTS "Anyone can read eclat posts" ON public.posts;
CREATE POLICY "Anyone can read eclat posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    post_type = 'eclat'
    AND is_published = true
  );

-- 6. RLS: Allow members to update their own eclat posts
DROP POLICY IF EXISTS "Members can update own eclat posts" ON public.posts;
CREATE POLICY "Members can update own eclat posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND post_type = 'eclat')
  WITH CHECK (auth.uid() = author_id AND post_type = 'eclat');

-- 7. RLS: Allow members to delete their own eclat posts
DROP POLICY IF EXISTS "Members can delete own eclat posts" ON public.posts;
CREATE POLICY "Members can delete own eclat posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id AND post_type = 'eclat');
