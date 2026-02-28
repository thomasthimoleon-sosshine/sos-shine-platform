-- ══════════════════════════════════════════════════════════════
-- FIX COMPLET : Mur communautaire + Back-office fondateur
-- Exécuter dans l'éditeur SQL de Supabase
-- Idempotent : peut être relancé sans risque
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- 1. FONCTION is_admin() — Fondateur + admins
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content', 'admin_support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- 2. COLONNES MANQUANTES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publish_banned_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'partage';
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text';
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- ══════════════════════════════════════════════════════════════
-- 3. TABLES post_likes et post_comments
-- ══════════════════════════════════════════════════════════════
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

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- ══════════════════════════════════════════════════════════════
-- 4. RLS — Profiles (lecture publique + admin peut modifier tout)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- IMPORTANT: Fondateurs/admins peuvent modifier N'IMPORTE quel profil (bannir, etc.)
DROP POLICY IF EXISTS "Founders can update any profile" ON public.profiles;
CREATE POLICY "Founders can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 5. RLS — Posts (mur + back-office fondateur)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Published posts are viewable by members" ON public.posts;
CREATE POLICY "Published posts are viewable by members" ON public.posts
  FOR SELECT USING (is_published = true AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (public.is_admin());

-- INSERT
DROP POLICY IF EXISTS "Members can create community posts" ON public.posts;
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

DROP POLICY IF EXISTS "Admins can create any post" ON public.posts;
CREATE POLICY "Admins can create any post" ON public.posts
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND auth.uid() = author_id
  );

-- UPDATE
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin());

-- DELETE
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 6. RLS — Post Likes
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
CREATE POLICY "Users can like" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
CREATE POLICY "Users can unlike" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- 7. RLS — Post Comments
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
CREATE POLICY "Users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;
CREATE POLICY "Admins can delete any comment" ON public.post_comments
  FOR DELETE USING (public.is_admin());
