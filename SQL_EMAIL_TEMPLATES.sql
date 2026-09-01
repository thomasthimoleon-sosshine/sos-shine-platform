-- =============================================
-- SOS SHINE® — EMAIL TEMPLATES AUTOMATIQUES
-- 23 templates éditables depuis le BackOffice
-- =============================================

-- Table des templates email
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  trigger_type VARCHAR(100) NOT NULL,
  trigger_delay_days INTEGER DEFAULT 0,
  description TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des emails programmés (file d'attente)
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key VARCHAR(50) NOT NULL REFERENCES email_templates(template_key),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  variables JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour le cron job
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
  ON scheduled_emails(scheduled_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_recipient
  ON scheduled_emails(recipient_email, template_key);

CREATE INDEX IF NOT EXISTS idx_email_templates_trigger
  ON email_templates(trigger_type);

CREATE INDEX IF NOT EXISTS idx_email_templates_category
  ON email_templates(category);

-- RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY email_templates_admin_all ON email_templates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY scheduled_emails_admin_all ON scheduled_emails
  FOR ALL USING (true) WITH CHECK (true);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_timestamp();
