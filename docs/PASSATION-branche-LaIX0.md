# PASSATION — Branche `claude/build-sos-shine-v1-LaIX0`

> **Destinataire :** l'assistant (Claude) qui travaille pour Julia sur les améliorations de la plateforme SOS Shine.
> **But de ce document :** te donner **tout** ce qu'il faut savoir sur cette branche et son contenu, sans rien oublier, pour que tu puisses reprendre le travail sans casser l'existant.
> **Date de rédaction :** 20 août 2026.

---

## 0. Règle d'or (à lire en premier)

1. **Branche de travail unique : `claude/build-sos-shine-v1-LaIX0`.** Tout se développe, se committe et se pousse ici. Ne pousse jamais sur une autre branche sans autorisation explicite.
2. **Plusieurs sessions Claude travaillent parfois en parallèle sur cette même branche.** Avant de pousser : `git fetch` puis `git rebase origin/claude/build-sos-shine-v1-LaIX0`. C'est déjà arrivé qu'une session écrase le travail d'une autre — **rebase, ne force jamais** sauf certitude.
3. **Ne touche JAMAIS au lien de paiement Stripe.** Julia/Thomas l'ont configuré eux-mêmes. On code autour, jamais le lien lui-même.
4. **L'étape 1 de TOUS les protocoles reste gratuite.** C'est une règle produit, pas un détail technique.
5. **Charte couleurs stricte** (voir §4). Couleurs interdites : faux-or `#D4AF37`/`#B8960F`, et tout bleu/vert/violet/orange décoratif.

---

## 1. Le produit en une page

**SOS Shine** = plateforme française de **déconditionnement émotionnel** (fondatrice : **Julia Laureau**, co-fondateur : **Thomas**). ~200 protocoles guidés, communauté, lives, médiathèque. Objectif transverse répété par Thomas : **une expérience client irréprochable, au niveau des meilleures plateformes du monde** — fluide, sans jargon, un vrai « parcours initiatique ».

- **Prod :** https://sosshine.com — déploiement **Vercel** (auto sur push).
- **Repo GitHub :** `thomasthimoleon-sosshine/sos-shine-platform`.

---

## 2. Stack technique

- **Next.js 16** (App Router, Turbopack en dev), **React 19**, **TypeScript**, **Tailwind**.
- **Supabase** (auth, Postgres avec RLS, service role) — projet `krdfvggmfswbohuevzlb` (région eu-central-1).
- **Stripe** (Payment Links + `client_reference_id`), **Resend** (emails).
- **Three.js 0.184 + React Three Fiber v9 + drei v10 + Lenis + GSAP** (pour les expériences immersives — voir §7).
- **Framer Motion** (animations UI secondaires).

### Points d'architecture non évidents
- **La page d'accueil `/` n'est PAS un `app/page.tsx`.** Elle est servie en HTML brut par **`app/route.ts`**, qui lit **`public/landingtest3d.html`**. Si tu cherches la home, c'est là.
- **`app/layout.tsx` (layout racine)** injecte sur **toutes** les pages React : `globals.css`, un `.page-loader` (logo SOS Shine), un `.ambient-glow`, la classe `grain`, et les providers `SecurityProvider` / `ThemeProvider` / `VisitTracker`. **Impossible d'y échapper** en App Router → pour une page qui doit être « nue » (ex. `/incarnat`), on neutralise ce chrome via un `layout.tsx` de segment (voir `app/incarnat/layout.tsx`).
- **`middleware.ts`** contient un tableau `publicRoutes` : toute route accessible sans login doit y figurer (ex. `/reconquete`, `/incarnat` y sont déjà). Next 16 déprécie « middleware » au profit de « proxy » — non bloquant pour l'instant.

---

## 3. Zones de la plateforme (état actuel)

- **Dashboard** (`app/dashboard/…`, pages authentifiées) : accueil, encyclopédie, médiathèque, communauté, tarifs, etc. Le `app/dashboard/layout.tsx` gère la navigation (`PRIMARY_NAV`, `HIDDEN_NAV`).
- **Encyclopédie** (`app/dashboard/encyclopedie/…`) : liste filtrée **uniquement sur `is_published`** (les brouillons ne s'affichent pas côté client). La page `[slug]` contient le paywall protocole et le bouton d'accès unique 33€.
- **Médiathèque** (`app/dashboard/mediatheque/page.tsx`) : **hub unique** regroupant 5 anciennes entrées de menu (Vidéos / Formats courts / Audios / Lectures / Articles) en une seule, pour désencombrer la nav. Les 5 routes d'origine sont masquées via `HIDDEN_NAV`.
- **Communauté** (`app/dashboard/communaute/page.tsx`) : ramenée de **5 onglets à 3** — *Le fil* / *Discussions* / *Moi* (le sous-menu « Moi » = Mes messages / Mes proches / Enregistrés). Compat ascendante conservée pour les anciens `?tab=`.
- **Admin** (`app/admin/…`) : gestion des protocoles (« douleurs »), paramètres. Voir §6 pour le comptage médias.

### Vocabulaire / i18n
Les libellés passent par **`lib/i18n/translations.ts`** (source centrale). Une grosse **passe anti-jargon** a été faite (4 lots) : le mot **« challenge » est banni**, « Quiz » → « Bilan », vouvoiement humanisé, etc. Quand tu changes un libellé, fais-le **dans ce fichier central**, pas en dur dans les composants.

---

## 4. Charte visuelle (tokens)

Définie à la racine dans **`app/globals.css`** et **`lib/config.ts`** (Phase 0 a corrigé les 2 sources racines des couleurs hors-charte).

| Rôle | Valeur |
|---|---|
| Noir | `#0A0806` (plateforme) / `#07060B` (Incarnat) |
| Or | `#C9A961` |
| Ivoire | `#F5EFE3` |
| Bordeaux / Cramoisi / Incarnat / Albâtre (Incarnat) | `#2E0710` / `#7E1027` / `#D2536A` / `#E8DCCB` |

**Interdits :** faux-or `#D4AF37`, `#B8960F`, et bleu/vert/violet/orange décoratifs.

---

## 5. Modèle économique & Stripe

**Source unique de vérité : `lib/stripe/config.ts`.** Ne dispersе pas de prix en dur ailleurs.

### Offre actuelle (simplifiée — ne réintroduis pas les engagements)
- **Abonnement mensuel unique : 49,90 €/mois**, sans engagement, annulable en 1 clic.
- **OU accès unique à UN protocole : 33 €** (paiement one-time).
- **Tout le reste a été retiré** : plus d'offres 3 / 6 / 12 mois, plus d'essai gratuit. `DURATIONS` ne contient plus que `monthly`. Les sélecteurs de durée s'auto-masquent quand `DURATIONS.length <= 1`.

### Valeurs clés dans `lib/stripe/config.ts`
- `PRICES.serenite.monthly = 4990` (centimes) ; `PLAN_PRICES_EUR.serenite = 49.90`.
- `PURCHASABLE_PLANS = ['serenite']` (Essentielle et Premium archivés).
- `SINGLE_PROTOCOL_LINK` + `SINGLE_PROTOCOL_PRICE_EUR = 33`.
- `buildProtocolRef(userId, slug)` / `parseProtocolRef(ref)` : encodent l'utilisateur + le protocole acheté dans le `client_reference_id` Stripe (format `p_<userId>_<slug>`). **C'est ce qui permet au 33 € de ne débloquer QUE le protocole concerné.**
- Le prix « 49,90 » d'affichage promo est dans **`components/PromoCountdown.tsx`** (`PROMO.promoPrice`).

### Bug argent corrigé (à ne pas régresser)
Avant, le bouton 33 € était un `<a href>` Stripe brut → il débloquait **tout**. Corrigé : c'est un `<button onClick>` qui construit `buildProtocolRef(user.id, slug)` + email prérempli. **Vérifie que ça reste un bouton dynamique, jamais un lien statique.**

---

## 6. Comptage des médias admin (retour de William)

Fichier : **`app/admin/douleurs/page.tsx`**.

- Chaque étape a **6 emplacements média** réels : `video_url`, `video_url_2`, `audio_url`, `audio_url_2`, `pdf_url`, `image_url`. (Un bug historique oubliait `video_url_2` → une 2ᵉ vidéo n'était pas comptée. Corrigé.)
- **Un protocole « complet » = 6 fichiers au total** (modèle de référence donné par Thomas : ét.1 = 2 vidéos ; ét.2 = 2 audios + 1 vidéo ; ét.3 = 1 cahier de travail PDF — soit 6). Le badge total du protocole affiche donc **`X/6`** et passe au vert à 6/6.
- ⚠️ La **répartition réelle varie** d'un protocole à l'autre en base (vérifié via SQL) : le total sur 6 est volontairement **souple** pour ne pas marquer « incomplet » des protocoles complets rangés différemment. Ne rigidifie pas en 2/3/1 par étape sans recaler le contenu de tous les protocoles.

---

## 7. Les pages « Incarnat » (expériences secrètes, hors plateforme)

Il existe **deux** pages immersives indépendantes, **non listées dans la navigation**, `noindex`, publiques (dans `publicRoutes`). Elles partagent l'identité **Incarnat** (palette noir/bordeaux/cramoisi/incarnat/or/albâtre) mais sont **techniquement distinctes**. ⚠️ **Elles coexistent — clarifie avec Thomas laquelle est la version retenue avant d'en supprimer une.**

### 7.a — `/reconquete` — version « Buée » (HTML autonome)
- Servie par **`app/reconquete/route.ts`** qui lit **`public/reconquete.html`** (document HTML **autonome**, hors layout racine → parfaitement isolé).
- Concept actuel : **la Buée** — le scroll/geste « essuie la vitre » pour révéler des scènes de corps en contre-jour. (A remplacé une version « Contre-jour » antérieure, elle-même après « Le fil rouge ».)
- **Contient le questionnaire fonctionnel** « Le Seuil » (Solo, 7 axes, échelle 1→7 à deux ancres, rapport « Sillage ») + l'amorce « Braise » (couple). **Ne casse pas cette logique JS** (`AXES`, `renderQ`, `choose`, `renderSillage`, `openCouple`, `saveMail`).
- GSAP est **vendorisé** en local dans `public/incarnat/vendor/` (pas de CDN runtime).

### 7.b — `/incarnat` — expérience WebGL (React/R3F)
- Vraie page Next : **`app/incarnat/page.tsx`** (+ `app/incarnat/layout.tsx` qui neutralise le chrome global).
- Scène **Three.js / R3F** permanente plein écran : forme organique ambiguë (shader bruit 3D + fresnel incarnat, respiration), poussière en profondeur, lumière latérale, brouillard. **Scroll = avancée de caméra** (Lenis pilote une progression 0→1). Couche typographique éditoriale (INCARNAT monumental, « pensées conditionnées » dispersées en profondeur, phrase-bascule).
- État : **prototype HERO + Chapitre 01** seulement. Chapitres 02 (fissure), 03 (la lumière), 04 (désagrégation/reconstruction) **restent à construire**.
- Architecture modulaire sous **`components/incarnat/`** : `Experience.tsx`, `scenes/HeroScene.tsx`, `OrganicObject.tsx`, `Particles.tsx`, `Lighting.tsx`, `CameraRig.tsx`, `Typography.tsx`, `Cursor.tsx`, `shaders/organicShader.ts`, `hooks/incarnatState.ts`, `incarnat.css`.
- **`hooks/incarnatState.ts`** = état partagé **hors React** (lu dans `useFrame`, écrit par Lenis/souris) pour éviter tout re-render par frame. Un hook `window.__incarnat` existe **uniquement en dev** (guardé `NODE_ENV`) pour piloter la progression pendant les tests.
- Fallback statique si pas de WebGL ou `prefers-reduced-motion`.
- Contenu = **manifeste de déconditionnement** (« Tu appelles personnalité ce qui est parfois devenu protection », etc.) — différent du questionnaire couple de `/reconquete`. Le menu « Entrer » pointe vers `/reconquete`.

---

## 8. Le skill `frontend-design` (standard OBLIGATOIRE pour l'immersif)

Fichier : **`.claude/skills/frontend-design/SKILL.md`** (+ `references/techniques.md`).

C'est un skill **maison** (pas un produit Anthropic officiel) qui **codifie le standard non négociable** des expériences Incarnat : traversée cinématographique, **interdiction de l'esthétique landing/IA** (pas de cards, gradients décoratifs, glow gratuits…), humain au centre (vraies photos ou emplacements + brief de prod, **jamais de remplacement silencieux par un gradient**), mouvement organique Lenis+GSAP, typographie mise en scène, palette-matière, accessibilité, et un **processus obligatoire** (audit → 3 concepts → challenge → storyboard → assets → prototype → critique visuelle).
**Quand tu touches à une page immersive/landing/parcours Incarnat, charge ce skill et applique-le.**

---

## 9. Historique des changements de la branche (du plus récent au plus ancien)

```
d835df8 Incarnat — expérience WebGL immersive : prototype HERO + Chapitre 01 (/incarnat)
b5d1741 Incarnat — refonte Buée : le scroll/geste essuie la vitre (/reconquete)
d6c7ecf Incarnat — refonte cinématographique 'Contre-jour' (/reconquete, remplacée par Buée)
1706aa8 Ajout du skill frontend-design (standard immersif)
d10debd Comptage médias : total protocole sur 6
b389de8 Fix comptage médias admin : 2e vidéo d'étape non comptée
77c74cb Refonte page secrète Incarnat : sentier + questionnaire Le Seuil
87c4dff Offre simplifiée : mensuel 49,90€ OU protocole seul 33€, rien d'autre
9f450f0 Prix mensuel : 29,90€ -> 49,90€ partout
0b3c546 Ajoute Braise : expérience immersive secrète /reconquete
1e8a901 Page secrète /reconquete 'Le fil rouge'
607d3ee Page secrète /reconquete (placeholder)
f41ee7f Communauté 5 onglets -> 3
fb8d341 Médiathèque regroupée en une seule entrée de menu
69a4cd4 Passe jargon lot 4 (événements, courrier, parrainage ; 'challenge' banni)
c54e0d8 Passe jargon lot 3 (Mes messages, Le fil, badges)
90acba9 Passe jargon lot 2 (protocole, accueil dashboard, popup)
ca31e01 Passe jargon lot 1 (vocabulaire communauté centralisé)
5beaee9 Fix paiement 33€ + encyclopédie n'affiche que les protocoles publiés
22937cf..dfaf7d9 Série 'Accueil' : hero mobile, hiérarchie typo, logo agrandi, header fondu, CTA noir menu mobile, bandeau Instagram
8c39981 Fix build Vercel : suppression next/font/google (404 build) -> next/font/local
4b213fe Phase 0 charte : 2 sources racines de couleurs hors-charte corrigées
```
(Avant cela : historique produit plus ancien — tracker fondateur, /signature-emotionnelle, questionnaire-test, etc.)

---

## 10. Développer & tester dans le sandbox

- **Env :** créer un `.env.local` factice (il est gitignore) avec `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (valeurs dummy suffisent pour builder/lancer).
- **`node_modules` est éphémère** : si `next: not found`, refais `npm ci`.
- **Build de prod :** `npm run build` (doit finir sans erreur avant de pousser une feature).
- **Screenshots :** Chromium à `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Pour le **WebGL en headless**, lancer avec `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- ⚠️ **On ne peut pas screenshoter les pages authentifiées du dashboard** (le middleware redirige vers `/login`). Les pages publiques (`/`, `/reconquete`, `/incarnat`) sont screenshotables.
- **PDF :** pipeline python markdown→HTML charté puis chromium `--headless --print-to-pdf`.
- **Supabase :** accessible via les outils MCP Supabase (projet `krdfvggmfswbohuevzlb`). `apply_migration` va **directement en prod** — prudence.

---

## 11. Pièges connus (déjà rencontrés)

1. **Fonts Vercel :** `next/font/google` a cassé un build (404 sur Fraunces/Figtree/Cormorant). Solution appliquée : `next/font/local` sur les `.woff2` de `public/fonts/`. N'ajoute pas de `next/font/google` sans vérifier le build.
2. **Chrome global sur les pages nues :** pour une page immersive, neutralise `.page-loader` / `.ambient-glow` via un `layout.tsx` de segment (cf. `app/incarnat/layout.tsx`).
3. **Sessions concurrentes :** toujours `fetch` + `rebase` avant de pousser (cf. §0.2).
4. **Ne jamais remettre** les offres 3/6/12 mois ni l'essai gratuit (offre volontairement simplifiée).
5. **`troika`/drei `<Text>` ne lit pas le woff2** → pour du texte 3D, prévoir un `.ttf`/`.woff` ou passer par du DOM (c'est le choix fait sur `/incarnat`).

---

## 12. Fichiers clés (raccourcis)

| Sujet | Fichier |
|---|---|
| Home (HTML) | `app/route.ts` → `public/landingtest3d.html` |
| Config Stripe / prix | `lib/stripe/config.ts` |
| Promo / prix affiché | `components/PromoCountdown.tsx` |
| Libellés / i18n | `lib/i18n/translations.ts` |
| Charte couleurs | `app/globals.css`, `lib/config.ts` |
| Middleware / routes publiques | `middleware.ts` |
| Admin protocoles (comptage médias) | `app/admin/douleurs/page.tsx` |
| Encyclopédie protocole (paywall + 33€) | `app/dashboard/encyclopedie/[slug]/page.tsx` |
| Médiathèque hub | `app/dashboard/mediatheque/page.tsx` |
| Communauté (3 onglets) | `app/dashboard/communaute/page.tsx` |
| Incarnat « Buée » | `app/reconquete/route.ts` → `public/reconquete.html` |
| Incarnat WebGL | `app/incarnat/page.tsx`, `components/incarnat/**` |
| Standard immersif | `.claude/skills/frontend-design/SKILL.md` |

---

## 13. Travaux en cours / prochaines étapes ouvertes

- **`/incarnat` :** construire Chapitres 02→04, ajouter du post-processing (bloom/DOF léger), enrichir la matière du shader. Décider si `/incarnat` **remplace** ou **complète** `/reconquete`.
- **`/reconquete` (Buée) :** intégrer de **vraies photographies** de corps (les emplacements + `data-brief` sont déjà posés) ; brancher l'email de capture (Sillage / Braise) sur Resend + Supabase ; construire le back-end du questionnaire couple (auth, RLS, verrou de confidentialité, lecture croisée).
- **Nettoyage admin** (optionnel) : références résiduelles aux anciennes durées d'engagement.

---

*Fin de la passation. En cas de doute sur une décision produit (prix, offre, quelle page Incarnat garder), demander à Thomas/Julia avant d'agir.*
