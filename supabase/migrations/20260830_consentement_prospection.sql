-- ═══════════════════════════════════════════════════════════════
-- TRACE DU CONSENTEMENT À LA PROSPECTION
--
-- L'adresse saisie au questionnaire partait dans une séquence de seize
-- e-mails commerciaux puis dans la newsletter, sans qu'aucun consentement
-- n'ait été demandé — et sous une phrase qui promettait le contraire.
--
-- Le formulaire le demande désormais. Reste à en garder la trace : un
-- consentement qu'on ne peut pas dater ne se prouve pas.
--
-- Les fiches existantes gardent consent_at à NULL. C'est volontaire et
-- c'est la vérité : pour ces personnes, aucun consentement n'a jamais été
-- recueilli. À vous de décider ce que vous en faites — la voie propre est
-- de leur écrire une fois pour le demander.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.crm_contacts.consent_at IS
  'Date du consentement à la prospection. NULL = jamais recueilli.';

NOTIFY pgrst, 'reload schema';
