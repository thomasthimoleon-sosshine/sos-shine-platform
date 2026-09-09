-- ═══════════════════════════════════════════════════════════════
-- Fix: douleur_steps RLS policies used non-existent 'admin' role
-- ═══════════════════════════════════════════════════════════════
--
-- Problem: migration 20260314_douleur_steps.sql created RLS
-- policies checking role = 'admin', but the SOS Shine role system
-- uses 'founder' | 'admin_content' | 'admin_support' (see
-- 20260225_admin_rls_policies.sql and public.is_admin()).
--
-- Result: nobody could INSERT/UPDATE/DELETE douleur_steps via
-- the API — the admin UI silently failed on every save, and
-- Julia couldn't fill in step descriptions or any other field.
--
-- Fix: drop the old policies and recreate them using the
-- canonical public.is_admin() helper, matching the pattern
-- already used for douleurs, landing_sections, site_settings.
-- ═══════════════════════════════════════════════════════════════

-- Drop old broken policies
DROP POLICY IF EXISTS "douleur_steps_insert_admin" ON public.douleur_steps;
DROP POLICY IF EXISTS "douleur_steps_update_admin" ON public.douleur_steps;
DROP POLICY IF EXISTS "douleur_steps_delete_admin" ON public.douleur_steps;

-- Single FOR ALL policy using the canonical admin helper.
-- SELECT stays public (handled by the existing
-- "douleur_steps_select_all" policy from 20260314).
DROP POLICY IF EXISTS "Admins can manage douleur_steps" ON public.douleur_steps;
CREATE POLICY "Admins can manage douleur_steps" ON public.douleur_steps
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Force PostgREST to reload its schema/policy cache
NOTIFY pgrst, 'reload schema';
