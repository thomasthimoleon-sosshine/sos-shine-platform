-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Subscriptions & Account Management Migration
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. Add is_active to profiles (default true for existing users) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ── 2. Create waitlist table if not exists ──
CREATE TABLE IF NOT EXISTS public.waitlist (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Add discount tracking to waitlist ──
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS has_discount BOOLEAN NOT NULL DEFAULT true;

-- ── 4. Ensure subscriptions table has all needed columns ──
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS waitlist_discount BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'monthly';

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS reminder_sent_count INTEGER DEFAULT 0;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS previous_plan TEXT;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_changed_at TIMESTAMPTZ;

-- ── 5. RLS policies for subscriptions (admin management) ──
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any subscription" ON public.subscriptions;
CREATE POLICY "Admins can update any subscription" ON public.subscriptions
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- ── 6. Function to check if user has active subscription ──
CREATE OR REPLACE FUNCTION public.has_active_subscription(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = uid
      AND status IN ('active', 'trialing')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 7. Function to deactivate expired subscriptions ──
CREATE OR REPLACE FUNCTION public.deactivate_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Mark subscriptions as inactive where period has ended
  UPDATE public.subscriptions
  SET status = 'inactive', updated_at = now()
  WHERE status IN ('active', 'trialing')
    AND current_period_end IS NOT NULL
    AND current_period_end < now();

  -- Deactivate profiles with no active subscription
  UPDATE public.profiles
  SET is_active = false
  WHERE role = 'member'
    AND is_active = true
    AND NOT public.has_active_subscription(id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. Index for faster subscription lookups ──
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
