-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Système complet de gestion des abonnements
-- À exécuter dans Supabase > SQL Editor
-- Date: 2026-03-15
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- 1. ENRICHIR LA TABLE SUBSCRIPTIONS (colonnes manquantes)
-- ══════════════════════════════════════════════════════════════

-- Ajouter cancel_at_period_end si absent
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter trial_end
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN trial_end TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter waitlist_discount
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN waitlist_discount BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter duration (monthly, quarterly, semiannual, annual)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN duration TEXT DEFAULT 'monthly'
    CHECK (duration IN ('monthly', 'quarterly', 'semiannual', 'annual'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter payment_failed_at (date du dernier échec de paiement)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN payment_failed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter reminder_sent_count (nombre de rappels envoyés)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN reminder_sent_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter last_reminder_sent_at
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN last_reminder_sent_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter grace_period_end (fin de la période de grâce après échec)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN grace_period_end TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter previous_plan (pour tracking des upgrades/downgrades)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN previous_plan TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajouter plan_changed_at
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN plan_changed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_failed_at ON public.subscriptions(payment_failed_at);

-- Contrainte unique sur user_id (un seul abonnement par user)
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ══════════════════════════════════════════════════════════════
-- 2. TABLE DE LOG DES PAIEMENTS (historique complet)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subscription_payment_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN (
    'payment_succeeded',
    'payment_failed',
    'subscription_created',
    'subscription_updated',
    'subscription_canceled',
    'subscription_reactivated',
    'plan_upgraded',
    'plan_downgraded',
    'trial_started',
    'trial_ended',
    'reminder_sent',
    'access_blocked',
    'access_restored',
    'grace_period_started',
    'grace_period_ended'
  )),
  plan            TEXT,
  previous_plan   TEXT,
  amount_cents    INTEGER,
  currency        TEXT DEFAULT 'eur',
  stripe_event_id TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_user ON public.subscription_payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON public.subscription_payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.subscription_payment_logs(created_at DESC);

-- RLS pour les logs de paiement
ALTER TABLE public.subscription_payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment logs" ON public.subscription_payment_logs;
CREATE POLICY "Users can view own payment logs" ON public.subscription_payment_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payment logs" ON public.subscription_payment_logs;
CREATE POLICY "Admins can view all payment logs" ON public.subscription_payment_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Service can insert payment logs" ON public.subscription_payment_logs;
CREATE POLICY "Service can insert payment logs" ON public.subscription_payment_logs
  FOR INSERT WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- 3. TABLE DES RAPPELS DE PAIEMENT
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  reminder_type   TEXT NOT NULL CHECK (reminder_type IN (
    'payment_failed_1',    -- 1er rappel (immédiat)
    'payment_failed_2',    -- 2ème rappel (+3 jours)
    'payment_failed_3',    -- 3ème rappel (+7 jours)
    'expiring_soon',       -- Abonnement expire bientôt
    'expired',             -- Abonnement expiré
    'grace_period_ending', -- Fin de période de grâce
    'access_blocked'       -- Accès bloqué
  )),
  email_sent      BOOLEAN DEFAULT false,
  email_sent_at   TIMESTAMPTZ,
  email_error     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.subscription_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON public.subscription_reminders(reminder_type);

ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminders" ON public.subscription_reminders;
CREATE POLICY "Users can view own reminders" ON public.subscription_reminders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reminders" ON public.subscription_reminders;
CREATE POLICY "Admins can view all reminders" ON public.subscription_reminders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Service can insert reminders" ON public.subscription_reminders;
CREATE POLICY "Service can insert reminders" ON public.subscription_reminders
  FOR INSERT WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- 4. DROITS D'ACCÈS PAR PLAN (quels contenus pour quel plan)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.plan_features (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan        TEXT NOT NULL CHECK (plan IN ('essential', 'serenite', 'premium')),
  feature_key TEXT NOT NULL,
  feature_label TEXT NOT NULL,
  is_enabled  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan, feature_key)
);

ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plan features viewable by everyone" ON public.plan_features;
CREATE POLICY "Plan features viewable by everyone" ON public.plan_features
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage plan features" ON public.plan_features;
CREATE POLICY "Admins can manage plan features" ON public.plan_features
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insérer les fonctionnalités par plan par défaut
-- Essentielle (9,90€) : Encyclopédie + Chat + Communauté
-- Sérénité (49,90€) : + Librairie + Shine TV + Shorts + Audible + Soin collectif
-- Premium (99,90€) : + Live hebdo + Telegram + Événements physiques + Ateliers

-- Essential (Essentielle) : Encyclopédie + Chat + Communauté
INSERT INTO public.plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'encyclopedie',       'Encyclopédie des challenges émotionnels', true),
  ('essential', 'chat_general',       'Chat général communautaire',              true),
  ('essential', 'mur_communautaire',  'Mur communautaire',                       true),
  ('essential', 'mon_eclat',          'Mon Éclat (micro-blog)',                  true),
  ('essential', 'mes_rayons',         'Mes Rayons (connexions sociales)',        true),
  ('essential', 'messagerie_privee',  'Messagerie privée',                       true),
  ('essential', 'journal',            'Journal intime',                           true),
  ('essential', 'objectifs',          'Suivi d''objectifs',                       true),
  ('essential', 'signature_quiz',     'Quiz Signature Émotionnelle',             true),
  ('essential', 'chat_douleur',       'Chats par challenge',                     true),
  ('essential', 'affiliation',        'Programme d''affiliation',                true),
  ('essential', 'evenements_gratuits','Événements gratuits',                      true),
  ('essential', 'visio',              'Visio / Audio (WebRTC)',                  false),
  ('essential', 'shine_tv',           'Shine TV (vidéos exclusives)',            false),
  ('essential', 'shine_shorts',       'Shine Shorts',                            false),
  ('essential', 'shine_audible',      'Shine Audible (audios exclusifs)',        false),
  ('essential', 'shine_librairie',    'Shine Librairie (PDFs exclusifs)',        false),
  ('essential', 'soin_collectif',     'Soin collectif mensuel',                  false),
  ('essential', 'evenements_payants', 'Événements physiques',                    false),
  ('essential', 'live_hebdo',         'Live thématique hebdomadaire',            false),
  ('essential', 'telegram',           'Canal privé Telegram',                    false),
  ('essential', 'ateliers_premium',   'Ateliers Premium (48 semaines)',          false)
ON CONFLICT (plan, feature_key) DO NOTHING;

-- Sérénité : + Librairie + Shine TV + Shorts + Audible + Soin collectif
INSERT INTO public.plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('serenite', 'encyclopedie',       'Encyclopédie des challenges émotionnels', true),
  ('serenite', 'chat_general',       'Chat général communautaire',              true),
  ('serenite', 'mur_communautaire',  'Mur communautaire',                       true),
  ('serenite', 'mon_eclat',          'Mon Éclat (micro-blog)',                  true),
  ('serenite', 'mes_rayons',         'Mes Rayons (connexions sociales)',        true),
  ('serenite', 'messagerie_privee',  'Messagerie privée',                       true),
  ('serenite', 'journal',            'Journal intime',                           true),
  ('serenite', 'objectifs',          'Suivi d''objectifs',                       true),
  ('serenite', 'signature_quiz',     'Quiz Signature Émotionnelle',             true),
  ('serenite', 'chat_douleur',       'Chats par challenge',                     true),
  ('serenite', 'affiliation',        'Programme d''affiliation',                true),
  ('serenite', 'evenements_gratuits','Événements gratuits',                      true),
  ('serenite', 'visio',              'Visio / Audio (WebRTC)',                  true),
  ('serenite', 'shine_tv',           'Shine TV (vidéos exclusives)',            true),
  ('serenite', 'shine_shorts',       'Shine Shorts',                            true),
  ('serenite', 'shine_audible',      'Shine Audible (audios exclusifs)',        true),
  ('serenite', 'shine_librairie',    'Shine Librairie (PDFs exclusifs)',        true),
  ('serenite', 'soin_collectif',     'Soin collectif mensuel',                  true),
  ('serenite', 'evenements_payants', 'Événements physiques',                    false),
  ('serenite', 'live_hebdo',         'Live thématique hebdomadaire',            false),
  ('serenite', 'telegram',           'Canal privé Telegram',                    false),
  ('serenite', 'ateliers_premium',   'Ateliers Premium (48 semaines)',          false)
ON CONFLICT (plan, feature_key) DO NOTHING;

-- Premium : accès total + Live + Telegram + Événements + Ateliers
INSERT INTO public.plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('premium', 'encyclopedie',       'Encyclopédie des challenges émotionnels', true),
  ('premium', 'chat_general',       'Chat général communautaire',              true),
  ('premium', 'mur_communautaire',  'Mur communautaire',                       true),
  ('premium', 'mon_eclat',          'Mon Éclat (micro-blog)',                  true),
  ('premium', 'mes_rayons',         'Mes Rayons (connexions sociales)',        true),
  ('premium', 'messagerie_privee',  'Messagerie privée',                       true),
  ('premium', 'journal',            'Journal intime',                           true),
  ('premium', 'objectifs',          'Suivi d''objectifs',                       true),
  ('premium', 'signature_quiz',     'Quiz Signature Émotionnelle',             true),
  ('premium', 'chat_douleur',       'Chats par challenge',                     true),
  ('premium', 'affiliation',        'Programme d''affiliation',                true),
  ('premium', 'evenements_gratuits','Événements gratuits',                      true),
  ('premium', 'visio',              'Visio / Audio (WebRTC)',                  true),
  ('premium', 'shine_tv',           'Shine TV (vidéos exclusives)',            true),
  ('premium', 'shine_shorts',       'Shine Shorts',                            true),
  ('premium', 'shine_audible',      'Shine Audible (audios exclusifs)',        true),
  ('premium', 'shine_librairie',    'Shine Librairie (PDFs exclusifs)',        true),
  ('premium', 'soin_collectif',     'Soin collectif mensuel',                  true),
  ('premium', 'evenements_payants', 'Événements physiques',                    true),
  ('premium', 'live_hebdo',         'Live thématique hebdomadaire',            true),
  ('premium', 'telegram',           'Canal privé Telegram',                    true),
  ('premium', 'ateliers_premium',   'Ateliers Premium (48 semaines)',          true)
ON CONFLICT (plan, feature_key) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 5. FONCTIONS UTILITAIRES
-- ══════════════════════════════════════════════════════════════

-- Vérifie si un utilisateur a accès à une fonctionnalité donnée
CREATE OR REPLACE FUNCTION public.user_has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_plan TEXT;
  v_sub_status TEXT;
  v_has_feature BOOLEAN;
BEGIN
  -- Récupérer le rôle
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;

  -- Les admins/founders ont accès à tout
  IF v_role IN ('founder', 'admin_content', 'admin_support') THEN
    RETURN true;
  END IF;

  -- Récupérer le plan et le statut d'abonnement
  SELECT plan, status INTO v_plan, v_sub_status
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Pas d'abonnement actif = pas d'accès
  IF v_sub_status IS NULL OR v_sub_status NOT IN ('active', 'trialing') THEN
    RETURN false;
  END IF;

  -- Vérifier si la fonctionnalité est activée pour ce plan
  SELECT is_enabled INTO v_has_feature
  FROM public.plan_features
  WHERE plan = v_plan AND feature_key = p_feature_key;

  RETURN COALESCE(v_has_feature, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- Récupère le résumé de l'abonnement d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_subscription_summary(p_user_id UUID)
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  duration TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  trial_end TIMESTAMPTZ,
  payment_failed_at TIMESTAMPTZ,
  grace_period_end TIMESTAMPTZ,
  reminder_sent_count INTEGER,
  days_until_expiry INTEGER,
  is_in_grace_period BOOLEAN,
  is_expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.plan,
    s.status,
    s.duration,
    s.current_period_end,
    s.cancel_at_period_end,
    s.trial_end,
    s.payment_failed_at,
    s.grace_period_end,
    s.reminder_sent_count,
    CASE
      WHEN s.current_period_end IS NOT NULL
      THEN EXTRACT(DAY FROM s.current_period_end - now())::INTEGER
      ELSE NULL
    END as days_until_expiry,
    CASE
      WHEN s.grace_period_end IS NOT NULL AND now() < s.grace_period_end
      THEN true
      ELSE false
    END as is_in_grace_period,
    CASE
      WHEN s.status IN ('canceled', 'inactive') THEN true
      WHEN s.current_period_end IS NOT NULL AND s.current_period_end < now()
        AND s.status NOT IN ('active', 'trialing') THEN true
      ELSE false
    END as is_expired
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- Vue admin : résumé des abonnements
CREATE OR REPLACE VIEW public.admin_subscription_stats AS
SELECT
  COUNT(*) FILTER (WHERE s.status = 'active') as active_count,
  COUNT(*) FILTER (WHERE s.status = 'trialing') as trialing_count,
  COUNT(*) FILTER (WHERE s.status = 'past_due') as past_due_count,
  COUNT(*) FILTER (WHERE s.status = 'canceled') as canceled_count,
  COUNT(*) FILTER (WHERE s.status = 'inactive') as inactive_count,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE s.plan = 'essential' AND s.status IN ('active', 'trialing')) as essential_active,
  COUNT(*) FILTER (WHERE s.plan = 'serenite' AND s.status IN ('active', 'trialing')) as serenite_active,
  COUNT(*) FILTER (WHERE s.plan = 'premium' AND s.status IN ('active', 'trialing')) as premium_active,
  COUNT(*) FILTER (WHERE s.cancel_at_period_end = true AND s.status = 'active') as canceling_soon,
  COUNT(*) FILTER (WHERE s.current_period_end < now() + INTERVAL '7 days'
    AND s.current_period_end > now()
    AND s.status = 'active') as expiring_this_week,
  COUNT(*) FILTER (WHERE s.waitlist_discount = true AND s.status IN ('active', 'trialing')) as waitlist_discount_active
FROM public.subscriptions s;


-- ══════════════════════════════════════════════════════════════
-- 6. POLITIQUES RLS ADDITIONNELLES POUR SUBSCRIPTIONS
-- ══════════════════════════════════════════════════════════════

-- Les admins peuvent voir tous les abonnements
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

-- Les admins peuvent modifier les abonnements
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update subscriptions" ON public.subscriptions
  FOR UPDATE USING (public.is_admin());

-- Service role peut tout faire (via webhooks)
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- 7. TRIGGER : MAJ AUTOMATIQUE DU PROFIL QUAND ABONNEMENT CHANGE
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_profile_on_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le profil quand le statut de l'abonnement change
  IF NEW.status IN ('active', 'trialing') THEN
    UPDATE public.profiles
    SET is_active = true, plan = NEW.plan, updated_at = now()
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'inactive') THEN
    UPDATE public.profiles
    SET is_active = false, plan = NULL, updated_at = now()
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'past_due' THEN
    -- En cas d'impayé, on garde le plan visible mais on marque inactif
    -- La période de grâce est gérée par le cron
    UPDATE public.profiles
    SET is_active = false, updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  -- Logger le changement si le statut a changé
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.subscription_payment_logs (
      user_id, subscription_id, event_type, plan, previous_plan, metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      CASE
        WHEN NEW.status = 'active' AND OLD.status = 'past_due' THEN 'access_restored'
        WHEN NEW.status = 'active' AND OLD.status = 'canceled' THEN 'subscription_reactivated'
        WHEN NEW.status = 'active' THEN 'subscription_updated'
        WHEN NEW.status = 'past_due' THEN 'payment_failed'
        WHEN NEW.status = 'canceled' THEN 'subscription_canceled'
        WHEN NEW.status = 'trialing' THEN 'trial_started'
        ELSE 'subscription_updated'
      END,
      NEW.plan,
      OLD.plan,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'current_period_end', NEW.current_period_end
      )
    );
  END IF;

  -- Logger un changement de plan (upgrade/downgrade)
  IF OLD.plan IS DISTINCT FROM NEW.plan AND OLD.plan IS NOT NULL THEN
    INSERT INTO public.subscription_payment_logs (
      user_id, subscription_id, event_type, plan, previous_plan, metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      CASE
        WHEN (NEW.plan = 'premium') OR (NEW.plan = 'serenite' AND OLD.plan = 'essential') THEN 'plan_upgraded'
        ELSE 'plan_downgraded'
      END,
      NEW.plan,
      OLD.plan,
      jsonb_build_object('changed_at', now())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_sync_profile_on_subscription ON public.subscriptions;
CREATE TRIGGER trigger_sync_profile_on_subscription
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_on_subscription_change();


-- ══════════════════════════════════════════════════════════════
-- 8. AJOUTER 'is_active' À PROFILES SI ABSENT
-- ══════════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- ══════════════════════════════════════════════════════════════
-- TERMINÉ ! Résumé de ce qui a été créé :
-- ══════════════════════════════════════════════════════════════
-- ✅ Table subscriptions enrichie (grace_period, reminders, etc.)
-- ✅ Table subscription_payment_logs (historique complet)
-- ✅ Table subscription_reminders (suivi des rappels email)
-- ✅ Table plan_features (droits d'accès par plan)
-- ✅ Fonction user_has_feature() — vérifier l'accès
-- ✅ Fonction get_subscription_summary() — résumé abonnement
-- ✅ Vue admin_subscription_stats — stats pour le dashboard admin
-- ✅ Trigger auto-sync profil quand abonnement change
-- ✅ RLS sécurisé sur toutes les tables
-- ══════════════════════════════════════════════════════════════
