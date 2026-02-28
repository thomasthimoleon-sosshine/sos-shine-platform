-- ══════════════════════════════════════════════════════════════
-- MUR COMMUNAUTAIRE — SQL COMPLET (idempotent, safe re-run)
-- Likes, Commentaires, Partage MP, Partage social, Role fondateur
-- Coller directement dans l'editeur SQL de Supabase
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
-- 2. COLONNES MANQUANTES sur profiles et posts
-- ══════════════════════════════════════════════════════════════

-- Profiles : bannissement + bot
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publish_banned_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

-- Posts : colonnes communautaires
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'partage',
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Posts : contrainte post_type avec 'community'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community'));

-- ══════════════════════════════════════════════════════════════
-- 3. TABLE post_likes (Likes)
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

-- ══════════════════════════════════════════════════════════════
-- 4. TABLE post_comments (Commentaires)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- ══════════════════════════════════════════════════════════════
-- 5. RLS — Posts (mur communautaire)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes policies
DROP POLICY IF EXISTS "Published posts are viewable by members" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Members can create community posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can create any post" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

-- SELECT : membres voient les posts publies
CREATE POLICY "Published posts are viewable by members" ON public.posts
  FOR SELECT USING (is_published = true AND auth.uid() IS NOT NULL);

-- SELECT : fondateurs/admins voient TOUT (y compris masques)
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (public.is_admin());

-- INSERT : membres creent des posts 'community' (sauf si bannis)
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

-- INSERT : fondateurs/admins creent N'IMPORTE quel type de post
CREATE POLICY "Admins can create any post" ON public.posts
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND auth.uid() = author_id
  );

-- UPDATE : un membre modifie son propre post
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- UPDATE : fondateurs/admins modifient n'importe quel post
CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin());

-- DELETE : un membre supprime son propre post
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- DELETE : fondateurs/admins suppriment n'importe quel post
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 6. RLS — Post Likes
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;

-- Tout le monde peut voir les likes
CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (true);

-- Un membre peut liker (son propre user_id)
CREATE POLICY "Users can like" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Un membre peut retirer son like
CREATE POLICY "Users can unlike" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- 7. RLS — Post Comments
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;

-- Tout le monde peut voir les commentaires
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (true);

-- Un membre peut commenter
CREATE POLICY "Users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Un membre peut supprimer ses propres commentaires
CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Fondateurs/admins peuvent supprimer N'IMPORTE quel commentaire (moderation)
CREATE POLICY "Admins can delete any comment" ON public.post_comments
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 8. RLS — Private Messages (pour le partage en MP)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can update own received messages" ON public.private_messages;

-- Un membre voit ses messages (envoyes ou recus)
CREATE POLICY "Users can view own messages" ON public.private_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Un membre peut envoyer un MP
CREATE POLICY "Users can send messages" ON public.private_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Un membre peut marquer comme lu ses messages recus
CREATE POLICY "Users can update own received messages" ON public.private_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ══════════════════════════════════════════════════════════════
-- 9. RLS — Profiles (fondateurs peuvent modifier tous les profils)
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

-- Fondateurs/admins peuvent modifier n'importe quel profil (bannir, changer role, etc.)
CREATE POLICY "Founders can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 10. STORAGE — Bucket uploads (pour images/videos/audios des posts)
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
