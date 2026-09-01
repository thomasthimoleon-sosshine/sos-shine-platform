-- ═══════════════════════════════════════════════════════════════
-- Phase 3 — Suspension anciennes séquences + setup nouvelle
-- ═══════════════════════════════════════════════════════════════

-- 1. Pause all existing CRM sequences (keep data, stop sending)
UPDATE crm_sequences
SET status = 'paused', updated_at = NOW()
WHERE status = 'active';

-- 2. Log the suspension event
INSERT INTO crm_campaign_events (contact_email, event_type, metadata)
VALUES ('system@sosshine.com', 'sequences_paused_for_v2',
  '{"reason": "Quiz V2 deployment — old sequences paused", "paused_at": "' || NOW()::text || '"}'::jsonb
);

-- 3. Create the new V2 sequence
INSERT INTO crm_sequences (trigger_type, status)
VALUES ('signature_test_v2', 'active')
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
