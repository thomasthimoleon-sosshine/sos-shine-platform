# Audit des emails — SOS Shine

> Réalisé le 25 août 2026 sur la branche `claude/build-sos-shine-v1-LaIX0`.
> Code lu intégralement + chiffres relevés en direct sur la base Supabase de production.
> Version illustrée : voir l'artifact « Tableau des départs email ».

## 1. Ce qui part vraiment aujourd'hui

Sur 18 points de départ (6 crons + 12 déclencheurs temps réel), **3 envoient encore** :

| Envoi | Déclencheur | Dernier envoi | Volume | État |
|---|---|---|---|---|
| Email 02 — résultat du quiz | Fin quiz Signature V2, temps réel | 24/08/2026 | 84 | ⚠️ doublons |
| Séquence V2 J+1 → J+14 | Cron quotidien 14h00 UTC | 24/08/2026 | ~40/étape | sain |
| Email 01 — relance abandon | Cron horaire | 28/05/2026 | 36 | silencieux, à vérifier |
| Nurturing abonnés / résiliation | Stripe | 02/05/2026 | 28 | dormant (3 abonnements) |
| Séquences CRM (7 parcours) | Mises en pause le 25/04 | 25/04/2026 | 32 | en pause |
| Bienvenue inscription | Création de compte | **jamais** | 0 | **cassé** |
| Campagnes back-office | Manuel / planifié | 20/03/2026 | 24 | inutilisé |

## 2. L'horloge (`vercel.json`, heures UTC)

| Heure | Route | Rôle | État |
|---|---|---|---|
| `:00` chaque h | `/api/cron/campaigns` | Campagnes planifiées | à vide |
| `:15` chaque h | `/api/cron/emails` | File `scheduled_emails` + séquences CRM + rappels événement J‑1 | actif (moteur de référence) |
| `:30` chaque h | `/api/cron/sequences` | Séquences CRM — **ancien moteur, redondant** | à retirer |
| `:00` chaque h | `/api/cron/quiz-abandon` | Email 01 relance abandon | silencieux |
| toutes les 2 h | `/api/cron/subscriptions` | Fins d'essai, impayés, relances, blocage d'accès | à vide |
| `14:00` quotidien | `/api/cron/quiz-emails` | Séquence Signature V2, J+1 → J+14 | actif |

## 3. Les doublons — 3 niveaux

### Niveau A — en production, maintenant
`app/api/quiz-v2/complete/route.ts` envoie l'email 02 **sans vérifier l'historique**. Un rafraîchissement
de la page de résultats renvoie l'email.
**Mesuré hors adresses de test : 23 emails en trop, 12 personnes réelles.** Trois personnes ont reçu
trois fois le même résultat les 21 et 22 août.

### Niveau B — armé, se déclenche au prochain clic sur « Seed séquences »
Chaque parcours transactionnel existe en double : envoi direct par template **et** inscription en
séquence CRM portant les mêmes templates.

| Parcours | Envoi direct | Séquence miroir | Doublons |
|---|---|---|---|
| Inscription | bienvenue + J1/J3/J7/J14 (`auth/callback`) | Parcours Nouvel Inscrit (pas encore en base) | 5 |
| Abonnement | bienvenue + nurturing J1/J3/J7/J14 (`subscription-service`) | Nouvel Abonné + Nurturing (6 étapes) | 5 |
| Résiliation | confirmation + win-back J7 | Résiliation + Win-back | 2 |
| Événements | confirmation + rappel J‑1 (aussi dans `cron/emails`) | Parcours Événements | 2 |
| Affiliation | bienvenue affilié + paiement | Programme Affilié | 2 |
| Renouvellement | échec de paiement | Parcours Renouvellement | 1 |

> **À ne pas faire avant d'avoir tranché :** cliquer sur « Seed séquences » dans le back-office CRM,
> ou repasser une séquence de `paused` à `active`.

### Niveau C — structurel
`/api/cron/emails` et `/api/cron/sequences` lisent la même table `crm_sequence_enrollments` à 15 min
d'intervalle. Le second **ne vérifie pas le statut de la séquence** : une séquence en pause reste
envoyable par ce chemin.

## 4. Ce qui ne part pas — et ne le dit pas

1. **Parcours inscription mort.** Les 5 templates `registration_*` ne sont jamais entrés en base
   (22 templates sur 27). `sendTemplateEmail('registration_welcome')` échoue silencieusement.
2. **Désinscription fictive.** Le pied de page pointe vers `/unsubscribe` — la page n'existe pas (404).
   Pas d'en-tête `List-Unsubscribe`. Aucune route d'envoi ne filtre la colonne `unsubscribed`.
   0 désabonné sur 73 contacts.
3. **Nouveaux membres absents du CRM.** L'inscription ne crée pas de `crm_contacts` ; dernier contact
   source `member` : 18/04. Le segment « Membres inscrits » ignore 4 mois d'inscrits.
4. **Newsletter hebdo orpheline.** 34 inscrits dans `newsletter_weekly_subscribers`, aucun envoi
   n'existe pour cette table.
5. **Code mort / hors circuit.** `/api/signature-lead` n'est appelé par aucune page.
   `/api/quiz-v3/save` instancie Resend directement : il **contourne le coupe-circuit `EMAILS_PAUSED`**,
   sans pixel de suivi ni événement CRM (1 réponse depuis le 28/05).

## 5. Plan d'action

| # | Action | Fichiers | Effort |
|---|---|---|---|
| 1 | Dédoublonner l'email 02 (vérifier `quiz_v2_email_02_sent` avant envoi) | `api/quiz-v2/complete` | ~20 min |
| 2 | Désinscription réelle : page `/unsubscribe`, en-tête `List-Unsubscribe`, filtre `unsubscribed` | `app/unsubscribe`, `automated-emails.ts`, `crm/send`, `cron/campaigns` | ~2 h |
| 3 | Retirer l'ancien moteur de séquences | `vercel.json`, `api/cron/sequences` | ~15 min |
| 4 | Une seule mécanique par parcours (garder l'envoi direct, retirer les `enrollInSequence`) | `auth/callback`, `subscription-service`, `events/register`, `admin/candidatures` | ~3 h |
| 5 | Insérer les 5 templates `registration_*` | `seeds.ts` → `email_templates` | ~30 min |
| 6 | Upsert `crm_contacts` à l'inscription | `auth/callback` | ~20 min |
| 7 | Faire remonter les échecs d'envoi dans le diagnostic back-office | `automated-emails.ts`, `api/crm/automations` | ~2 h |
| 8 | Décider du sort des orphelins (newsletter hebdo, quiz V3, signature-lead) | — | décision produit |
