# QUIZ AUDIT — Système "Signature Émotionnelle" existant

**Date :** 24 avril 2026
**Objectif :** Investigation complète avant refonte quiz V2

---

## 1. FICHIERS DU QUIZ ACTUEL

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `/app/signature-emotionnelle/page.tsx` | 642 | Page principale — 5 phases : intro → quiz → loading → email → result |
| `/lib/signature-test.ts` | 330 | 15 questions, 10 profils (P1-P10), scoring, textes résultats |
| `/app/api/signature-lead/route.ts` | 134 | API capture email, upsert Supabase, CRM enroll, envoi email Resend |
| `/lib/email-templates/signature-result.ts` | 190 | Template HTML email résultat (responsive, 600px, table-based) |

---

## 2. STRUCTURE SUPABASE EXISTANTE

### Table `signature_leads` (migration `20260310_crm_tables.sql`, ligne 8-16)

```
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       TEXT NOT NULL (UNIQUE index)
first_name  TEXT
profile_key TEXT           -- ex: "P1", "P7"
created_at  TIMESTAMPTZ DEFAULT now()
```

RLS : INSERT anonyme, SELECT service_role uniquement.

### Tables associées

- `crm_contacts` — source='signature_test', ab_variant persisté
- `crm_campaign_events` — event_type='signature_result_sent' pour tracking

### Tables V2 inexistantes

Aucune table `quiz_v2_*`, `quiz_responses`, `quiz_results`, `protocols` n'existe. Tout est à créer.

---

## 3. SCORING ACTUEL

### Mécanisme (lib/signature-test.ts, ligne 303-330)

```typescript
function calculateResult(answers: Record<number, number>): ProfileKey {
  // Accumule les scores par profil pour chaque réponse
  // Chaque réponse attribue des points à 1-2 profils (ex: P1:3, P7:1)
  // Retourne le profil avec le score MAXIMUM
  // Fallback: P1 si égalité
}
```

**Architecture :** Score max simple — PAS multidimensionnel. Un seul profil gagnant, les 9 autres sont ignorés.

### 15 questions × 4 réponses chacune

Chaque réponse attribue des points à 1-2 profils. Exemple Q1 :
- "J'analyse..." → P1:3, P7:1
- "Je me lance..." → P2:3, P10:1
- "Je m'assure que mes proches..." → P3:3, P9:1
- "Je prends de la distance..." → P4:3, P5:1

### 10 profils

| Key | Archétype | Couleur |
|-----|-----------|---------|
| P1 | L'Analyste | #74C0FC |
| P2 | L'Électron Libre | #FF8C42 |
| P3 | Le Pilier | #E879A8 |
| P4 | La Citadelle | #8B9DC3 |
| P5 | Le Gardien du Cadre | #A3BE8C |
| P6 | Le Caméléon | #C4A0E8 |
| P7 | La Vigie | #FFD93D |
| P8 | L'Idéaliste | #FF6B9D |
| P9 | Le Diplomate | #88D8B0 |
| P10 | Le Catalyseur | #FF5E5B |

Chaque profil contient 4 textes : essence, lumière, ombre, protocole (avec injection {firstName}).

---

## 4. SYSTÈME EMAIL

### Template (lib/email-templates/signature-result.ts)

- **Objet :** `{firstName}, votre Signature Émotionnelle : {archetype}`
- **Format :** HTML table-based, responsive, 600px max-width
- **Sections :** essence, lumière, ombre, protocole (injectées dynamiquement)
- **CTA :** lien vers `/rejoindre`
- **Service :** Resend via `getResendClient()`
- **Helper :** `hexToRgba()` pour couleurs dynamiques par profil

### Flux d'envoi (route.ts, lignes 89-124)

1. Quiz terminé → user entre email
2. POST `/api/signature-lead` avec email + firstName + profileKey
3. Upsert `signature_leads`
4. Upsert `crm_contacts` (source: 'signature_test', ab_variant depuis cookie)
5. Enroll séquence CRM (trigger: 'signature_test')
6. Envoi email résultat via Resend
7. Insert `crm_campaign_events` (event_type: 'signature_result_sent')

---

## 5. TRACKING EXISTANT

**Limité à 1 seul event type :** `signature_result_sent` dans `crm_campaign_events`.

Pas de tracking pour :
- ❌ Quiz started
- ❌ Question answered (avec timing)
- ❌ Email captured
- ❌ Quiz completed
- ❌ Result page viewed
- ❌ CTA clicked
- ❌ Abandon rate par question

---

## 6. PAGE RÉSULTAT

### ResultScreen (page.tsx, lignes 453-579)

- Affiche : archétype, subtitle, icon, couleur personnalisée
- 4 sections avec icônes SVG : essence, lumière, ombre, protocole
- Badge "email envoyé" si réussi
- CTA principal → `/signup`
- Actions secondaires : refaire le quiz, retour accueil
- Animations Framer Motion

### Ce qui MANQUE vs le brief V2

- ❌ Pas de scoring multidimensionnel (juste 1 profil gagnant)
- ❌ Pas de visualisation radar/graphique
- ❌ Pas de matching vers protocoles encyclopédie
- ❌ Pas de texte dynamique par dimension
- ❌ Pas de reprise de réponse utilisateur (Q15 → Acte 5)
- ❌ Pas de structure en 6 actes
- ❌ Pas de CTA Stripe direct
- ❌ Pas de champs libres dans les questions

---

## 7. DÉPENDANCES

| Package | Usage dans le quiz |
|---------|-------------------|
| framer-motion | Animations phases, transitions, résultat |
| @supabase/supabase-js | Admin client pour upsert leads |
| resend | Envoi email résultat |

Aucune dépendance vers SubscriptionGate, FeatureGate, ou composants UI du design system.

---

## 8. RÉFÉRENCES ENTRANTES (liens vers le quiz)

| Fichier | Contexte |
|---------|----------|
| `app/LandingClient.tsx` | CTA hero principal + section signature CTA |
| `app/parents-enfants/page.tsx` | CTA + lien navigation |
| `app/blog/BlogListClient.tsx` | CTA dans articles |
| `app/sitemap.ts` | URL statique pour SEO |
| `app/admin/crm/signature-emails/page.tsx` | Dashboard admin |

---

## 9. RISQUES DE LA REFONTE

### Risques ÉLEVÉS

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Landing page CTA cassé | Perte de conversion | Garder même URL `/signature-emotionnelle` |
| Emails CRM avec liens quiz | Liens brisés | Même URL, redirection si changement |
| Données `signature_leads` orphelines | Perte historique | Migration profile_key → dimension scores |
| SEO /signature-emotionnelle indexé | Perte positionnement | Même URL, pas de redirect |

### Risques MODÉRÉS

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Séquence CRM 'signature_test' | Emails incohérents si format change | Mettre à jour templates email |
| A/B test landing | Cookie ab_variant doit persister | Garder même logique cookie |

### Risque FAIBLE

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Performance (quiz plus lourd) | LCP > 2s | Code splitting, lazy load questions |

---

## 10. RECOMMANDATIONS POUR LA REFONTE

### Architecture recommandée

1. **Garder la même URL** (`/signature-emotionnelle`) — pas de redirect, pas de perte SEO
2. **Créer les 4 nouvelles tables** Supabase (quiz_v2_responses, protocols, protocol_notifications, quiz_v2_events)
3. **Nouveau fichier scoring** (`lib/quiz-v2/scoring.ts`) séparé de l'ancien
4. **Nouveau composant quiz** (`app/signature-emotionnelle/page.tsx` — remplace l'existant)
5. **Conserver** `signature_leads` comme table de capture email (ajouter colonne `quiz_version`)
6. **Conserver** le flux CRM existant (upsert crm_contacts, enroll sequences)
7. **Nouveau template email** résultat (6 actes au lieu de 4 sections)

### Estimation de complexité

| Composant | Complexité | Temps estimé |
|-----------|-----------|--------------|
| Migration SQL (4 tables + seeds) | Faible | 30 min |
| Scoring multidimensionnel + mots-clés | Moyenne | 1h |
| 15 questions (7 types d'input différents) | Élevée | 3h |
| Capture email interstitiel | Faible | 30 min |
| Page résultat 6 actes (10 variantes texte) | Élevée | 2h |
| Matching protocoles | Moyenne | 1h |
| 4 emails Resend | Moyenne | 1h |
| Tracking events (6 types) | Faible | 30 min |
| Tests responsive + performance | Moyenne | 1h |
| **TOTAL** | | **~10h** |

---

## 11. CHECKLIST PRÉ-IMPLÉMENTATION

- [ ] Validation du brief V2 (15 questions, 10 dimensions, 6 actes)
- [ ] Décision : garder ancien quiz en parallèle ou remplacer directement ?
- [ ] Validation des 7 protocoles initiaux + poids par dimension
- [ ] Validation des mots-clés pour scoring champs libres
- [ ] Validation de la séquence email (4 emails)
- [ ] Go pour les migrations SQL
