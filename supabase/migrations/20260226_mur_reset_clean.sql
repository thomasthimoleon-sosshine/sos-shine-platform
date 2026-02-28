-- ══════════════════════════════════════════════════════════════
-- MUR COMMUNAUTAIRE — RESET COMPLET & PROPRE
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- Il supprime TOUTES les anciennes policies et les recrée
-- Safe to re-run (idempotent)
-- Date: 2026-02-26
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- 0. FONCTION UTILITAIRE is_admin()
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
-- 1. TABLE posts — colonnes manquantes
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'partage',
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Supprimer l'ancienne contrainte post_type si elle existe
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
-- Recréer la contrainte avec 'community' inclus
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community'));

-- Supprimer et recréer les contraintes category et media_type
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_category_check
  CHECK (category IN ('temoignage', 'partage', 'question', 'remerciements', 'gratitude', 'citation'));

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_media_type_check
  CHECK (media_type IN ('text', 'image', 'video', 'audio'));

-- ══════════════════════════════════════════════════════════════
-- 2. TABLE profiles — colonnes manquantes
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publish_banned_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

-- ══════════════════════════════════════════════════════════════
-- 3. TABLES post_likes & post_comments
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- ══════════════════════════════════════════════════════════════
-- 4. NETTOYAGE RLS — Supprimer TOUTES les anciennes policies
-- ══════════════════════════════════════════════════════════════

-- Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published posts are viewable by members" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create community posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can create any post" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
-- Anciens noms possibles
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;
DROP POLICY IF EXISTS "posts_select_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_member" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_admin" ON public.posts;

-- Post likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;

-- Post comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;

-- ══════════════════════════════════════════════════════════════
-- 5. NOUVELLES POLICIES — Posts
-- ══════════════════════════════════════════════════════════════

-- SELECT : tout membre connecté voit les posts publiés
CREATE POLICY "Published posts are viewable by members" ON public.posts
  FOR SELECT USING (
    is_published = true
    AND auth.uid() IS NOT NULL
  );

-- SELECT : admins voient tout (même les masqués)
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (public.is_admin());

-- INSERT : tout membre connecté peut créer un post 'community'
-- (sauf si banni)
CREATE POLICY "Members can create community posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
    AND post_type = 'community'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND publish_banned_until IS NOT NULL
        AND publish_banned_until > now()
    )
  );

-- INSERT : admins peuvent créer tout type de post
CREATE POLICY "Admins can create any post" ON public.posts
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND auth.uid() = author_id
  );

-- UPDATE : un membre modifie son propre post
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- UPDATE : admins peuvent modifier tout post
CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin());

-- DELETE : un membre supprime son propre post
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- DELETE : admins suppriment tout post
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 6. NOUVELLES POLICIES — Post Likes
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- 7. NOUVELLES POLICIES — Post Comments
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any comment" ON public.post_comments
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 8. POLICIES — Profiles (s'assurer qu'elles existent)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Founders can update any profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Founders can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 9. POLICIES — Private Messages (pour le partage en MP)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can update own received messages" ON public.private_messages;

CREATE POLICY "Users can view own messages" ON public.private_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.private_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" ON public.private_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ══════════════════════════════════════════════════════════════
-- 10. STORAGE (bucket uploads)
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
CREATE POLICY "Anyone can view uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════════════════════
-- TERMINÉ ! Le mur communautaire est maintenant prêt.
-- ══════════════════════════════════════════════════════════════
