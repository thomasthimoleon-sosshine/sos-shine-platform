# COLOR CLUSTERS — SOS SHINE DESIGN SYSTEM

**Date :** 23 avril 2026
**Méthode :** Extraction exhaustive + regroupement par tolérance sémantique
**Source :** 417 couleurs uniques → réduit à 12 tokens sémantiques

---

## PROPOSITION : 12 COULEURS SÉMANTIQUES FINALES

### MARQUE (3 tokens)

| Token | Valeur | Usages actuels | Rôle |
|---|---|---|---|
| `--brand` | `#D4AF37` | 319 hex + 549 rgba = **868** | Or principal. CTA, titres, accents, glows |
| `--brand-light` | `#E8CC6E` | ~20 | Or clair. Hover, fond léger, badges |
| `--brand-deep` | `#B8960F` | 29 | Or foncé. Texte sur fond clair, sous-titres |

### STATUTS (3 tokens)

| Token | Valeur | Usages actuels | Rôle |
|---|---|---|---|
| `--success` | `#55EFC4` | 250 + 24 = **274** | Succès, validé, publié, étape 1, bordure verte |
| `--danger` | `#FF6B6B` | 67 + 43 rgba = **110** | Erreur, alerte, SOS, suppression |
| `--warning` | `#E17055` | 63 + 29 = **92** | Attention, étape 3, urgence modérée |

### ACCENTS (2 tokens)

| Token | Valeur | Usages actuels | Rôle |
|---|---|---|---|
| `--accent-blue` | `#74C0FC` | **200** | Info, étape 2, liens, code, bleu ciel |
| `--accent-purple` | `#A29BFE` | 84 + 38 = **122** | Shorts, tertiaire, effets subtils, violet |

### SURFACES (2 tokens)

| Token | Valeur | Usages actuels | Rôle |
|---|---|---|---|
| `--surface` | `#050505` | 101 + 67 = **168** | Fond principal, arrière-plan page |
| `--surface-card` | `rgba(255,255,255,0.03)` | **284** | Fond des cartes, panneaux, modals |

### TEXTES (2 tokens existants, gardés tels quels)

| Token | Valeur | Usages actuels | Rôle |
|---|---|---|---|
| `--text-primary` | `#e0e0e0` | **550** | Titres, texte principal |
| `--text-secondary` | `#a1a1aa` | **609** | Descriptions, texte courant |
| `--text-muted` | `#52525b` | **1 107** | Labels, hints, dates, métadonnées |

---

## MAPPING : COULEURS ACTUELLES → TOKENS

### Couleurs qui DISPARAISSENT (absorbées par un token)

| Couleur actuelle | Occurrences | Absorbée par |
|---|---|---|
| `#D4AF37` | 319 | `--brand` |
| `#E8CC6E` / `#E8D48B` | ~20 | `--brand-light` |
| `#B8960F` / `#B8941F` | 29 | `--brand-deep` |
| `#55EFC4` | 250 | `--success` |
| `#50C878` | 24 | `--success` |
| `#FF6B6B` | 67 | `--danger` |
| `#EF4444` / `#ef4444` | 95 | `--danger` |
| `#E17055` | 63 | `--warning` |
| `#FF6B35` | 29 | `--warning` |
| `#74C0FC` | 200 | `--accent-blue` |
| `#A29BFE` | 84 | `--accent-purple` |
| `#A78BFA` | 38 | `--accent-purple` |
| `#050505` | 101 | `--surface` |
| `#09090b` | 67 | `--surface` |

### Couleurs qui RESTENT (usage contextuel spécifique)

| Couleur | Occurrences | Raison |
|---|---|---|
| `#FFD93D` | 15 | Badges gamification (Vigie) — garder comme `--badge-yellow` si >20 usages |
| `#FD79A8` | 12 | Badges gamification (rose) — évaluer en Phase 3 |
| `#FF8C42` | 10 | Archétype Électron Libre — couleur archétype, pas un token global |
| `#4285F4` | 3 | Google brand color — externe, pas un token |

### Couleurs des ARCHÉTYPES (10 couleurs spécifiques, pas des tokens globaux)

Ces couleurs sont utilisées uniquement dans le quiz Signature Émotionnelle et ne doivent PAS devenir des tokens globaux :

```
P1 Analyste     : #74C0FC  (= --accent-blue, réutilisable)
P2 Électron     : #FF8C42
P3 Pilier       : #E879A8
P4 Citadelle    : #8B9DC3
P5 Gardien      : #A3BE8C
P6 Caméléon     : #C4A0E8
P7 Vigie        : #FFD93D
P8 Idéaliste    : #FF6B9D
P9 Diplomate    : #88D8B0
P10 Catalyseur  : #FF5E5B  (≈ --danger)
```

### Couleurs des ÉTAPES (3 couleurs fonctionnelles)

Mappées directement sur les tokens :
```
Étape 1 Comprendre    : #55EFC4  → --success
Étape 2 Libérer       : #74C0FC  → --accent-blue
Étape 3 Agir          : #E17055  → --warning
```

---

## ÉCHELLE RGBA (variantes de transparence par token)

Chaque token aura 5 niveaux de transparence prédéfinis :

```
--brand-5:  rgba(212, 175, 55, 0.05)   // fond très subtil
--brand-10: rgba(212, 175, 55, 0.10)   // fond léger
--brand-15: rgba(212, 175, 55, 0.15)   // fond modéré
--brand-20: rgba(212, 175, 55, 0.20)   // bordure, hover
--brand-30: rgba(212, 175, 55, 0.30)   // glow, shadow

(idem pour --success-*, --danger-*, --accent-blue-*, etc.)
```

Cela remplace les 268 valeurs rgba inline par un système prévisible.

---

## RÉSUMÉ

| Avant | Après |
|---|---|
| 149 hex uniques | 12 tokens sémantiques |
| 268 rgba uniques | 60 rgba prédéfinis (12 tokens × 5 niveaux) |
| 22 CSS variables | 72 CSS variables (12 tokens × 6 niveaux chacun) |
| 417 couleurs totales | 72 valeurs documentées |

**Réduction : 417 → 72 (−83%)**

---

## VALIDATION REQUISE

Avant de passer à la tokenisation dans `/lib/design-tokens.ts`, confirme :

1. **Les 12 tokens sémantiques te conviennent ?** (brand ×3, statuts ×3, accents ×2, surfaces ×2, textes ×3 = 13 en comptant text-muted)
2. **Les couleurs des archétypes restent hors tokens ?** (10 couleurs spécifiques au quiz uniquement)
3. **L'échelle rgba ×5 niveaux par token est OK ?** (ou tu préfères ×3 : light/medium/strong)
4. **Les couleurs d'étapes (Comprendre/Libérer/Agir) mappées sur success/accent-blue/warning ?** Ou tu veux des tokens dédiés `--step-1`, `--step-2`, `--step-3` ?
