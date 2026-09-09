# DESIGN AUDIT — SOS SHINE PLATFORM

**Date :** 23 avril 2026
**Méthode :** Scan exhaustif du codebase (grep, comptage, analyse statique)
**Score de cohérence global : 22%**

---

## RÉSUMÉ EXÉCUTIF

La plateforme SOS Shine dispose de 22 CSS variables centralisées mais utilise en pratique **417 couleurs uniques en inline**, **100+ patterns de boutons différents**, **458 SVG hardcodés sans librairie d'icônes**, et **1 seul composant UI réutilisable** (CTAButton). L'expérience visuelle est fonctionnelle mais manque de cohérence systémique.

---

## 1. BOUTONS — 100+ PATTERNS (CRITIQUE)

**Composant réutilisable existant :** 1 seul (`/components/ui/CTAButton.tsx`)
- Variants : primary, outline, accent
- Tailles : md (px-8 py-4 text-base), lg (px-12 py-5 text-lg)

**Réalité :** 90%+ des boutons sont définis inline avec styles custom.

**Patterns les plus fréquents :**
| Pattern | Usage |
|---|---|
| `px-8 py-4 rounded-full text-base` | Boutons primaires |
| `px-8 py-3.5 rounded-full text-sm` | Boutons secondaires |
| `w-full py-4 rounded-full text-base` | CTA larges |
| `px-10 py-5 rounded-full text-lg` | CTA XL |
| `px-5 py-2.5 rounded-lg text-sm` | Boutons admin |
| `px-4 py-2 rounded-xl text-xs` | Boutons compacts |
| `px-3 py-1 rounded text-xs` | Micro-boutons |
| `px-6 py-3 rounded-full text-sm` | Boutons intermédiaires |

**Classe `.magnetic-btn`** appliquée sur ~95% des boutons de la landing (hover custom JS).

**Verdict :** Aucune standardisation. Chaque page réinvente ses boutons.

---

## 2. COULEURS — 417 VARIANTES UNIQUES (CRITIQUE)

**CSS Variables centralisées (globals.css) : 22**
```
--gold: #D4AF37
--gold-light: #E8D48B
--gold-deep: #B8941F
--dark: #050505
--dark-card: rgba(255,255,255,0.03)
--dark-border: rgba(255,255,255,0.06)
--text-primary: #F5F5F5
--text-secondary: #B8B8B8
--text-muted: #6B6B6B
--text-bold: #FFFFFF
```

**Couleurs hardcodées fréquentes (non tokenisées) :**
| Couleur | Usage | Rôle |
|---|---|---|
| `#FF6B6B` | Erreurs, destructif, SOS | Rouge |
| `#55EFC4` | Succès, étape 1, publié | Vert |
| `#74C0FC` | Info, étape 2, liens | Bleu |
| `#E17055` | Étape 3, urgence | Orange |
| `#A29BFE` | Shorts, secondaire | Violet |
| `#D4AF37` | Or principal | Gold |
| `#FFD93D` | Accents, badges | Jaune |
| `#FD79A8` | Badges, accents | Rose |

**Total hex uniques : 149 | Total rgba uniques : 268 | Total : 417**

**Verdict :** Les 22 tokens couvrent ~15% des usages réels. 85% des couleurs sont en dur.

---

## 3. TYPOGRAPHIE — 2 POLICES, HIÉRARCHIE FLOUE

**Polices importées :**
- **Cormorant Garamond** (display/titres) — weights 300, 400, 500, 600
- **DM Sans** (body) — weights 300, 400, 500

**Tailles utilisées (occurrences Tailwind) :**
| Classe | Occurrences |
|---|---|
| `text-xs` | 857 |
| `text-sm` | 1 013 |
| `text-base` | 287 |
| `text-lg` | 156 |
| `text-xl` | 134 |
| `text-2xl` | 89 |
| `text-3xl` | 45 |
| `text-4xl` | 23 |
| `text-5xl` | 8 |
| `text-[11px]` | ~30 |
| `text-[10px]` | ~20 |
| `text-[13px]` | ~15 |
| `text-[15px]` | ~10 |

**Classe `.font-display`** : existe (mappe sur Cormorant Garamond), utilisée sur les titres principaux mais pas systématiquement.

**Verdict :** 14+ tailles de texte sans scale formalisée. Les tailles custom `text-[Xpx]` cassent le système Tailwind.

---

## 4. ESPACEMENTS — 39 VALEURS, PAS D'ÉCHELLE

**Paddings les plus fréquents :**
| Classe | Occurrences |
|---|---|
| `py-2` | 398 |
| `px-4` | 316 |
| `py-3` | 314 |
| `px-3` | 278 |
| `p-4` | 213 |
| `p-6` | 187 |
| `py-4` | 156 |
| `px-5` | 145 |
| `py-20` | 34 |
| `py-32` | 12 |

**Valeurs custom inline :** 3 occurrences de `p-[...]`

**Verdict :** L'échelle 4-8-12-16-20-24 est partiellement respectée mais sans formalisation. Les grands espacements (py-20, py-32, py-40) n'ont pas de logique cohérente.

---

## 5. COMPOSANTS UI — ARCHITECTURE FRAGMENTÉE (CRITIQUE)

**Dossier `/components/ui/` :** 1 seul fichier (CTAButton.tsx)

**Total composants `/components/` :** 28 fichiers
- AudioPlayer, ConferenceRoom, CrisisButton, CTAButton, FavoriteButton
- FeatureGate, FileUpload, IncomingCallModal, NotificationBell, NpsWidget
- SubscriptionGate, SubscriptionModal, ThemeToggle, VisitTracker, VoiceRecorder
- Whiteboard, etc.

**Composants UI manquants :**
- ❌ Button (unifié)
- ❌ Input
- ❌ Card
- ❌ Badge
- ❌ Modal (générique)
- ❌ Toast / Notification
- ❌ Tooltip
- ❌ Tabs
- ❌ Dropdown / Select
- ❌ Avatar (unifié)

**Modals existantes :** 2 (IncomingCallModal, SubscriptionModal) — aucun composant Modal de base.

**Verdict :** Pas de design system. Chaque page recrée ses propres composants visuels inline.

---

## 6. ICÔNES — 458 SVG INLINE, 0 LIBRAIRIE (CRITIQUE)

**SVG inline dans les .tsx :** 458 occurrences
**Librairie Lucide React :** Non installée
**Librairie Heroicons :** Non installée
**Fichiers SVG statiques :** 5 seulement

**Problèmes :**
- viewBox incohérent entre les SVG
- stroke-width varie (1.5, 2, 3) sans logique
- Pas de composant Icon wrapper
- Duplication massive (le même SVG copié dans 10+ fichiers)

**Verdict :** Chaque icône est un SVG inline copié-collé. Maintenance impossible.

---

## 7. OMBRES & BORDURES — 16 SHADOWS, 6 RADIUS

**Box-shadows uniques :** 16 variantes
- Gold glow : `0 0 40px rgba(212, 175, 55, 0.12)`
- Heavy : `0 25px 60px rgba(0,0,0,0.5)`
- CTA : `0 4px 20px rgba(212,175,55,0.3)`
- Accents colorés (FF6B6B, 55EFC4)

**Border-radius :**
| Classe | Occurrences |
|---|---|
| `rounded-full` | 706 |
| `rounded-xl` | 613 |
| `rounded-lg` | 415 |
| `rounded-2xl` | 185 |
| `rounded-md` | <20 |
| `rounded-3xl` | <10 |

**Tokens existants mais inutilisés :** `--radius-lg: 1rem`, `--radius-xl: 1.25rem`

**Verdict :** Les tokens radius existent mais personne ne les utilise.

---

## 8. ANIMATIONS — 47 FICHIERS FRAMER MOTION + 25 KEYFRAMES CSS

**Framer Motion :**
- 47 fichiers importent `motion` (10.8% du codebase)
- 605 instances de `motion.*` (motion.div, motion.span, etc.)

**CSS Keyframes globales :** 25+ animations
- fadeIn, shimmer, diamondTwinkle, trinityPulse*, orbFloat, gradientShift...

**Transitions CSS :** 787 instances
| Type | Occurrences |
|---|---|
| `transition-all` | 511 |
| `transition-colors` | 180 |
| `transition-transform` | 56 |
| `transition-opacity` | 40 |

**Verdict :** Double système (CSS + Framer Motion). Les animations CSS et Framer Motion coexistent sans logique de séparation.

---

## TOP 10 INCOHÉRENCES À RÉSOUDRE (PAR PRIORITÉ)

| # | Problème | Impact | Effort |
|---|---|---|---|
| 1 | **0 composants UI de base** (Button, Input, Card, Modal) | CRITIQUE | Élevé |
| 2 | **417 couleurs inline** vs 22 tokens | CRITIQUE | Moyen |
| 3 | **458 SVG inline** sans librairie d'icônes | MAJEUR | Moyen |
| 4 | **100+ patterns de boutons** sans standardisation | CRITIQUE | Moyen |
| 5 | **14+ tailles de texte** sans scale | MAJEUR | Faible |
| 6 | **Pas de composant Modal/Toast/Tooltip** générique | MAJEUR | Moyen |
| 7 | **16 box-shadows** sans token | MINEUR | Faible |
| 8 | **Animations dupliquées** CSS + Framer Motion | MINEUR | Moyen |
| 9 | **Tokens radius existants mais inutilisés** | MINEUR | Faible |
| 10 | **Espacements irréguliers** (39 valeurs) | MINEUR | Faible |

---

## RECOMMANDATION

**Phase 2 devrait se concentrer sur :**
1. Créer les design tokens centralisés (couleurs, typo, spacing, shadows, radii)
2. Créer les 8 composants UI atomiques (Button, Input, Card, Badge, Modal, Toast, Tabs, Avatar)
3. Installer Lucide React pour les icônes
4. Puis appliquer progressivement sur toutes les pages (Phase 3)

**Score actuel : 22% de cohérence**
**Score cible : 90%+**
