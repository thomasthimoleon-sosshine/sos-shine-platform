---
name: frontend-design
description: >-
  Non-negotiable creative and technical standard for building immersive,
  cinematic front-end experiences for the Incarnat / SOS Shine project. Use this
  skill for EVERY front-end decision on Incarnat — structure, motion,
  typography, pacing, staging, scroll, transitions — and any time the work
  touches public/reconquete.html, the /reconquete route, a landing page, a
  "page immersive", a "parcours", or any visitor-facing scene. Trigger it even
  when the user only says "reprends la page", "améliore l'accueil", "rends ça
  plus vivant", "moins site internet", or asks for animation/scroll/hero work.
  It exists to forbid generic SaaS/landing/AI aesthetics and to enforce a
  film-like, human, sensorial experience. When in doubt on Incarnat, use it.
---

# frontend-design — Le standard Incarnat

Tu n'es pas en train de faire un site. Tu mets en scène une **traversée
cinématographique** où le scroll est le montage. Le visiteur doit sentir qu'il
entre dans un corps, une nuit, une présence — jamais qu'il « regarde un site ».

Ce skill est le standard technique **et** créatif non négociable. Il guide
chaque décision. Si une décision peut être justifiée uniquement par « ça fait
joli » ou « ça impressionne », elle est fausse.

## Règle 0 — Interdiction d'esthétique IA / landing

Élimine immédiatement tout élément qui pourrait, en changeant juste les textes,
servir une marque de parfum, une startup de dev perso ou un site de yoga :

- structure hero → features → testimonials → CTA
- cards, grilles, blocs arrondis, sélecteurs qui ressemblent à du pricing
- gradients décoratifs, glow, particules « gratuites », abstractions 3D déco
- typographie « luxe générique » (serif centré + eyebrow en petites caps + sous-titre gris)
- animations ajoutées pour impressionner plutôt que pour raconter

**Test de rejet** : « Est-ce que cet élément pourrait être recyclé tel quel pour
une autre marque ? » Si oui → dégage. Incarnat doit avoir un langage formel
reconnaissable entre mille.

**Test IA** : « Quelqu'un pourrait-il deviner que c'est généré ? » Corrige
jusqu'à ce que la réponse soit non. Le paysage montagne + ciel dégradé + lueur
floue + grain est le cliché génératif absolu : bannis-le.

## Les 4 actes (structure narrative obligatoire, aucune section visible)

Une seule traversée continue, sans césures de « section ». L'émotion progresse ;
elle ne stagne pas dans une seule tonalité.

1. **DISTANCE** — noir presque total, présence à peine perceptible, énorme
   espace négatif. Le texte apparaît comme une pensée intérieure, pas un titre.
2. **LE CORPS** — fragments humains extrêmes (grain de peau, ride, nuque, main,
   œil, bouche qui inspire). Le texte devient presque tactile.
3. **LA RENCONTRE** — une seconde présence apparaît. Distance → proximité. Deux
   univers qui se touchent sans se toucher encore.
4. **LE CHOIX** — l'espace lui-même se divise en deux directions. L'une mène à
   **LE SEUIL** (seul), l'autre à **BRAISE** (à deux). Ça doit se ressentir
   comme une décision narrative, jamais comme une sélection de produit.

## L'humain au centre (non négociable)

De vraies photographies / séquences de personnes réelles. **Jamais** de stock
corporate, mannequins souriants, yoga, bras ouverts au soleil, pseudo-spiritualité.
Cadrages : extrême proximité (œil, nuque, main, peau, rides), dos à dos,
quelques centimètres de distance, regards qui finissent par rencontrer l'objectif.

Si les assets n'existent pas : **crée les emplacements exacts + un brief de
production précis** (focale, lumière, émotion, cadrage). Ne les remplace **jamais**
en silence par un gradient ou une abstraction. Un `<img>`/`<video>` avec un
`data-brief="..."` documenté vaut mieux qu'une fausse image.

## Mouvement — lent, organique, sensuel, précis

Le site respire. Techniques attendues (voir `references/techniques.md` pour le
détail d'implémentation) :

- Scroll-driven storytelling : **Lenis** (inertie) + **GSAP ScrollTrigger**
  (scrub + pin + batch). Le scroll natif sec est interdit dans les moments clés.
- Sticky scenes avec changement de profondeur et de focale simulée.
- Reveal de photographies par **masques organiques** (pas de clip-path basique),
  crop progressif, superposition et blend modes cinématographiques.
- Transitions par **lumière et matière**, pas par fade générique.
- Texte qui traverse, passe derrière, ou est révélé par le mouvement du corps.
- Parallax multi-couches **contrôlée** (jamais décorative).
- **Changement de rythme volontaire** : ralentir aux moments critiques
  (seconde présence, dédoublement).

## Typographie mise en scène

La typo participe à la scène, pas à une hiérarchie commerciale. Certains mots
occupent presque tout l'écran ; d'autres sont minuscules. Bodoni Moda n'est pas
sacrée : si une combinaison plus singulière (serif extrême + grotesque, ou
monospace chirurgical) sert mieux l'expérience, propose-la et justifie-la.

## Palette Incarnat (matière, pas thème)

Utilise ces valeurs comme **matière** (peau → sang → chaleur → désir → vie),
jamais comme un thème CSS décoratif :

- Noir `#07060B` · Bordeaux `#2E0710` · Cramoisi `#7E1027`
- Incarnat `#D2536A` · Or mat `#B08A4A` (extrêmement rare) · Albâtre `#E8DCCB`

## Son (optionnel, puissant)

Jamais d'autoplay agressif. Propose « Entrer avec le son ». Paysage sonore
ultra-subtil (respiration, textile, fréquences graves, vent). Le silence est un
élément de design.

## Performance & accessibilité (non négociable)

- Chargement progressif, images AVIF/WebP + lazy, vidéo WebM/MP4 optimisée.
- Mobile **reconstruit pour le tactile**, pas une simple réduction.
- **Fallback élégant** si WebGL / effets avancés indisponibles.
- Accessibilité clavier complète.
- `prefers-reduced-motion` : une version alternative **aussi puissante
  émotionnellement**, pas une version dégradée. L'immersion ne doit jamais
  rendre le site inutilisable.

## Processus obligatoire (dans l'ordre)

Ne saute jamais d'étape et ne construis pas avant d'avoir le feu vert humain sur
le concept.

1. **Audit impitoyable** de l'existant : ce qui fait basique, artificiel,
   générique, « trop site », insuffisamment humain.
2. **Trois concepts radicaux**, chacun avec : concept, première scène,
   progression du scroll, usage des humains, moment signature, transition vers
   Le Seuil / Braise, difficulté technique, risques.
3. **Challenge sévère** : élimine tout concept recyclable pour une autre marque.
   Ne garde que le langage purement Incarnat.
4. **Storyboard** écran par écran, pensé en réalisateur + DA.
5. **Liste d'assets exacte** + brief de production (aucun remplacement silencieux).
6. **Prototype** de la seule landing immersive (pas de backend/questionnaire/Supabase).
7. **Critique visuelle extrême** : screenshots à plusieurs positions et tailles,
   analyse en DA exigeant. Questions : mémorable ou juste joli ? profondément
   humain ? une expérience ou un site ? devinerait-on l'IA ? Corrige jusqu'au non.

## Contrainte finale

Préserve la marque, la philosophie, le contenu, les parcours et l'architecture
fonctionnelle d'Incarnat. Mais repense radicalement la mise en scène.
L'objectif n'est pas un plus beau site Incarnat — c'est de **faire vivre Incarnat**.

Détails d'implémentation technique (Lenis + GSAP, masques, shaders, fallback,
patterns de scène) : voir `references/techniques.md`.
