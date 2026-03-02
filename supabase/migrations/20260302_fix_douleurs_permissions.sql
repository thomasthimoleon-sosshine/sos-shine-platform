-- Fix: Ensure anon and authenticated roles can access douleurs table
-- This is needed for the encyclopédie pages to work for all users

-- Grant base table permissions
GRANT SELECT ON public.douleurs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.douleurs TO authenticated;

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.douleurs ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they exist and are correct
DROP POLICY IF EXISTS "Published douleurs are viewable by everyone" ON public.douleurs;
CREATE POLICY "Published douleurs are viewable by everyone"
  ON public.douleurs FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can do everything on douleurs" ON public.douleurs;
CREATE POLICY "Admins can do everything on douleurs"
  ON public.douleurs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all douleurs" ON public.douleurs;
CREATE POLICY "Admins can view all douleurs"
  ON public.douleurs FOR SELECT
  USING (public.is_admin());
