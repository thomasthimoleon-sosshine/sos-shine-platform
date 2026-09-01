# PHASE 3 — Legacy Variable Migration Plan

**Objectif :** Supprimer tous les alias legacy CSS et migrer vers les tokens du design system.
**Prérequis :** Phase 2 terminée (tous les composants UI créés et validés).

---

## MAPPING LEGACY → DESIGN SYSTEM

| Legacy Variable | Nouveau Token | Usages | Action |
|---|---|---|---|
| `--gold` | `--brand` | **766** | search-replace global |
| `--gold-light` | `--brand-light` | 5 | search-replace global |
| `--gold-deep` | `--brand-deep` | 64 | search-replace global |
| `--dark` (hors `--dark-*`) | `--surface` | 99 | search-replace global |
| `--dark-card` | `--surface-card` | 284 | search-replace global |
| `--dark-card-hover` | *(supprimer, utiliser hover:)* | ~10 | refactor manuel |
| `--dark-border` | `--border` | 656 | search-replace global |
| `--dark-border-hover` | `--border-hover` | ~10 | search-replace global |
| `--button-bg` | `--brand` | 6 | search-replace global |
| `--gold-gradient` | *(garder ? spécifique landing)* | ~5 | évaluer |

**Total estimé : ~1 900 remplacements**

---

## FICHIERS CONCERNÉS (88 fichiers)

### app/ (69 fichiers)
- app/LandingClient.tsx
- app/admin/abonnements/page.tsx
- app/admin/analytics/page.tsx
- app/admin/anciennes-clientes/page.tsx
- app/admin/ateliers/page.tsx
- app/admin/bots/page.tsx
- app/admin/candidatures/page.tsx
- app/admin/crm/automations/page.tsx
- app/admin/crm/campaigns/new/page.tsx
- app/admin/crm/campaigns/page.tsx
- app/admin/crm/contacts/page.tsx
- app/admin/crm/email-templates/page.tsx
- app/admin/crm/page.tsx
- app/admin/crm/sequences/new/page.tsx
- app/admin/crm/sequences/page.tsx
- app/admin/crm/signature-emails/page.tsx
- app/admin/defis/page.tsx
- app/admin/douleurs/page.tsx
- app/admin/evenements/page.tsx
- app/admin/page.tsx
- app/admin/publications/page.tsx
- app/blog/BlogListClient.tsx
- app/blog/[slug]/BlogArticleContent.tsx
- app/cgv/page.tsx
- app/confidentialite/page.tsx
- app/contact/page.tsx
- app/dashboard/affiliation/page.tsx
- app/dashboard/ateliers/page.tsx
- app/dashboard/badges/page.tsx
- app/dashboard/blog/page.tsx
- app/dashboard/chat/[slug]/page.tsx
- app/dashboard/chat/page.tsx
- app/dashboard/communaute/page.tsx
- app/dashboard/courrier-anonyme/page.tsx
- app/dashboard/encyclopedie/[slug]/page.tsx
- app/dashboard/encyclopedie/[slug]/sos/page.tsx
- app/dashboard/encyclopedie/page.tsx
- app/dashboard/evenements/page.tsx
- app/dashboard/favoris/page.tsx
- app/dashboard/journal/page.tsx
- app/dashboard/layout.tsx
- app/dashboard/membre/[id]/page.tsx
- app/dashboard/mes-rayons/page.tsx
- app/dashboard/messages/[id]/page.tsx
- app/dashboard/messages/page.tsx
- app/dashboard/mon-eclat/page.tsx
- app/dashboard/mur/page.tsx
- app/dashboard/objectifs/page.tsx
- app/dashboard/page.tsx
- app/dashboard/profil/page.tsx
- app/dashboard/shine-audible/page.tsx
- app/dashboard/shine-librairie/page.tsx
- app/dashboard/shine-tv/page.tsx
- app/dashboard/tarifs/page.tsx
- app/encyclopedie/EncyclopedieClient.tsx
- app/encyclopedie/[slug]/page.tsx
- app/forgot-password/page.tsx
- app/livre-sos-shine/page.tsx
- app/livre-supers-pouvoirs/page.tsx
- app/login/page.tsx
- app/mentions-legales/page.tsx
- app/notre-histoire/page.tsx
- app/onboarding/page.tsx
- app/page-launch.tsx
- app/parents-enfants/page.tsx
- app/rejoindre/page.tsx
- app/reset-password/page.tsx
- app/signature-emotionnelle/page.tsx
- app/signup/page.tsx

### components/ (19 fichiers)
- components/AudioPlayer.tsx
- components/ConferenceRoom.tsx
- components/CrisisButton.tsx
- components/FavoriteButton.tsx
- components/FeatureGate.tsx
- components/IncomingCallModal.tsx
- components/NotificationBell.tsx
- components/SubscriptionGate.tsx
- components/SubscriptionModal.tsx
- components/ThemeToggle.tsx
- components/VoiceRecorder.tsx
- components/Whiteboard.tsx
- components/XPBadge.tsx
- components/community/MessagesTab.tsx
- components/community/ProfileDrawer.tsx
- components/community/RayonsFeedTab.tsx
- components/community/SavedPostsTab.tsx
- components/ui/Avatar.tsx
- components/ui/Badge.tsx
- components/ui/Toast.tsx

---

## CHECKLIST DE MIGRATION

### Étape 1 — Rename global (automatique)
- [ ] `sed -i 's/var(--gold)/var(--brand)/g'` sur tous les .tsx
- [ ] `sed -i 's/var(--gold-light)/var(--brand-light)/g'`
- [ ] `sed -i 's/var(--gold-deep)/var(--brand-deep)/g'`
- [ ] `sed -i 's/var(--dark-card)/var(--surface-card)/g'`
- [ ] `sed -i 's/var(--dark-border)/var(--border)/g'`
- [ ] `sed -i 's/var(--dark-border-hover)/var(--border-hover)/g'`
- [ ] `sed -i 's/var(--dark-card-hover)/var(--surface-card)/g'` (simplify)
- [ ] Renommer `var(--dark)` → `var(--surface)` (attention aux faux positifs `--dark-*`)
- [ ] `sed -i 's/var(--button-bg)/var(--brand)/g'`

### Étape 2 — Vérification
- [ ] `npm run build` passe sans erreur
- [ ] Vérification visuelle : landing, dashboard, admin, encyclopédie
- [ ] Light theme fonctionne toujours

### Étape 3 — Suppression
- [ ] Supprimer le bloc ⚠️ LEGACY ALIASES de globals.css
- [ ] Supprimer les alias du light theme `[data-theme="light"]`
- [ ] Rebuild + test

### Étape 4 — Hardcoded hex cleanup
- [ ] Remplacer les `#D4AF37` restants par `var(--brand)` (ancienne couleur)
- [ ] Remplacer les `#FF6B6B` par `var(--danger)`
- [ ] Remplacer les `#55EFC4` par `var(--success)`
- [ ] Remplacer les `#74C0FC` par `var(--accent-blue)`
- [ ] Remplacer les `#A29BFE` par `var(--accent-purple)`
- [ ] Remplacer les `#E17055` par `var(--warning)`

---

## NOTES

- Le light theme (`[data-theme="light"]`) utilise les mêmes alias (`--dark`, `--dark-card`, etc.) et devra être mis à jour en parallèle avec les nouveaux noms de tokens.
- Le fichier `app/globals.css` contient la source de vérité pour les deux thèmes.
- Les composants UI de Phase 2 (`/components/ui/`) utilisent DÉJÀ les nouveaux tokens et n'auront PAS besoin de migration.
