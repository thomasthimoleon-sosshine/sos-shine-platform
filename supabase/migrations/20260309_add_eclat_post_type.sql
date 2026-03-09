-- Migration: Add 'eclat' post_type for personal wall "Mon Éclat"
-- Each member can publish on their personal wall (visible to all)

-- Update post_type constraint to include 'eclat'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community', 'eclat'));

-- RLS: Allow members to insert their own eclat posts
DROP POLICY IF EXISTS "Members can create eclat posts" ON public.posts;
CREATE POLICY "Members can create eclat posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'eclat'
  );

-- RLS: Allow everyone to read eclat posts
DROP POLICY IF EXISTS "Anyone can read eclat posts" ON public.posts;
CREATE POLICY "Anyone can read eclat posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    post_type = 'eclat'
    AND is_published = true
  );

-- RLS: Allow members to update their own eclat posts
DROP POLICY IF EXISTS "Members can update own eclat posts" ON public.posts;
CREATE POLICY "Members can update own eclat posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND post_type = 'eclat')
  WITH CHECK (auth.uid() = author_id AND post_type = 'eclat');

-- RLS: Allow members to delete their own eclat posts
DROP POLICY IF EXISTS "Members can delete own eclat posts" ON public.posts;
CREATE POLICY "Members can delete own eclat posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id AND post_type = 'eclat');
