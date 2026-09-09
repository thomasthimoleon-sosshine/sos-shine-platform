# Incarnat — Détails d'implémentation immersive

Référence technique pour l'étape 6 (prototype). À lire quand tu passes à
l'implémentation. L'architecture cible retenue : **page React/Next** (pas HTML
autonome) avec libs npm, pour aller le plus loin possible (GSAP + Lenis +
WebGL/shaders quand justifié).

## Table des matières
1. Scroll engine (Lenis + GSAP ScrollTrigger)
2. Sticky scenes, pin, scrub, profondeur/focale
3. Reveal de photographies (masques organiques, blend)
4. Transitions par lumière et matière
5. Texte mis en scène
6. WebGL / shaders (quand, et fallback)
7. Rythme volontaire du scroll
8. prefers-reduced-motion (version alternative)
9. Performance (images, vidéo, chargement)
10. Mobile tactile

## 1. Scroll engine
- **Lenis** pour l'inertie (`lerp` ~0.08–0.12). Brancher `lenis.on('scroll', ScrollTrigger.update)` et piloter le `requestAnimationFrame` via `gsap.ticker`.
- **GSAP ScrollTrigger** en `scrub` (valeur numérique = latence, ex. `scrub: 1`) pour lier une timeline à la distance de scroll.
- `pin: true` pour immobiliser une scène pendant que le temps avance à l'intérieur.
- `batch` pour révéler des éléments par groupes à l'entrée dans le viewport.
- Respecter `ScrollTrigger.matchMedia` / `gsap.matchMedia()` pour desktop/mobile/reduced-motion.

## 2. Sticky scenes & focale simulée
- Chaque acte = une scène `position: sticky`/`pinned` de 100vh, la timeline interne joue pendant plusieurs centaines de vh de scroll.
- Profondeur : plusieurs couches translatées à des vitesses différentes (parallax **narrative**, pas déco).
- Focale simulée : `filter: blur()` animé + scale léger sur les couches hors champ, net sur le sujet — imite une mise au point cinéma.

## 3. Reveal de photographies
- **Masques organiques** : SVG `<mask>` / `<clipPath>` avec formes irrégulières animées, ou masque par image alpha (matière : fumée, encre, tissu). Éviter le clip-path polygonal net et géométrique.
- Crop progressif : animer `object-position`/scale + le masque ensemble.
- Superposition : plusieurs images en `mix-blend-mode` (`screen`, `multiply`, `soft-light`, `overlay`) pour fondre peau/lumière/ombre.
- Duotone cramoisi : mapper une image N&B sur bordeaux→incarnat (SVG `feColorMatrix` ou shader) pour l'unifier à la palette.

## 4. Transitions par lumière et matière
- Passer d'une scène à l'autre par une **montée de lumière** (une braise qui gagne le cadre), un voile de matière (grain, fumée) qui balaie, une surexposition brève — pas un `opacity` fade.
- Utiliser des vidéos/loops de matière (particules de poussière, textile) en overlay `screen` faible.

## 5. Texte mis en scène
- Split par mot/ligne (SplitText maison ou lib) pour faire **traverser** le texte, le faire passer **derrière** un corps (ordre de calque + masque), ou le révéler par le mouvement.
- Échelle extrême : un mot en `clamp(...)` qui atteint ~90vw ; d'autres minuscules. Jamais tout « moyen et centré ».

## 6. WebGL / shaders
- Réserver le WebGL aux moments qui le méritent : transition peau→sang, distorsion de chaleur, grain vivant, mise au point. Libs : Three.js / OGL, ou shader plein écran (`gl_FragCoord`) piloté par la progression de scroll.
- Effet chaleur/désir : displacement map + noise animé sur la texture photo.
- **Toujours** un fallback : détecter le contexte WebGL ; sinon rendre la version CSS/photo (masques + blend) qui reste forte.

## 7. Rythme volontaire
- Ne pas mapper le scroll linéairement partout. Aux moments critiques (2ᵉ présence, dédoublement), **étirer** la distance de scroll (plus de vh pour moins d'avancement visuel) → sensation de ralenti.
- Micro-pauses : `ScrollTrigger` avec `snap` léger sur les instants de bascule.

## 8. prefers-reduced-motion
- Détecter via `gsap.matchMedia({'(prefers-reduced-motion: reduce)': ...})`.
- Version alternative : pas de scrub/parallax ; à la place, révélations franches et **puissantes** (photographies pleines, typographie forte, apparitions nettes). Même récit, même émotion, zéro mouvement parasite.

## 9. Performance
- Images en AVIF/WebP, `srcset`/`sizes`, `loading="lazy"` (sauf le premier plan de l'Acte I), décodage async.
- Vidéo : WebM (VP9/AV1) + MP4 (H.264) fallback, `preload="metadata"`, `playsinline`, muet par défaut, poster optimisé.
- Chargement progressif : précharger l'acte suivant pendant l'acte courant.
- Budget : viser un LCP raisonnable ; ne pas bloquer le rendu sur GSAP.

## 10. Mobile tactile
- Reconstruire, pas réduire : gérer le scroll tactile (Lenis `smoothTouch` avec prudence), cibles tactiles généreuses, éviter les hovers.
- Repenser les cadrages verticaux (portrait) pour les fragments de corps.
- Tester le `100dvh` (barres d'URL mobiles) et les perfs sur appareil bas de gamme.

## Emplacements d'assets (convention)
Quand un asset humain manque, poser le conteneur réel avec un brief inline, ex. :
```html
<figure class="scene-body" data-asset="acte2-nuque"
  data-brief="Nuque féminine, lumière rasante bordeaux, focale 85mm, grain fin,
              respiration visible, cadrage extrême proximité, à shooter">
  <!-- image à remplacer : /public/incarnat/acte2-nuque.avif -->
</figure>
```
Ne jamais masquer un asset manquant par un gradient : le manque doit être visible
et documenté pour la production.
