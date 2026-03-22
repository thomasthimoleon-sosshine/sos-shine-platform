-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Email Templates Tables + CRM Fixes
-- 1. Creates email_templates table
-- 2. Creates scheduled_emails table
-- 3. Fixes crm_campaign_events constraints
-- Run this in your Supabase SQL editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. EMAIL TEMPLATES ──
CREATE TABLE IF NOT EXISTS public.email_templates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key    VARCHAR(50) UNIQUE NOT NULL,
  category        VARCHAR(50) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  subject         VARCHAR(500) NOT NULL,
  html_content    TEXT NOT NULL,
  trigger_type    VARCHAR(100) NOT NULL,
  trigger_delay_days INTEGER DEFAULT 0,
  description     TEXT,
  variables       TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_trigger
  ON public.email_templates(trigger_type);

CREATE INDEX IF NOT EXISTS idx_email_templates_category
  ON public.email_templates(category);

-- ── 2. SCHEDULED EMAILS (queue) ──
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key    VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name  VARCHAR(255),
  variables       JSONB DEFAULT '{}',
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
  ON public.scheduled_emails(scheduled_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_recipient
  ON public.scheduled_emails(recipient_email, template_key);

-- ── 3. RLS for new tables ──
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'email_templates_admin_all') THEN
    CREATE POLICY email_templates_admin_all ON public.email_templates
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_emails' AND policyname = 'scheduled_emails_admin_all') THEN
    CREATE POLICY scheduled_emails_admin_all ON public.scheduled_emails
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 4. Auto-update updated_at trigger ──
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_templates_updated_at ON public.email_templates;
CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_timestamp();

-- ── 5. Fix crm_campaign_events: make campaign_id nullable and expand event_type ──
ALTER TABLE public.crm_campaign_events ALTER COLUMN campaign_id DROP NOT NULL;

-- Drop old check constraint and add expanded one
ALTER TABLE public.crm_campaign_events DROP CONSTRAINT IF EXISTS crm_campaign_events_event_type_check;
ALTER TABLE public.crm_campaign_events ADD CONSTRAINT crm_campaign_events_event_type_check
  CHECK (event_type IN ('sent', 'open', 'click', 'sequence_sent', 'signature_result_sent', 'auto_email_sent', 'event_reminder_sent'));
