-- Table de capture de leads pour les évènements (guide PDF, etc.)
CREATE TABLE IF NOT EXISTS public.event_leads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom     TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  consent    BOOLEAN     NOT NULL DEFAULT false,
  source     TEXT        NOT NULL DEFAULT 'plage-couples-2025',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_leads_email_unique UNIQUE (email)
);

-- RLS activé : aucun accès public. Toutes les insertions passent par le service role côté serveur.
ALTER TABLE public.event_leads ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
