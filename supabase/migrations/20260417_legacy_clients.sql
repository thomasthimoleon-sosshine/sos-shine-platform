-- ═══════════════════════════════════════════════════════════════
-- Legacy clients: Julia's former clients who paid on the old
-- platform and need free access to the "Conditionnement" protocol
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.legacy_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  notes TEXT,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

-- Index for fast email lookups (used on every page load to check access)
CREATE INDEX IF NOT EXISTS idx_legacy_clients_email ON public.legacy_clients(LOWER(email));

-- RLS
ALTER TABLE public.legacy_clients ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage legacy_clients" ON public.legacy_clients
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated users can check if their own email is in the list
CREATE POLICY "Users can check own legacy status" ON public.legacy_clients
  FOR SELECT
  USING (
    LOWER(email) = LOWER(
      (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';
