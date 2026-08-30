-- ═══════════════════════════════════════════════════════════════════════════
-- CORRECTIF DE SÉCURITÉ — refermer les tables ouvertes à la clé publique
--
-- Un motif s'est répété dans tout le projet : des règles d'accès dont le NOM
-- exprime l'intention, et dont le CORPS n'applique aucune restriction.
--
--   CREATE POLICY "Service role full access ..." ON ...
--     FOR ALL USING (true) WITH CHECK (true);
--
-- L'auteur croyait réserver l'accès au rôle de service. C'est l'inverse : la
-- clé de service contourne déjà les règles d'accès, donc une règle pareille
-- n'ouvre l'accès qu'aux AUTRES rôles — anon et authenticated, c'est-à-dire
-- à quiconque dispose de la clé publique, qui est par construction dans le
-- navigateur de tout le monde.
--
-- Ces règles ne lèvent aucune erreur. Elles laissent simplement passer. C'est
-- pourquoi elles ont survécu des mois.
--
-- Ce qui suit a été établi table par table, en cherchant d'abord ce dont
-- l'application a réellement besoin depuis un navigateur. Fermer sans cette
-- vérification aurait cassé la plateforme.
--
-- Convention retenue partout :
--   • lecture  : la personne concernée, ou l'équipe (public.is_admin())
--   • écriture : le rôle de service, sauf là où un écran du back-office écrit
--                réellement depuis le navigateur — alors is_admin()
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. profiles — l'élévation de privilèges
--
-- La règle de modification vérifiait la LIGNE (« c'est bien la tienne ») mais
-- aucune COLONNE. Or `role` vit dans cette table, et c'est précisément ce que
-- lit public.is_admin(). Un membre pouvait donc s'inscrire role='founder' et
-- prendre le back-office, le courrier anonyme, les retraits, tout.
--
-- Une règle d'accès ne sait pas restreindre une colonne : il faut un
-- déclencheur. Il rétablit silencieusement les anciennes valeurs plutôt que
-- de lever une erreur — ainsi une mise à jour légitime des autres champs
-- (prénom, bio, avatar) continue de passer, et rien ne casse.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.proteger_colonnes_profil()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.uid() est NULL quand l'appel vient du rôle de service (webhooks
  -- Stripe, routes d'administration) : ces chemins-là sont légitimes.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.role                 := OLD.role;
  NEW.plan                 := OLD.plan;
  NEW.email                := OLD.email;
  NEW.is_bot               := OLD.is_bot;
  NEW.is_active            := OLD.is_active;
  NEW.publish_banned_until := OLD.publish_banned_until;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS proteger_colonnes_profil ON public.profiles;
CREATE TRIGGER proteger_colonnes_profil
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.proteger_colonnes_profil();

-- La lecture des profils était ouverte à tous, sans compte : prénom, e-mail,
-- rôle, formule et date de naissance de chaque membre. Le seul lecteur
-- navigateur légitime est un membre connecté (annuaire, mur, partage).
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "profiles_select_membres" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. subscriptions — l'abonnement gratuit
--
-- Aucun écran n'écrit dans cette table depuis un navigateur : tout passe par
-- le webhook Stripe, en rôle de service. La lecture, elle, sert au tableau de
-- bord du membre et aux écrans d'administration.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- 3. CRM et prospects — le fichier de contacts
--
-- Six tables plus signature_leads, toutes en USING (true). L'écran /admin/crm
-- lit depuis le navigateur, et modifie les séquences et leurs étapes. Le
-- reste passe par des routes serveur.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service role full access crm_contacts"             ON public.crm_contacts;
DROP POLICY IF EXISTS "Service role full access crm_campaigns"            ON public.crm_campaigns;
DROP POLICY IF EXISTS "Service role full access crm_campaign_events"      ON public.crm_campaign_events;
DROP POLICY IF EXISTS "Service role full access crm_sequences"            ON public.crm_sequences;
DROP POLICY IF EXISTS "Service role full access crm_sequence_steps"       ON public.crm_sequence_steps;
DROP POLICY IF EXISTS "Service role full access crm_sequence_enrollments" ON public.crm_sequence_enrollments;
DROP POLICY IF EXISTS "Service role can read signature leads"             ON public.signature_leads;
-- L'insertion anonyme de prospects ne sert plus : la capture passe
-- entièrement par /api/signature-lead, en rôle de service.
DROP POLICY IF EXISTS "Anyone can submit signature lead"                  ON public.signature_leads;

CREATE POLICY "crm_contacts_admin"        ON public.crm_contacts        FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_campaigns_admin"       ON public.crm_campaigns       FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_campaign_events_admin" ON public.crm_campaign_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_enrollments_admin"     ON public.crm_sequence_enrollments FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "signature_leads_admin"     ON public.signature_leads     FOR SELECT TO authenticated USING (public.is_admin());

-- Ces deux-là sont modifiées depuis /admin/crm : l'équipe garde la main.
CREATE POLICY "crm_sequences_admin"      ON public.crm_sequences      FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "crm_sequence_steps_admin" ON public.crm_sequence_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- 4. email_templates / scheduled_emails — les envois usurpés
--
-- Tables ouvertes en lecture et en écriture : on pouvait réécrire un gabarit
-- transactionnel et programmer un envoi depuis le domaine de SOS Shine.
-- Aucun navigateur n'y touche : tout passe par des routes serveur.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service role full access email_templates"  ON public.email_templates;
DROP POLICY IF EXISTS "Service role full access scheduled_emails" ON public.scheduled_emails;
DROP POLICY IF EXISTS "Service role can manage email_templates"   ON public.email_templates;
DROP POLICY IF EXISTS "Service role can manage scheduled_emails"  ON public.scheduled_emails;

CREATE POLICY "email_templates_admin"  ON public.email_templates  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "scheduled_emails_admin" ON public.scheduled_emails FOR SELECT TO authenticated USING (public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- 5. physical_events — le lien de paiement détournable
--
-- La colonne stripe_url porte le lien affiché sur la page publique /event.
-- La table étant modifiable par tous, on pouvait y substituer son propre lien
-- et encaisser les acomptes. La lecture publique des événements publiés est
-- légitime et reste ouverte ; l'écriture revient à l'équipe.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "physical_events_admin_all" ON public.physical_events;
CREATE POLICY "physical_events_admin_all" ON public.physical_events
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- 6. quiz_v3_responses — même faute que le questionnaire corrigé ce matin
--
-- FOR UPDATE USING (true) : n'importe qui pouvait altérer ou vider les
-- réponses du questionnaire approfondi de tout le monde, e-mails et dates de
-- naissance compris. Toutes les écritures passent par /api/quiz-v3/*, en rôle
-- de service. La règle de lecture, elle, était déjà correcte.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "quiz_v3_update_all"      ON public.quiz_v3_responses;
DROP POLICY IF EXISTS "quiz_v3_responses_update" ON public.quiz_v3_responses;
DROP POLICY IF EXISTS "Anyone can update quiz v3" ON public.quiz_v3_responses;

-- ───────────────────────────────────────────────────────────────────────────
-- 7. ceremonie_reservations — le statut de paiement modifiable
--
-- On pouvait faire passer sa réservation de « en attente » à « payé », ou
-- changer le nom et l'adresse attachés à celle d'une autre personne.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "ceremonie_update_all"        ON public.ceremonie_reservations;
DROP POLICY IF EXISTS "ceremonie_reservations_update" ON public.ceremonie_reservations;
DROP POLICY IF EXISTS "Anyone can update reservations" ON public.ceremonie_reservations;

DROP POLICY IF EXISTS "ceremonie_reservations_admin" ON public.ceremonie_reservations;
CREATE POLICY "ceremonie_reservations_admin" ON public.ceremonie_reservations
  FOR SELECT TO authenticated USING (public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- 8. courrier_anonyme — signer au nom d'un autre
--
-- L'insertion était en WITH CHECK (true) : rien n'obligeait le user_id posé
-- sur le message à être celui de l'auteur.
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "courrier_insert_any" ON public.courrier_anonyme;
DROP POLICY IF EXISTS "Anyone can insert courrier" ON public.courrier_anonyme;
DROP POLICY IF EXISTS "courrier_anonyme_insert" ON public.courrier_anonyme;
CREATE POLICY "courrier_anonyme_insert" ON public.courrier_anonyme
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

COMMIT;

-- Ces colonnes sont désormais lues à chaque vérification d'accès.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

NOTIFY pgrst, 'reload schema';
