# Catalogue des emails — SOS Shine

> Relevé le 25 août 2026 sur la base Supabase de production + le code de cette branche.
> **47 emails distincts** : 14 étapes de séquence active · 22 modèles en base · 11 codés en dur.
> Les 5 emails d'inscription sont écrits dans le code mais absents de la base.
> Les 22 étapes des 7 séquences en pause sont des *copies* des modèles, pas des emails supplémentaires.

| | |
|---|---|
| Emails distincts | **47** |
| Branchés (le code sait les envoyer) | **35** |
| Réellement partis depuis mai | **16** |
| Orphelins (rien ne les déclenche) | **12** |
| Envois en double constatés | **23** (12 personnes) |

---

## Famille A — Le tunnel Quiz (le seul vivant)

16 envois sur 15 jours. Les deux premiers **ne sont pas éditables au back-office** : les lignes
correspondantes en base (étapes 1 et 2) sont décoratives, le cron les ignore (`delay_days = 0`).

| Moment | Objet | Déclencheur | Modifiable |
|---|---|---|---|
| H+1 | Tu t'es arrêtée. Et je crois savoir pourquoi. | `cron/quiz-abandon` — quiz non terminé | ❌ code |
| immédiat | {firstName}, voilà ce que tes 15 réponses ont révélé | `api/quiz-v2/complete` | ❌ code — ⚠️ **doublons** |
| J+1 | Une question qui va peut-être te déranger. | cron 14h00 UTC | ✅ back-office |
| J+2 | Ce qui se passe en toi depuis 48h. | cron 14h00 UTC | ✅ |
| J+3 | Moi aussi, j'étais à ta place. | cron 14h00 UTC | ✅ |
| J+4 | Quand elle a compris comment elle fonctionnait, tout a changé. | cron 14h00 UTC | ✅ |
| J+5 | Un petit cadeau pour aujourd'hui. | cron 14h00 UTC | ✅ |
| J+6 | « Je n'ai pas le temps. » | cron 14h00 UTC | ✅ |
| J+7 | Combien vaut le fait de respirer enfin. | cron 14h00 UTC | ✅ |
| J+8 | Une pensée avant la nuit. | cron 14h00 UTC | ✅ |
| J+9 | Le cerveau adore attendre. | cron 14h00 UTC | ✅ |
| J+10 | Voilà ce qui va se passer concrètement. | cron 14h00 UTC | ✅ |
| J+11 | Il m'arrive de douter, moi aussi. | cron 14h00 UTC | ✅ |
| J+12 | Les 3 phrases qu'on se dit pour ne pas commencer. | cron 14h00 UTC | ✅ |
| J+13 | Dans 6 mois, à quoi ressemble ta vie ? | cron 14h00 UTC | ✅ |
| J+14 | Le dernier mail. Avec un cadeau. | cron 14h00 UTC | ✅ |
| J+15 | *(rien)* | bascule vers `newsletter_weekly_subscribers` | ⚠️ **cul-de-sac** — 34 personnes, aucun envoi |

## Famille B — Les 22 modèles en base (`email_templates`)

### Inscription — 0 sur 5 (⚠️ manquants en base)
`registration_welcome` · `registration_conversion_j1` · `_j3` · `_j7` · `_j14`
Textes écrits dans `lib/email-templates/seeds.ts`, jamais insérés. Le code les demande, ne les trouve
pas, échoue en silence. **Aucun inscrit n'a reçu de mot de bienvenue.**

### Liste d'attente — 3 (en pause)
| Délai | Objet | Clé |
|---|---|---|
| J0 | {firstName}, bienvenue sur la liste d'attente SOS Shine ! | `waitlist_confirmation` |
| J+3 | {firstName}, votre place est réservée... | `waitlist_reminder_j3` |
| manuel | {firstName}, les portes de SOS Shine sont ouvertes ! | `waitlist_opening` — aucun bouton |

### Quiz Signature — 3 (périmés, remplacés par la V2)
`quiz_result` · `quiz_followup_j2` · `quiz_conversion_j5`

### Abonnement + nurturing — 6
| Délai | Objet | Clé | État |
|---|---|---|---|
| J0 | Bienvenue dans la famille SOS Shine, {firstName} ! | `subscription_welcome` | branché |
| J0 | Confirmation de votre abonnement SOS Shine — {planAmount}/mois | `subscription_confirmation` | **orphelin** |
| J+1 | {firstName}, votre premier pas lumineux | `nurturing_j1` | branché |
| J+3 | {firstName}, offrez-vous une pause méditative | `nurturing_j3` | branché |
| J+7 | Déjà 1 semaine, {firstName} ! Comment vous sentez-vous ? | `nurturing_j7` | branché |
| J+14 | {firstName}, relevez votre premier défi Shine ! | `nurturing_j14` | branché |

### Renouvellement — 3
| Délai | Objet | Clé | État |
|---|---|---|---|
| J−7 | {firstName}, votre abonnement se renouvelle bientôt | `renewal_reminder_j7` | **orphelin** |
| J0 | Votre abonnement SOS Shine a été renouvelé | `renewal_success` | **orphelin** |
| J0 | {firstName}, un problème avec votre paiement | `renewal_failed` | branché |

### Résiliation — 2
`cancellation_confirmation` (J0) · `cancellation_winback_j7` (J+7) — les deux branchés

### Programme affilié — 3
| Objet | Clé | État |
|---|---|---|
| {firstName}, bienvenue dans le programme ambassadeur SOS Shine ! | `affiliate_welcome` | branché |
| Bravo {firstName} ! Un nouveau filleul vient de s'inscrire | `affiliate_referral` | **orphelin** |
| {firstName}, votre virement SOS Shine est en route ! | `affiliate_payout` | branché |

### Événements — 2
`event_registration` (J0) · `event_reminder` (J−1, via `cron/emails`) — les deux branchés

## Famille C — Les 7 séquences en pause (22 étapes, **aucun email inédit**)

Copies mot pour mot des modèles de la famille B, recopiées le 22 mars, mises en pause le 25 avril.

| Séquence | Étapes | Rejoue | Inscrits |
|---|---|---|---|
| Nouvel Abonné + Nurturing | 6 | subscription_welcome, _confirmation, nurturing ×4 | 4 |
| Signature Émotionnelle | 3 | quiz_result, _followup_j2, _conversion_j5 | 14 |
| Liste d'attente | 3 | waitlist ×3 | 0 |
| Renouvellement | 3 | renewal ×3 | 0 |
| Programme Affilié | 3 | affiliate ×3 | 0 |
| Résiliation + Win-back | 2 | cancellation ×2 | 3 |
| Parcours Événements | 2 | event ×2 | 0 |

> **Défaut de recopie :** les délais négatifs sont perdus. `renewal_reminder_j7` (J−7) et
> `event_reminder` (J−1) sont tous deux à **J0** dans les séquences. Les réactiver enverrait
> ces rappels au mauvais moment, en plus de doubler les envois directs.

## Famille D — Les 11 emails codés en dur (non modifiables au back-office)

| Moment | Objet | Fichier | État |
|---|---|---|---|
| H+1 | Tu t'es arrêtée. Et je crois savoir pourquoi. | `quiz-v2/email-01-capture.ts` | actif |
| immédiat | {firstName}, voilà ce que tes 15 réponses ont révélé | `quiz-v2/email-02-result.ts` | ⚠️ doublons |
| immédiat | {firstName}, votre lecture personnalisée SOS Shine | `quiz-v3-result.ts` | ⚠️ contourne `EMAILS_PAUSED` |
| immédiat | {firstName}, votre Signature Émotionnelle : {archetype} | `signature-result.ts` | code mort |
| immédiat | Inscription confirmée — {événement} | inline `api/ceremonie/reserve` | actif |
| immédiat | {firstName}, le protocole {titre} vient d'arriver pour toi | `quiz-v2/email-notification-protocol.ts` | sans interface |
| immédiat | ⚠️ {firstName}, votre paiement SOS Shine n'a pas abouti | `cron/subscriptions` `payment_failed_1` | actif |
| J+3 | 🔔 Rappel : mettez à jour votre paiement SOS Shine | `payment_failed_2` | actif |
| J+7 | 🚨 Dernier rappel avant suspension - SOS Shine | `payment_failed_3` | actif |
| J−3 | 💎 Votre abonnement SOS Shine expire bientôt | `expiring_soon` | actif |
| fin de grâce | 🔒 Votre accès SOS Shine a été suspendu | `access_blocked` | actif |

> **Écart de ton :** les 5 rappels de paiement utilisent des emojis d'alerte et une mise en page
> distincte du reste — jamais harmonisés avec la charte des autres emails.

---

## Les 4 types de doublons

1. **Actif — le résultat du quiz repart à chaque validation.** `api/quiz-v2/complete` envoie sans
   vérifier l'historique. Un rafraîchissement de la page = un email de plus.
   **23 emails en trop, 12 personnes** (voir liste ci-dessous).
2. **Désamorcé par la pause — chaque parcours transactionnel existe en double.** 12 modèles envoyés
   directement par le code *et* recopiés dans une séquence. Le bouton « Seed séquences » les rallume.
3. **Latent — deux moteurs sur la même table.** `cron/emails` (:15) et `cron/sequences` (:30) traitent
   tous deux `crm_sequence_enrollments`. Le second **ignore le statut « en pause »**.
4. **Cosmétique — deux étapes fantômes** en tête de la séquence V2 (voir famille A).

### Qui a reçu quoi en double (adresses de test exclues)

| Personne | Email | Reçus | Quand |
|---|---|---|---|
| marchanddeairbnb@gmail.com | résultat du quiz | 4 | 4–5 mai |
| aurelie.rascle@hotmail.fr | résultat du quiz | 3 | 22 août |
| emma.mazzarese06@gmail.com | résultat du quiz | 3 | 21 août |
| lou.dmrf@gmail.com | résultat du quiz | 3 | 21 août |
| immoinvestissementfrance@gmail.com | résultat + relance abandon | 3 + 3 | 7–22 mai |
| thomas.thimoleon2@gmail.com | résultat + relance abandon | 3 + 2 | mai → août |
| cabritjulia@gmail.com | résultat du quiz | 2 | 28 mai |
| clem.salles@hotmail.fr | résultat du quiz | 2 | 28 mai |
| irenesuisse24@gmail.com | résultat du quiz | 2 | 17 juin |
| lefrancoiscindy@yahoo.fr | résultat du quiz | 2 | juin + août |
| meriem.douro@vitamina-dz.com | résultat du quiz | 2 | 28 avril |
| noemie.aupart@hotmail.fr | résultat du quiz | 2 | 30 avril |

---

## Où modifier quoi

| Pour changer… | On va… | Emails |
|---|---|---|
| Les 14 emails du tunnel quiz (J+1 → J+14) | Back-office → CRM → Séquences → Signature V2, étapes 3 à 16 | 14 |
| Les modèles transactionnels | Back-office → CRM → Modèles d'emails | 22 |
| Les 2 premiers emails du quiz (résultat compris) | `lib/email-templates/quiz-v2/` — développeur | 2 |
| Les 5 rappels de paiement | `app/api/cron/subscriptions/route.ts` — développeur | 5 |
| Cérémonie, notif protocole, quiz V3, ancien quiz | fichiers dédiés — développeur | 4 |
| Les 5 emails d'inscription | nulle part — à insérer en base d'abord | 5 |
