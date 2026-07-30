-- ============================================================
-- SOS SHINE — AUDIT DES EMAILS
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1) COMBIEN DE MAILS PARTENT, PAR TYPE (tous les envois loggés)
--    Chaque ligne = un type d'email + nombre d'envois + 1er/dernier envoi
SELECT
  event_type,
  COUNT(*)                         AS nb_envois,
  COUNT(DISTINCT contact_email)    AS destinataires_uniques,
  MIN(created_at)                  AS premier_envoi,
  MAX(created_at)                  AS dernier_envoi
FROM crm_campaign_events
WHERE event_type LIKE '%_sent'
   OR event_type LIKE 'auto_email_%'
GROUP BY event_type
ORDER BY nb_envois DESC;

-- 2) TOTAL GLOBAL D'EMAILS ENVOYÉS DEPUIS LE DÉBUT
SELECT COUNT(*) AS total_emails_envoyes
FROM crm_campaign_events
WHERE event_type LIKE '%_sent'
   OR event_type LIKE 'auto_email_%';

-- 3) EMAILS PLANIFIÉS (nurturing / conversion) — état de la file
SELECT status, template_key, COUNT(*) AS nb
FROM scheduled_emails
GROUP BY status, template_key
ORDER BY status, nb DESC;

-- 4) OUVERTURES — ⚠️ uniquement disponibles pour les CAMPAGNES manuelles
--    (le pixel d'ouverture n'est PAS présent dans les mails automatiques)
SELECT
  c.name                AS campagne,
  c.sent_count          AS envoyes,
  c.open_count          AS ouverts,
  ROUND(100.0 * c.open_count / NULLIF(c.sent_count, 0), 1) AS taux_ouverture_pct,
  c.created_at
FROM crm_campaigns c
ORDER BY c.created_at DESC;

-- 5) OUVERTURES loggées événement par événement (campagnes seulement)
SELECT COUNT(*) AS total_ouvertures_trackees
FROM crm_campaign_events
WHERE event_type = 'open';

-- 6) LES DERNIERS 100 EMAILS ENVOYÉS (qui / quoi / quand)
SELECT created_at, event_type, contact_email
FROM crm_campaign_events
WHERE event_type LIKE '%_sent' OR event_type LIKE 'auto_email_%'
ORDER BY created_at DESC
LIMIT 100;
