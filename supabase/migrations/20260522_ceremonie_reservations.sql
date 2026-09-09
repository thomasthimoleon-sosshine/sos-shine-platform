-- Cérémonie Plein Air SOS Shine — Réservations
CREATE TABLE IF NOT EXISTS public.ceremonie_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  ceremonie_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | refunded | cancelled
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ceremonie_email ON public.ceremonie_reservations(email);
CREATE INDEX IF NOT EXISTS idx_ceremonie_status ON public.ceremonie_reservations(status);

ALTER TABLE public.ceremonie_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ceremonie_insert_anon" ON public.ceremonie_reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ceremonie_update_webhook" ON public.ceremonie_reservations
  FOR UPDATE USING (true);

CREATE POLICY "ceremonie_select_admin" ON public.ceremonie_reservations
  FOR SELECT USING (public.is_admin());

NOTIFY pgrst, 'reload schema';
