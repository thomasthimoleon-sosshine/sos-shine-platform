-- ═══════════════════════════════════════════════════════════════
-- CORRECTIF DE SÉCURITÉ — quiz_v2_responses
--
-- Les règles d'accès posées en avril comparaient  session_id = session_id.
-- Une colonne comparée à elle-même est toujours vraie : la condition ne
-- filtrait rien. En clair, n'importe qui — même sans compte — pouvait lire
-- et modifier les réponses au questionnaire de signature émotionnelle de
-- tout le monde : prénom, e-mail, réponses, scores, dimension dominante.
--
-- L'auteur voulait manifestement écrire « la ligne dont le session_id est
-- celui du visiteur ». Mais SQL n'a aucun moyen de connaître le session_id
-- du navigateur : il n'est ni dans le jeton, ni dans la requête. La règle
-- ne pouvait donc pas être écrite ainsi, et personne ne s'en est aperçu
-- parce qu'elle ne provoquait aucune erreur — elle laissait juste passer.
--
-- Rien dans l'application ne dépendait de cette permissivité : les quatre
-- routes /api/quiz-v2/* écrivent avec la clé de service, qui ne passe pas
-- par ces règles, et le questionnaire côté navigateur ne lit jamais cette
-- table. Le seul accès légitime depuis un navigateur est celui d'un membre
-- connecté qui relit sa propre signature (lib/protocole-actif.ts), par
-- user_id ou par e-mail.
--
-- On ferme donc à : sa propre ligne, et l'équipe.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

DROP POLICY IF EXISTS "quiz_v2_responses_select_own" ON public.quiz_v2_responses;
DROP POLICY IF EXISTS "quiz_v2_responses_update_own" ON public.quiz_v2_responses;
-- Écriture ouverte à tous alors qu'aucun navigateur n'écrit ici : cela ne
-- servait qu'à laisser polluer la table.
DROP POLICY IF EXISTS "quiz_v2_responses_insert_anon" ON public.quiz_v2_responses;

-- Un membre connecté relit sa propre signature. Deux chemins, parce que le
-- questionnaire se passe avant l'inscription : la ligne est rattachée au
-- compte par user_id à la connexion, mais tant que ce rattachement n'a pas
-- eu lieu, l'e-mail est le seul lien. LOWER des deux côtés : une adresse
-- saisie « Prenom@… » ne doit pas échapper à son propriétaire.
CREATE POLICY "quiz_v2_responses_select_own" ON public.quiz_v2_responses
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  );

-- L'équipe garde son accès complet : la règle quiz_v2_responses_admin
-- (FOR ALL USING public.is_admin()) posée en avril reste en place.

COMMIT;

-- Ces deux colonnes sont désormais lues à chaque vérification d'accès.
-- Sans index, chaque lecture parcourt la table entière.
CREATE INDEX IF NOT EXISTS idx_quiz_v2_user ON public.quiz_v2_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_v2_email_lower ON public.quiz_v2_responses(LOWER(email));

NOTIFY pgrst, 'reload schema';
