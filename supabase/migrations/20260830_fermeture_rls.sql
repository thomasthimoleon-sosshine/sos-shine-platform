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
--
-- ── Pourquoi on vide les règles au lieu de les nommer ──────────────────────
--
-- Première version : on supprimait les règles par leur nom, tirés du dépôt.
-- L'exécution a buté sur une règle « email_templates_admin » présente en base
-- et absente du dépôt — passée à la main. En vérifiant, trois autres portaient
-- un nom que le dépôt ne donnait pas : quiz_v3_update_session,
-- ceremonie_update_webhook, « Members can insert courrier ».
--
-- Les règles d'accès se cumulent : une seule règle ouverte laissée en place
-- rouvre la table entière. Nommer, c'est deviner. On vide donc tout ce qui
-- existe sur chaque table, quel que soit le nom, puis on recrée exactement
-- l'ensemble voulu.
-- ═══════════════════════════════════════════════════════════════════════════


BEGIN;

-- Supprime toutes les règles d'accès d'une table, quel que soit leur nom.
CREATE OR REPLACE FUNCTION public.vider_policies(nom_table TEXT)
RETURNS void AS $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = nom_table
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, nom_table);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ── 1. profiles — l'élévation de privilèges ────────────────────────────────
-- La règle de modification vérifiait la LIGNE (« c'est bien la tienne ») mais
-- aucune COLONNE. Or `role` vit dans cette table, et c'est précisément ce que
-- lit public.is_admin() : un membre pouvait s'inscrire role='founder'.
--
-- Une règle d'accès ne sait pas restreindre une colonne : il faut un
-- déclencheur. Il rétablit silencieusement les anciennes valeurs plutôt que de
-- lever une erreur — ainsi une mise à jour légitime des autres champs
-- (prénom, bio, avatar) continue de passer, et rien ne casse.

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
-- rôle, formule et date de naissance de chaque membre.
SELECT public.vider_policies('profiles');
CREATE POLICY "profiles_select_membres" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin());

-- ── 2. subscriptions — l'abonnement gratuit ────────────────────────────────
-- Aucun écran n'écrit dans cette table depuis un navigateur : tout passe par
-- le webhook Stripe, en rôle de service.
SELECT public.vider_policies('subscriptions');
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "subscriptions_update_admin" ON public.subscriptions
  FOR UPDATE TO authenticated USING (public.is_admin());

-- ── 3. CRM et prospects — le fichier de contacts ───────────────────────────
-- L'écran /admin/crm lit depuis le navigateur, et modifie les séquences et
-- leurs étapes. Le reste passe par des routes serveur.
SELECT public.vider_policies('crm_contacts');
SELECT public.vider_policies('crm_campaigns');
SELECT public.vider_policies('crm_campaign_events');
SELECT public.vider_policies('crm_sequence_enrollments');
SELECT public.vider_policies('signature_leads');
CREATE POLICY "crm_contacts_admin"        ON public.crm_contacts             FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_campaigns_admin"       ON public.crm_campaigns            FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_campaign_events_admin" ON public.crm_campaign_events      FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "crm_enrollments_admin"     ON public.crm_sequence_enrollments FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "signature_leads_admin"     ON public.signature_leads          FOR SELECT TO authenticated USING (public.is_admin());

SELECT public.vider_policies('crm_sequences');
SELECT public.vider_policies('crm_sequence_steps');
CREATE POLICY "crm_sequences_admin"      ON public.crm_sequences      FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "crm_sequence_steps_admin" ON public.crm_sequence_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 4. email_templates / scheduled_emails — les envois usurpés ─────────────
-- On pouvait réécrire un gabarit transactionnel et programmer un envoi depuis
-- le domaine de SOS Shine. Aucun navigateur n'y écrit.
SELECT public.vider_policies('email_templates');
SELECT public.vider_policies('scheduled_emails');
CREATE POLICY "email_templates_lecture_admin"  ON public.email_templates  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "scheduled_emails_lecture_admin" ON public.scheduled_emails FOR SELECT TO authenticated USING (public.is_admin());

-- ── 5. physical_events — le lien de paiement détournable ───────────────────
-- La colonne stripe_url porte le lien affiché sur la page publique /event.
-- La lecture publique des événements publiés reste ouverte.
SELECT public.vider_policies('physical_events');
CREATE POLICY "physical_events_public_read" ON public.physical_events
  FOR SELECT USING (is_published = true);
CREATE POLICY "physical_events_admin_all" ON public.physical_events
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 6. quiz_v3_responses — même faute que le questionnaire corrigé ─────────
-- La règle ouverte s'appelait quiz_v3_update_session, pas le nom deviné.
SELECT public.vider_policies('quiz_v3_responses');
CREATE POLICY "quiz_v3_select_admin" ON public.quiz_v3_responses
  FOR SELECT TO authenticated USING (public.is_admin());

-- ── 7. ceremonie_reservations — le statut de paiement modifiable ───────────
-- Idem : la règle s'appelait ceremonie_update_webhook.
SELECT public.vider_policies('ceremonie_reservations');
CREATE POLICY "ceremonie_select_admin" ON public.ceremonie_reservations
  FOR SELECT TO authenticated USING (public.is_admin());

-- ── 8. courrier_anonyme — signer au nom d'un autre ─────────────────────────
SELECT public.vider_policies('courrier_anonyme');
CREATE POLICY "courrier_insert_soi" ON public.courrier_anonyme
  FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "courrier_select_admin" ON public.courrier_anonyme
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "courrier_update_admin" ON public.courrier_anonyme
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP FUNCTION public.vider_policies(TEXT);

COMMIT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

NOTIFY pgrst, 'reload schema';
