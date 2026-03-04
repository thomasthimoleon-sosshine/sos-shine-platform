-- ══════════════════════════════════════════════════════════════════
-- Programme d'affiliation SOS Shine
-- ══════════════════════════════════════════════════════════════════

-- ── Table des affiliés ──
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  referral_code TEXT NOT NULL UNIQUE,

  -- Informations de candidature
  motivation TEXT NOT NULL,
  audience_size TEXT,
  promotion_channels TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  website_url TEXT,

  -- Statistiques
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  pending_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Tier (calculé en fonction des referrals)
  current_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (current_tier IN ('bronze', 'silver', 'gold', 'diamond')),

  -- Meta
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_affiliate UNIQUE (user_id)
);

-- ── Table des clics de referral ──
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Table des conversions (inscription via lien affilié) ──
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  conversion_type TEXT NOT NULL DEFAULT 'signup' CHECK (conversion_type IN ('signup', 'subscription', 'renewal')),
  plan TEXT CHECK (plan IN ('essential', 'serenite', 'premium')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Table des paiements affiliés ──
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'paypal', 'stripe')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- ── Index ──
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);

-- ── RLS ──
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates: chaque user voit son propre profil affilié
CREATE POLICY "Users can view own affiliate" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins voient tout
CREATE POLICY "Admins can manage affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- Clicks: affilié voit ses propres clics
CREATE POLICY "Affiliates can view own clicks" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

-- Conversions: affilié voit ses propres conversions
CREATE POLICY "Affiliates can view own conversions" ON affiliate_conversions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

-- Payouts: affilié voit ses propres paiements
CREATE POLICY "Affiliates can view own payouts" ON affiliate_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

-- Admins gèrent tout
CREATE POLICY "Admins manage clicks" ON affiliate_clicks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins manage conversions" ON affiliate_conversions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins manage payouts" ON affiliate_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );
