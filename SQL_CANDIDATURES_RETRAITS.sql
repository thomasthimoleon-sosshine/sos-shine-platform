-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Candidatures & Demandes de retrait
-- Tables pour recevoir les candidatures d'affiliation dans le backoffice
-- et les demandes de retrait (payout) des affilies
-- ══════════════════════════════════════════════════════════════

-- ── 1. WITHDRAWAL REQUESTS (Demandes de retrait) ──
-- Les affilies avec une cagnotte >= 50€ peuvent demander un retrait
-- Les fondateurs recoivent la demande et effectuent le virement manuellement
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affiliate_id    UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 50),
  iban            TEXT,
  paypal_email    TEXT,
  payment_method  TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'paypal')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_note      TEXT,
  processed_by    UUID REFERENCES public.profiles(id),
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- ── RLS for withdrawal_requests ──
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE USING (public.is_admin());
