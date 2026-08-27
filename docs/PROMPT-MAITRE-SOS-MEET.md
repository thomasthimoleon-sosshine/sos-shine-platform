# PROMPT MAÎTRE — SOS MEET

> Document de reprise **dédié à SOS Meet** (site de rencontre « en conscience », produit sœur de
> SOS Shine). À donner tel quel à un assistant (Claude) pour continuer le développement sans perdre
> de contexte. Dernière mise à jour : 27 août 2026.

---

## 0. LE PRODUIT EN UNE PHRASE

**SOS Meet** : la rencontre « en conscience » — on découvre d'abord **qui est la personne** (un profil
émotionnel profond, un score de compatibilité, un indice de sincérité), la **photo ne se dévoile qu'au
match réciproque**, et le **travail intérieur réel** (protocoles SOS Shine traversés) rend attirant.

Porté par l'équipe **SOS Shine** (fondatrice **Julia Laureau**, co-fondateur **Thomas**).

### OBJECTIF
Lancer une plateforme de rencontre haut de gamme et sûre, où la profondeur émotionnelle et la
**sincérité** priment sur l'apparence. Deux entrées : **« Rencontrer »** (solo) — **opérationnelle** —
et **« Se retrouver »** (couples, à construire). SOS Meet sert aussi de **canal d'acquisition** vers
SOS Shine (chaque inscription = un compte/lead). Univers visuel « couture après minuit » (noir/grenat),
voix de Julia, RGPD strict, +18.

---

## 1. DÉCISIONS PRODUIT (validées par le client — ne pas re-débattre)

- **Ouvert & gratuit au lancement.** Deux portes d'entrée : un **bonus** pour les abonnés SOS Shine
  ET un **canal d'acquisition** (des gens découvrent SOS Shine *grâce à* SOS Meet).
- **Le compte SOS Meet = un compte SOS Shine** (`auth.users`). Un nouveau venu qui crée un profil
  devient donc un lead/compte SOS Shine. Les abonnés réutilisent leur compte.
- **Photos en révélation progressive** : la photo reste **voilée**, ne se dévoile qu'au **match
  réciproque**. (Avant match, on ne sert JAMAIS la vraie photo — pas de flou « défloutable ».)
- **Les protocoles SOS Shine réalisés apparaissent sur le profil** → section « Chemin accompli ».
  Boucle vertueuse (faire le travail sur SOS Shine → profil plus crédible/attirant) + corroboration
  de sincérité. Source : table `user_progress` (protocoles complétés du compte).
- **Détecter la triche / les incohérences est une priorité forte du client** (« que l'ordinateur
  détecte les gens qui trichent »). → moteur de sincérité (voir §5).
- **Questionnaire de 200 questions** (doc de Julia) traité **par PALIERS** : un palier « Essentiel »
  (~30 q, ~10 min) débloque la découverte, puis on approfondit.
- **Sincérité : usage interne + badge POSITIF** « Profil cohérent » pour les hauts scores. **Jamais**
  de « menteur » affiché publiquement.
- **Temps de réponse capté discrètement** (signal anti-bâclage).

---

## 2. RÈGLES DE TRAVAIL

- **Branche : `claude/build-sos-shine-v1-LaIX0`.** `git fetch` + `git rebase origin/…` avant chaque push.
  Ne pas créer de PR sauf demande.
- **Chaque incrément compile** (`npm run build`), est commité clairement, poussé. Montrer le rendu
  (captures via Chromium `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`).
- Footer de commit obligatoire :
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01LVPUUmY9EhzpTEB1r1Ebxa
  ```
- **RGPD** : SOS Meet touche sexualité/attachement/convictions = **données sensibles (art. 9)**.
  Consentement explicite (`sensitive_consent`), hébergement UE, **+18 obligatoire**. Ne jamais exposer
  les photos avant match. Sécurité (signaler/bloquer) indispensable avant ouverture large.
- **Ton** : sexy mais **raffiné, jamais vulgaire**. Voix chaleureuse, tutoiement.
- **MCP Supabase instable** : ne jamais bloquer une livraison dessus. Écrire les migrations en fichiers
  (`supabase/migrations/`), rendre les API robustes, réessayer plus tard pour appliquer/lire.

---

## 3. IDENTITÉ VISUELLE (≠ SOS Shine — surtout pas d'or/ivoire)

« **Couture après minuit** » : sombre, sensuel, chic.
- Palette : noir encre `#0A090B`, velours `#120E11`, carte `#151016`, filet `rgba(242,235,228,.12)`,
  **grenat `#9B1B2E`**, grenat foncé `#7d1723`, **braise `#C1121F`**, albâtre `#F2EBE4`,
  gris fumé `#A99A96`, fumé-2 `#6E6360`.
- Typo : **Bodoni Moda** (titres, italique grenat pour l'accent) + **Jost** (texte). Chargées via
  `<link>` Google Fonts runtime dans `app/sos-meet/layout.tsx` (variables `--sm-serif`, `--sm-sans`).
- Ambiance : beaucoup de vide, lenteur, grain subtil, halo grenat en haut. Le raffinement vient de
  l'espace, pas de la surcharge.
- **Images** (fournies par le client, générées via ChatGPT) dans `public/sosmeet/` :
  `hero-silhouettes.png` (hero, silhouettes qui s'effleurent), `masked-she.png` / `masked-he.png`
  (portraits voilés « à travers la vitre » pour la révélation progressive), `wordmark.png`
  (« SOS Meet. » + « LA RENCONTRE EN CONSCIENCE »), `velvet.png` (velours noir/rouge).
  Pour de nouvelles images, prompt type : *très sombre, grenat #9B1B2E, « vast dark negative space
  for text overlay », film grain, couture campaign at midnight, no text/faces* — hero 16:9 **et** 3:4,
  portraits 1:1, carte sociale 1200×630.

---

## 4. BASE DE DONNÉES (Supabase, projet `krdfvggmfswbohuevzlb`)

Toutes les tables SOS Meet ont **RLS fermée** (aucune policy anon/authenticated) → **tout accès passe
par des routes serveur** utilisant le client **admin/service-role** (`lib/supabase/admin.ts`), qui
authentifie l'utilisateur via `lib/supabase/server.ts` puis écrit. Schéma documenté :
`supabase/schema.sql`.

- **`sosmeet_waitlist`** : id, email (unique), first_name, city, stage, consent, created_at.
- **`sosmeet_profiles`** : id, **user_id** (→ auth.users), email, `answers` jsonb (`{qid: valeur}`),
  `scores` jsonb (`{dimensions, filters, answered, sincerity}`), first_name, birthdate, gender,
  `seeking text[]`, city, headline, **photo_path**, age_confirmed, **is_visible**, sensitive_consent,
  completed, updated_at, created_at.
- **`sosmeet_interests`** : from_user, to_user, unique(from_user,to_user).
- **`sosmeet_matches`** : user_a, user_b, unique(user_a,user_b).
- **`sosmeet_messages`** : match_id, sender_id, body, read_at, created_at.
- **`sosmeet_reports`** : reporter_id, reported_id, reason.
- **`sosmeet_blocks`** : blocker_id, blocked_id, unique.
- **Bucket Storage privé `sosmeet-photos`** (8 Mo, image/jpeg|png|webp).

⚠️ Migration **`supabase/migrations/20260827_sosmeet_account_link.sql`** (drop FK email→waitlist,
email nullable, unique(user_id)) **pas encore appliquée** (MCP down au moment du build). **L'API est
robuste sans** (elle garantit une ligne waitlist pour satisfaire l'ancienne contrainte, upsert manuel
par user_id). À appliquer quand Supabase MCP répond, puis simplifier l'API si souhaité.

---

## 5. LES MOTEURS (code pur, testés) — le cœur

### a) Questionnaire — palier Essentiel : `lib/sosmeet/essentiel.ts`
~30 questions choisies parmi les 200, chacune taguée :
- `type` : `'choice' | 'scale' | 'number'`
- `role` : `'similarity'` (trait de soi, options avec `value` 0..100) · `'preference'` (ce que je
  cherche chez l'autre, `filterKey`) · `'filter'` (donnée dure : âge, enfants, exclusivité) · `'info'`.
- `dimension` (pour similarity), `weight`, `desirable` (indices d'options « flatteuses »), `sensitive`.
- Dimensions : `intentions, engagement, securite, independance, spiritualite, sexualite, lifestyle,
  social, valeurs`.
- Réponses stockées : `{ qid: index d'option }` (choix) ou `{ qid: nombre }` (âge).
- `ESSENTIEL_COUNT` = nombre de questions.

### b) Matching : `lib/sosmeet/matching.ts`
- `computeProfile(answers)` → `{ dimensions (0..100), filters, answered }`.
- `compatibility(a, b)` → `{ score 0..100, blocked, reasons[], frictions[] }` :
  similarité pondérée des dimensions + préférences (spiritualité/maturité voulues) + **filtres durs**
  (désaccord enfants, exclusivité incompatible) qui **bloquent** (score plafonné à 20).

### c) Sincérité / anti-triche : `lib/sosmeet/coherence.ts`
- `computeSincerity(answers, timings)` → `{ score 0..100, band ('haute'|'moyenne'|'à vérifier'),
  coherent (badge), signals, flags[] }`.
- 4 signaux : **paires de cohérence** (`COHERENCE_RULES` — contradictions logiques, ex. « couche-tard »
  mais couché avant 22h30 ; « sécure » mais peur d'abandon forte ; « prêt » mais deuil non fait),
  **redondance**, **désirabilité sociale** (`DESIRABILITY`, synchronisée avec `essentiel.desirable`),
  **anti-bâclage** (straight-lining + **temps de réponse**).
- Usage : drapeaux de modération (interne) + pondération du matching + badge public **« Profil cohérent »**.
- **Extensible** : ajouter des règles/flags au fur et à mesure qu'on code les 200 questions.

### d) Démos vérifiées
`scripts/sosmeet-coherence-demo.ts` (sincère 100/100 vs tricheur 15/100 avec drapeaux),
`scripts/sosmeet-matching-demo.ts` (alignés = forte compat ; conflit enfants/exclusivité = bloqué 20%).

### e) Legacy (à retirer un jour)
`lib/sosmeet/questions.ts` + `scoring.ts` + `app/api/sosmeet/profile/route.ts` : ancien questionnaire
par email, **plus utilisé par l'UI**.

---

## 6. PARCOURS UTILISATEUR (ordre)

1. **Découverte** — `/sos-meet` (landing couture, liste d'attente fonctionnelle).
2. **Inscription / connexion** — nouveau venu → `/signup?next=/sos-meet/profil` (l'inscription honore
   `?next=`) ; abonné → `/login?next=…`.
3. **Mes infos** — `/sos-meet/profil` : prénom, date de naissance (**+18**), genre, qui je cherche,
   ville, une phrase + **consentements RGPD/sensibles**.
4. **Le questionnaire** — `/sos-meet/questionnaire` : palier Essentiel, une question à la fois, temps
   capté, reprise possible. **← c'est lui qui débloque la découverte.**
5. **Photo** (voilée) → **Chemin accompli** (protocoles) → **Découverte** des compatibles →
   **Connexion** → **Match & révélation** (photo + messagerie) → **Sécurité**.

---

## 7. ROADMAP (phases + statut)

- **Phase 0 — Fondations** ✅ : base + moteurs (sincérité, matching) + identité + landing + liste d'attente.
- **Phase 1 — L'entrée** ✅ : inscription reliée au compte + « Mes infos » + consentement.
  → `app/sos-meet/profil/ProfilClient.tsx`, `app/api/sosmeet/me/route.ts`.
- **Phase 2 — Le questionnaire** ✅ : stepper couture (capte le temps, reprise) + calcul serveur
  (profil + sincérité, stockés dans `answers`/`scores`, `completed`+`is_visible`, badge « Profil cohérent »).
  → `app/sos-meet/questionnaire/*`, `app/api/sosmeet/questionnaire/route.ts`.
- **Phase 3 — Profil vitrine** ✅ : **photo** privée voilée (`/api/sosmeet/photo`) + « Chemin accompli »
  (protocoles via `user_progress`→`douleurs`, exposés par `/api/sosmeet/me`).
- **Phase 4 — Découverte** ✅ : `GET /api/sosmeet/discover` (orientation double sens, exclusions,
  tri compat pondéré sincérité) + page `/sos-meet/decouverte`. Photo jamais servie (voilée).
- **Phase 5 — Connexion & révélation** ✅ : `/api/sosmeet/interest` (match réciproque),
  `/api/sosmeet/matches` (photo dévoilée), `/api/sosmeet/messages` (GET/POST) + page
  `/sos-meet/messages` (liste + conversation, refresh 5 s).
- **Phase 6 — Sécurité** ✅ : `/api/sosmeet/safety` (bloquer/signaler) + menu dans la conversation.
  RESTE : console de modération admin (`app/admin/sosmeet`) à enrichir (drapeaux sincérité, signalements).
- **Phase 7 — Approfondir** ⏳ : le reste des 200 questions en paliers, affinage matching, notifications
  (nouveau match / message), et la piste **couple** (`docs/PROMPT-COUPLE-SOS-MEET.md`).

**Le parcours solo est OPÉRATIONNEL (Phases 1→6).** À appliquer quand Supabase MCP répond :
`supabase/migrations/20260827_sosmeet_account_link.sql` (l'API reste robuste sans).

---

## 8. API SOS MEET

- `GET/POST /api/sosmeet/waitlist` — liste d'attente + compteur public.
- `GET/POST /api/sosmeet/me` — infos de base du compte connecté (authed). Upsert robuste par user_id.
- `GET/POST /api/sosmeet/questionnaire` — réponses + temps ; calcule profil + sincérité ; marque
  `completed`/`is_visible`. (authed)
- `/api/sosmeet/admin` — liste (admin).
- `/api/sosmeet/profile` — **legacy** (ancien flux email).

Note technique : les tables SOS Meet ne sont pas dans les types générés → utiliser `(admin as any)`
pour ces requêtes (comme ailleurs dans le projet), et compat FK via insertion waitlist.

---

## 9. CARTE DES FICHIERS

```
app/sos-meet/
  layout.tsx                 # polices Bodoni/Jost + variables charte
  page.tsx + SosMeetClient   # landing couture (hero, révélation, chemin accompli, liste d'attente, FAQ)
  profil/ (page + ProfilClient)      # Phase 1 — « Mes infos » (authed)
  questionnaire/ (page + QuestionnaireClient)  # Phase 2 — le questionnaire
  opengraph-image.tsx
app/sos-meet/decouverte/ (page + DecouverteClient)     # Phase 4 — découverte
app/sos-meet/messages/ (page + MessagesClient)         # Phase 5 — matchs + messagerie
app/sos-meet/couple/ (page + CoupleClient)             # porte couple (concept + liste d'attente)
app/api/sosmeet/{waitlist,me,questionnaire,photo,discover,interest,matches,messages,safety,profile,admin}/route.ts
app/admin/sosmeet/page.tsx   # console admin (À ENRICHIR : modération)
lib/sosmeet/
  essentiel.ts               # banque de questions Essentiel + métadonnées
  matching.ts                # computeProfile + compatibility
  coherence.ts               # computeSincerity + règles + désirabilité
  questions.ts, scoring.ts   # LEGACY (ancien questionnaire, à retirer)
public/sosmeet/*.png         # images de la charte (hero-silhouettes, masked-*, couple, velvet, wordmark)
supabase/schema.sql          # schéma SOS Meet documenté
supabase/migrations/20260827_sosmeet_account_link.sql  # à appliquer
scripts/sosmeet-*-demo.ts    # démos des moteurs
```

---

## 10. CE QUI EST FAIT ✅

**Le parcours SOLO est OPÉRATIONNEL de bout en bout (Phases 0→6) :**
- Fondations : base complète (RLS fermée), bucket photos privé, moteurs **matching** + **sincérité**
  (anti-triche) + questionnaire **Essentiel** (~30 q), identité couture noir/grenat.
- **Accueil à deux portes** (« Rencontrer » / « Se retrouver ») avec les images. (Fond statique désormais —
  l'animation « phare » a été retirée car jugée disgracieuse ; **prévoir un vrai graphisme de fond**.)
- **Inscription/connexion** reliée au compte SOS Shine (`?next=` honoré).
- **Mes infos** + **photo voilée** + **Chemin accompli** (protocoles).
- **Questionnaire** (temps capté, profil + sincérité calculés, badge « Profil cohérent »).
- **Découverte** (compat pondérée sincérité, orientation double sens, photo voilée).
- **Connexion → match réciproque → révélation de la photo → messagerie** (+ signaler/bloquer).
- Landing/porte **couple** : concept + « prévenez-moi » (liste d'attente taguée).
- Docs : ce prompt + `PROMPT-COUPLE-SOS-MEET.md` (piste couple pour travail parallèle).

## 11. CE QU'IL RESTE À FAIRE (par priorité)

1. **Un vrai graphisme de fond** pour le hero (profondeur, chic/lingerie, sexy sans vulgaire) — image à
   générer, puis remplacer le dégradé statique dans `app/sos-meet/SosMeetClient.tsx`.
2. **Appliquer la migration** `supabase/migrations/20260827_sosmeet_account_link.sql` (Supabase MCP
   instable ; API robuste sans).
3. **Console de modération admin** (`app/admin/sosmeet`) : profils, drapeaux de sincérité, signalements.
4. **Notifications** (nouveau match / nouveau message) — e-mail et/ou in-app.
5. **Approfondir le questionnaire** au-delà de l'Essentiel (les ~170 autres questions, par paliers) +
   étendre les règles de cohérence/désirabilité en conséquence.
6. **Nettoyage** : retirer le legacy `lib/sosmeet/questions.ts` + `scoring.ts` + `/api/sosmeet/profile`.
7. **Le parcours COUPLE** « Se retrouver » (voir `PROMPT-COUPLE-SOS-MEET.md`) — construit en parallèle
   par Julia + son Claude, dans des dossiers/tables séparés.
8. **Polish & tests** de bout en bout sur le déploiement (le parcours complet est derrière connexion).

---

## 12. PROCHAINE ACTION RECOMMANDÉE
Le solo est opérationnel. Priorité immédiate : **(1)** intégrer un vrai **graphisme de fond** du hero
(profondeur, chic/lingerie, sexy sans vulgaire), **(2)** la **console de modération admin**, **(3)** les
**notifications**. En parallèle, Julia + son Claude construisent la piste **couple**.
