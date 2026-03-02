-- ══════════════════════════════════════════════════════════
-- Fix v2: Robust douleurs publish system
-- Ensures is_admin() function exists and douleurs policies are correct
-- Adds a SECURITY DEFINER function to toggle publish (bypasses RLS)
-- ══════════════════════════════════════════════════════════

-- 1. Recreate is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content', 'admin_support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Grant permissions on douleurs table
GRANT SELECT ON public.douleurs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.douleurs TO authenticated;

-- 3. Ensure RLS is enabled
ALTER TABLE public.douleurs ENABLE ROW LEVEL SECURITY;

-- 4. Recreate all douleurs policies
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

-- 5. Create a SECURITY DEFINER function to toggle publish
-- This bypasses RLS entirely — but checks is_admin() inside
CREATE OR REPLACE FUNCTION public.toggle_douleur_publish(douleur_id UUID, new_published BOOLEAN)
RETURNS TABLE(id UUID, is_published BOOLEAN) AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  -- Update and return the result
  RETURN QUERY
  UPDATE public.douleurs
  SET is_published = new_published, updated_at = now()
  WHERE public.douleurs.id = douleur_id
  RETURNING public.douleurs.id, public.douleurs.is_published;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.toggle_douleur_publish(UUID, BOOLEAN) TO authenticated;
