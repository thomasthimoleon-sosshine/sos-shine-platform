-- ============================================================
-- SOS SHINE — Analytics du parcours client (funnel)
-- ============================================================
-- Objectif : mesurer le temps passé sur le questionnaire
-- "Signature Émotionnelle" et repérer où les visiteurs décrochent
-- dans le tunnel jusqu'à l'abonnement.
--
-- À copier/coller dans l'éditeur SQL de Supabase, puis "Run".
-- ============================================================

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL,                 -- identifiant anonyme du visiteur (localStorage)
  event       TEXT NOT NULL,                 -- ex: test_started, question_answered, email_submitted...
  step        INTEGER,                       -- n° d'étape/question quand pertinent
  path        TEXT,                          -- URL où l'événement s'est produit
  email       TEXT,                          -- rempli dès que connu (après l'écran email)
  metadata    JSONB NOT NULL DEFAULT '{}',   -- données libres (temps écoulé, profil, plan...)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour des agrégations rapides
CREATE INDEX IF NOT EXISTS idx_funnel_events_event      ON public.funnel_events (event);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session    ON public.funnel_events (session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON public.funnel_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_email      ON public.funnel_events (email);

-- RLS : la table est écrite uniquement côté serveur (service role, qui
-- contourne RLS) via /api/track, et lue uniquement par l'admin via
-- /api/admin/analytics. On active RLS sans policy publique : aucun
-- accès direct depuis le client anon n'est possible.
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Événements attendus (référence) :
--   test_started       — le visiteur démarre le test (prénom saisi)
--   question_answered  — une réponse (step = n° question, metadata.elapsed_ms)
--   test_completed     — 15 questions terminées (metadata.total_ms)
--   email_gate_shown   — l'écran "entrez votre email" s'affiche
--   email_submitted    — l'email est fourni (metadata.profile)
--   result_viewed      — le résultat du profil s'affiche
--   join_clicked       — clic sur "Rejoindre SOS Shine"
--   checkout_started   — clic sur un plan (metadata.plan, metadata.duration)
--   signup_submitted   — formulaire d'inscription envoyé
-- ============================================================
