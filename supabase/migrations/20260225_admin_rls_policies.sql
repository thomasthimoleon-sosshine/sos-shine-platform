-- ── Fix: Admin RLS policies for douleurs & landing_sections ──
-- Without these, admin users cannot INSERT / UPDATE / DELETE via the API

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content', 'admin_support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Douleurs: admin full access ──
DROP POLICY IF EXISTS "Admins can do everything on douleurs" ON public.douleurs;
CREATE POLICY "Admins can do everything on douleurs" ON public.douleurs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Also allow admins to SELECT unpublished douleurs (the existing policy only allows published)
DROP POLICY IF EXISTS "Admins can view all douleurs" ON public.douleurs;
CREATE POLICY "Admins can view all douleurs" ON public.douleurs
  FOR SELECT USING (public.is_admin());

-- ── Landing sections: admin full access ──
DROP POLICY IF EXISTS "Admins can manage landing sections" ON public.landing_sections;
CREATE POLICY "Admins can manage landing sections" ON public.landing_sections
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Site settings: public read + admin write ──
-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  updated_by  UUID REFERENCES public.profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
