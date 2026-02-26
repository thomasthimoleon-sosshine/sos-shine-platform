-- ══════════════════════════════════════════════════════════════
-- Migration: Fix posts table — add RLS policies + missing columns
-- This fixes the "Publier" button not working when RLS is enabled
-- ══════════════════════════════════════════════════════════════

-- 1) Ensure community wall columns exist (idempotent)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'partage'
    CHECK (category IN ('temoignage', 'partage', 'question', 'remerciements', 'gratitude', 'citation')),
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'
    CHECK (media_type IN ('text', 'image', 'video', 'audio')),
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- 2) Ensure post_type includes 'community'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community'));

-- 3) Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4) Drop any existing policies (safe re-run)
DROP POLICY IF EXISTS "Published posts are viewable by members" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create community posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can create any post" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

-- 5) SELECT: members see published posts, admins see all
CREATE POLICY "Published posts are viewable by members" ON public.posts
  FOR SELECT USING (
    is_published = true AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (
    public.is_admin()
  );

-- 6) INSERT: members can create community posts (if not banned)
--    admins can create any post type
CREATE POLICY "Members can create community posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'community'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND publish_banned_until IS NOT NULL
      AND publish_banned_until > now()
    )
  );

CREATE POLICY "Admins can create any post" ON public.posts
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND auth.uid() = author_id
  );

-- 7) UPDATE: own posts or admin
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin());

-- 8) DELETE: own posts or admin
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- 9) Ensure publish_banned_until exists on profiles (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publish_banned_until TIMESTAMPTZ DEFAULT NULL;

-- 10) Ensure is_bot exists on profiles (needed for DM share query)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

-- 11) Ensure post_likes and post_comments tables exist (idempotent)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 12) Ensure RLS on likes and comments
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing (safe re-run)
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;

CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE
  USING (public.is_admin());

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
