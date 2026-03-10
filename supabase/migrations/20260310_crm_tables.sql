-- ══════════════════════════════════════════════════════════════
-- SOS Shine — CRM Tables Migration
-- Creates all tables needed for the CRM system
-- Run this in your Supabase SQL editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. SIGNATURE LEADS (quiz email capture) ──
CREATE TABLE IF NOT EXISTS public.signature_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  first_name    TEXT,
  profile_key   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signature_leads_email ON public.signature_leads(email);

-- ── 2. CRM CONTACTS ──
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT,
  source        TEXT DEFAULT 'manual',
  tags          TEXT[] DEFAULT '{}',
  unsubscribed  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_source ON public.crm_contacts(source);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_unsubscribed ON public.crm_contacts(unsubscribed);

-- ── 3. CRM CAMPAIGNS ──
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  subject       TEXT NOT NULL,
  html_content  TEXT NOT NULL,
  segment       TEXT DEFAULT 'all',
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  sent_count    INTEGER DEFAULT 0,
  open_count    INTEGER DEFAULT 0,
  click_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON public.crm_campaigns(status);

-- ── 4. CRM CAMPAIGN EVENTS (tracking: sent, open, click) ──
CREATE TABLE IF NOT EXISTS public.crm_campaign_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL,
  contact_id    UUID,
  contact_email TEXT,
  event_type    TEXT NOT NULL CHECK (event_type IN ('sent', 'open', 'click', 'sequence_sent')),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_events_campaign ON public.crm_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_contact ON public.crm_campaign_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_type ON public.crm_campaign_events(event_type);

-- ── 5. CRM SEQUENCES ──
CREATE TABLE IF NOT EXISTS public.crm_sequences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  trigger_type  TEXT NOT NULL,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 6. CRM SEQUENCE STEPS ──
CREATE TABLE IF NOT EXISTS public.crm_sequence_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id   UUID NOT NULL REFERENCES public.crm_sequences(id) ON DELETE CASCADE,
  step_order    INTEGER NOT NULL DEFAULT 0,
  delay_days    INTEGER NOT NULL DEFAULT 0,
  subject       TEXT NOT NULL,
  html_content  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_steps_sequence ON public.crm_sequence_steps(sequence_id, step_order);

-- ── 7. CRM SEQUENCE ENROLLMENTS ──
CREATE TABLE IF NOT EXISTS public.crm_sequence_enrollments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id         UUID NOT NULL REFERENCES public.crm_sequences(id) ON DELETE CASCADE,
  contact_email       TEXT NOT NULL,
  contact_first_name  TEXT,
  current_step        INTEGER NOT NULL DEFAULT 0,
  next_send_at        TIMESTAMPTZ,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'unsubscribed')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sequence_id, contact_email)
);

CREATE INDEX IF NOT EXISTS idx_crm_enrollments_status ON public.crm_sequence_enrollments(status, next_send_at);

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- CRM tables are admin-only (accessed via service role key)
-- We enable RLS but only allow service_role access
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.signature_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sequence_enrollments ENABLE ROW LEVEL SECURITY;

-- signature_leads: allow anonymous INSERT (quiz capture) and admin SELECT
CREATE POLICY "Anyone can submit signature lead" ON public.signature_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read signature leads" ON public.signature_leads
  FOR SELECT USING (true);

-- CRM tables: full access via service role (the app uses supabase admin client)
-- These policies allow the service_role key to bypass RLS automatically.
-- No anon/authenticated access needed since CRM is admin-only.

CREATE POLICY "Service role full access crm_contacts" ON public.crm_contacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access crm_campaigns" ON public.crm_campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access crm_campaign_events" ON public.crm_campaign_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access crm_sequences" ON public.crm_sequences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access crm_sequence_steps" ON public.crm_sequence_steps
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access crm_sequence_enrollments" ON public.crm_sequence_enrollments
  FOR ALL USING (true) WITH CHECK (true);
