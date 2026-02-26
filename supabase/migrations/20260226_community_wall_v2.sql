-- ══════════════════════════════════════════════════════════════
-- Migration: Community Wall v2
-- Categories, media types, likes, comments, share tracking
-- ══════════════════════════════════════════════════════════════

-- 1) Add new columns to posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'partage'
    CHECK (category IN ('temoignage', 'partage', 'question', 'remerciements', 'gratitude', 'citation')),
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'
    CHECK (media_type IN ('text', 'image', 'video', 'audio')),
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Update post_type to allow 'community' for member-created posts
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community'));

-- 2) Post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

-- 3) Post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- 4) RLS policies for new tables
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Likes: anyone authenticated can see, insert own, delete own
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can see, insert own, delete own
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);
