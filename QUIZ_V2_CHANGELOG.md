# Quiz V2 — Changelog & Documentation

**Date de déploiement :** 25 avril 2026
**Auteur :** Claude Code

---

## Fichiers créés

### Scoring & Questions
- `lib/quiz-v2/dimensions.ts` — 10 dimensions émotionnelles
- `lib/quiz-v2/questions.ts` — 15 questions, 7 types d'input
- `lib/quiz-v2/scoring.ts` — moteur scoring multidimensionnel
- `lib/quiz-v2/result-texts.ts` — textes dynamiques 10 dimensions × 3 actes
- `lib/quiz-v2/index.ts` — barrel exports
- `config/scoring-keywords.json` — mots-clés pour scoring champs libres

### Composants Quiz
- `components/quiz-v2/QuizProgress.tsx` — barre de progression animée
- `components/quiz-v2/SingleChoice.tsx` — choix unique + autre
- `components/quiz-v2/MultiChoice.tsx` — multi-sélection + autre
- `components/quiz-v2/SliderInput.tsx` — slider 1-10
- `components/quiz-v2/FreeTextInput.tsx` — texte libre + suggestions
- `components/quiz-v2/EmailCapture.tsx` — capture email interstitielle
- `components/quiz-v2/ResultPage.tsx` — page résultat 6 actes

### API Routes
- `app/api/quiz-v2/save/route.ts` — sauvegarde temps réel
- `app/api/quiz-v2/track/route.ts` — tracking events
- `app/api/quiz-v2/email-capture/route.ts` — capture email + envoi Email 1
- `app/api/quiz-v2/complete/route.ts` — finalisation + envoi Email 2
- `app/api/cron/quiz-emails/route.ts` — séquence J+1 à J+14
- `app/api/email-preview/route.ts` — preview design email

### Email Templates (16 + 1 notification)
- `lib/email-templates/quiz-v2/wrapper.ts` — wrapper HTML premium
- `lib/email-templates/quiz-v2/email-01-capture.ts` à `email-16-dernier.ts`
- `lib/email-templates/quiz-v2/email-notification-protocol.ts`

### Migrations SQL
- `supabase/migrations/20260425_quiz_v2.sql` — 5 tables + 7 protocoles
- `supabase/migrations/20260425_pause_old_sequences.sql` — suspension anciennes séquences

### Backups
- `lib/signature-test.ts.backup`
- `app/signature-emotionnelle/page.tsx.backup`
- `lib/email-templates/signature-result.ts.backup`
- `app/api/signature-lead/route.ts.backup`

### Rollback
- `scripts/rollback-quiz-v2.sh`

## Fichiers modifiés
- `app/signature-emotionnelle/page.tsx` — remplacement complet par Quiz V2
- `vercel.json` — ajout cron quiz-emails (14h quotidien)

---

## Migrations SQL à exécuter

### 1. Tables Quiz V2 (déjà exécuté)
`supabase/migrations/20260425_quiz_v2.sql`

### 2. Suspension anciennes séquences (À EXÉCUTER)
```sql
UPDATE crm_sequences SET status = 'paused', updated_at = NOW() WHERE status = 'active';

INSERT INTO crm_campaign_events (contact_email, event_type, metadata)
VALUES ('system@sosshine.com', 'sequences_paused_for_v2',
  '{"reason": "Quiz V2 deployment"}'::jsonb);

INSERT INTO crm_sequences (trigger_type, status)
VALUES ('signature_test_v2', 'active')
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
```

---

## Cron Jobs

| Cron | Path | Schedule | Description |
|------|------|----------|-------------|
| Quiz emails | `/api/cron/quiz-emails` | `0 14 * * *` (14h UTC chaque jour) | Envoie les emails J+1 à J+14 |

---

## Séquence email (16 emails sur 14 jours)

| Jour | Email | Objet | CTA |
|------|-------|-------|-----|
| J0 (immédiat) | 01 — Capture | "j'attends ta réponse..." | Terminer mon test |
| J0 (immédiat) | 02 — Résultat | "voilà ce que tes réponses ont dit" | Voir résultat + Sérénité |
| J+1 14h | 03 — Question | "une question qui va te déranger" | Aucun |
| J+2 14h | 04 — Pourquoi | "ce qui se passe en toi depuis 48h" | Aucun |
| J+3 10h | 05 — Histoire Julia | "moi aussi j'étais à ta place" | Sérénité |
| J+4 14h | 06 — Témoignage | "j'ai pleuré en lisant ma Signature" | Sérénité 7j |
| J+5 9h | 07 — Pratique | "essaie ça pendant 3 minutes" | Aucun (réponse directe) |
| J+6 14h | 08 — Temps | "je n'ai pas le temps" | Sérénité 7j |
| J+7 14h | 09 — Argent | "combien vaut ta paix intérieure ?" | Sérénité 7j |
| J+8 18h | 10 — Repos | "une pensée pour toi ce soir" | Aucun |
| J+9 10h | 11 — Bascule | "5 jours pour décider" | Sérénité 7j |
| J+10 14h | 12 — Dedans | "ce qui se passe si tu dis oui" | Sérénité |
| J+11 14h | 13 — Doute | "je doute aussi parfois" | Sérénité |
| J+12 14h | 14 — 3 raisons | "3 raisons pour lesquelles tu hésites" | Sérénité |
| J+13 14h | 15 — Avant-dernier | "demain je te dis au revoir" | Sérénité |
| J+14 14h | 16 — Dernier | "dernier message + cadeau PDF" | Sérénité + PDF |

---

## Plan de rollback

```bash
./scripts/rollback-quiz-v2.sh
```

Restaure les 4 fichiers backup + imprime le SQL pour désactiver les tables V2.

---

## Tests manuels recommandés

1. Faire le quiz complet (15 questions) → vérifier page résultat
2. Vérifier que l'email de capture (Email 1) arrive si on abandonne après Q10
3. Vérifier que l'email de résultat (Email 2) arrive après Q15
4. Tester sur mobile (iPhone SE, 14 Pro)
5. Vérifier les liens Stripe dans les emails
6. Vérifier le lien de désinscription
7. Tester le preview à `/api/email-preview`
