-- A/B variant attribution: persist variant on profiles for full funnel tracking
-- This allows us to link signup → subscription → LTV back to the variant

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ab_variant TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_ab_variant ON profiles(ab_variant) WHERE ab_variant IS NOT NULL;

-- Same for signature leads (lead magnet attribution)
ALTER TABLE IF EXISTS crm_contacts
  ADD COLUMN IF NOT EXISTS ab_variant TEXT;

-- Dedup constraint to fix race condition in ab-convert
-- A visitor can only convert once per visit row
ALTER TABLE ab_test_visits
  ADD COLUMN IF NOT EXISTS conversion_count INT NOT NULL DEFAULT 0;
