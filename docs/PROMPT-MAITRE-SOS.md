# PROMPT MAÎTRE — SOS Shine & SOS Meet

> Document de reprise complet. À donner tel quel à un assistant (Claude) pour continuer le projet
> sans rien perdre du contexte. Dernière mise à jour : 27 août 2026.

---

## 0. COMMENT TRAVAILLER (rôle & méthode)

Tu es l'ingénieur/designer principal de **SOS Shine** (plateforme de déconditionnement émotionnel,
fondée par **Julia Laureau** ; co-fondateur **Thomas Thimoleon**) et de son produit sœur **SOS Meet**
(site de rencontre « en conscience »).

Méthode attendue :
- **Livrer par incréments testés** : chaque changement compile (`npm run build`), est commité avec un
  message clair, et poussé sur la branche de travail. Montre le rendu (captures) quand c'est visuel.
- **Zéro doublon, pas de code mort.** Nettoie ce que tu remplaces.
- **Franchise sur les délais et les risques.** Ne bâcle jamais la sécurité (données sensibles, RGPD,
  mise en relation d'inconnus).
- **Respecter la voix de Julia** (tutoiement, « Shiner », profondeur, sincérité) dans tous les textes.

---

## 1. RÈGLES ABSOLUES (ne jamais enfreindre)

1. **Branche de travail unique : `claude/build-sos-shine-v1-LaIX0`.** Tout développer et pousser là.
   Ne jamais pousser sur une autre branche sans autorisation explicite. Ne pas créer de PR sauf demande.
2. **Lien de paiement Stripe : NE JAMAIS le modifier** sauf si un nouveau lien est fourni. Lien mensuel
   actuel : `https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t`.
3. **Offre simplifiée : 49,90€/mois** OU **33€ le protocole seul** (+ 30 jours de plateforme offerts).
   **Plus aucun essai gratuit de 7 jours. Plus d'engagement 3/6/12 mois.**
4. **La 1re étape (étape 1) de chaque protocole reste GRATUITE.**
5. **Charte SOS Shine stricte** (voir §8) : or `#C9A961`, surfaces noir chaud, ivoire. **Interdits** :
   faux-or (#D4AF37/#B8960F), violet/bleu/vert/orange décoratifs.
6. **SOS Meet a sa PROPRE charte** (noir & grenat, voir §9) — **ne pas** utiliser l'or/ivoire SOS Shine.
7. **On ne dit plus « 200 protocoles »** : l'encyclopédie s'enrichit au fil du temps, sans nombre fixe.
8. Un travail en parallèle existe parfois sur la même branche (« le Claude de Julia », autre session).
   **Toujours `git fetch` + `git rebase origin/claude/build-sos-shine-v1-LaIX0` avant de pousser.**

Signature de commit (obligatoire) :
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LVPUUmY9EhzpTEB1r1Ebxa
```

---

## 2. STACK & ACCÈS

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**, **Tailwind**.
- **Supabase** (Postgres + Auth + Storage), projet id : `krdfvggmfswbohuevzlb`.
  - Clients : `lib/supabase/server.ts` (`createClient()`, auth cookies), `lib/supabase/admin.ts`
    (`createAdminClient()`, service role, bypass RLS), `lib/supabase/client.ts` (navigateur).
  - **L'outil MCP Supabase est instable** (se déconnecte souvent). Quand il marche, on applique les
    migrations directement ; sinon on écrit un fichier SQL dans `supabase/migrations/` et on le lance
    manuellement dans le SQL editor. Les routes de seed servent aussi à peupler la base.
- **Stripe** via Payment Links (`lib/stripe/config.ts`, `getPaymentLink`) + webhook
  `app/api/stripe/webhook/route.ts` (seule source de vérité des paiements).
- **Emails** : Resend (`lib/crm/resend.ts`) + templates DB + générateurs code.
- **Déploiement** : Vercel (la branche a un déploiement de prévisualisation ; la prod = `sosshine.com`
  après fusion). Crons définis dans `vercel.json`.
- **Polices** : SOS Shine = Cormorant + DM Sans (auto-hébergées, `app/**/layout` via next/font/local).
  SOS Meet = **Bodoni Moda + Jost** (via `<link>` Google Fonts runtime dans `app/sos-meet/layout.tsx`).
- **PDF/aperçus** : Chromium pré-installé `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

---

## 3. GIT / WORKFLOW

```bash
# avant de pousser, toujours :
git add -A && git commit -m "..."   # message clair + footer obligatoire
git fetch origin claude/build-sos-shine-v1-LaIX0
git rebase origin/claude/build-sos-shine-v1-LaIX0
git push -u origin claude/build-sos-shine-v1-LaIX0
```
Si un PR a été fusionné, repartir de la default branch et recréer la branche (ne pas empiler sur du
merged). Sinon, continuer normalement.

---

## 4. SOS SHINE — LA PLATEFORME (vue d'ensemble)

Espace membre à `/dashboard` (protégé). Sections clés :
- **Encyclopédie / protocoles** (`app/dashboard/encyclopedie/[slug]`) : chaque protocole (table
  `protocols` / « douleur ») a **3 étapes** (`douleur_steps`). Étape 1 gratuite ; 2 & 3 payantes.
  Progression : `user_progress` (step1/2/3_completed, completed_at). Quiz de validation à la fin de
  l'étape 3 (voir ci-dessous). Comptage médias : étape1 = 2 vidéos, étape2 = 2 audios + 1 vidéo,
  étape3 = cahier PDF → un protocole complet = 6/6.
- **Quiz de validation** (par protocole) : tables `douleur_quiz_questions` (question, options jsonb,
  correct_indices jsonb, sort_order) + `douleur_quiz_attempts`. **40 questions/protocole**, **10 tirées
  au hasard**, seuil **80%**, questions différentes à chaque tentative, **réussir pour valider l'étape 3**.
  Les 7 protocoles publiés ont leurs banques (SQL déjà exécuté par l'utilisateur).
- **Shine TV** (vidéos), **Shine Audible** (audios), **Shine Librairie** (livres) : le lecteur de la
  librairie est un **flip-book** (feuilleter comme un vrai livre) — `components/BookFlipReader.tsx`
  (pdf.js → images → react-pageflip ; double page desktop / simple mobile ; anti-téléchargement).
- **Communauté**, **Défis**, **Mon compte** (profil, abonnement, notifications, courrier anonyme,
  sécurité — regroupé), **Affiliation** (voir §7).
- **Homepage** publique : servie en HTML statique via `app/route.ts` → `public/landingtest3d.html`
  (header fondu dans la teinte du hero, logo agrandi, cartes de prix avec descriptions, plus de « 200 »).
- **Pages légales** : contenu en base `landing_sections` (section_key `legal_cgv`, `legal_privacy`,
  `legal_mentions`, jsonb `{title, html_content}`), rendu via `.prose`. Mises à jour : 49,90€, pas
  d'essai gratuit, pas d'engagement. Docx régénérés.
- **Signature Émotionnelle** : quiz-v2 (`app/sos-meet`… non — `components/quiz-v2/`, `app/signature-emotionnelle`),
  déclenche la séquence e-mail Signature.

Changements récents notables : retrait de la météo énergétique + de la date de naissance à l'inscription ;
inscription ne force plus le questionnaire (choix laissé) ; blog avec **date de parution** (`blog_articles`,
`published_at` : un article daté dans le futur reste invisible jusqu'à la date — `lib/blog-parution.ts`).

---

## 5. LE CRM E-MAIL (complet, zéro doublon)

Architecture : templates transactionnels en base (`email_templates`), séquences en base
(`crm_sequences` + `crm_sequence_steps` + `crm_sequence_enrollments`), envoyés par des crons.
Envoi via Resend, dédup via `crm_campaign_events`.

**Le « cerveau central » anti-doublon** : `lib/crm/lifecycle-router.ts` — `enrollInLifecycle()` inscrit
un contact dans **UNE seule file** de cycle de vie et le sort des autres. Règle : jamais deux files à la fois.

Les séquences (toutes rédigées dans la voix de Julia, à partir de 2 docs de référence
« Version Cadeaux » et « Le Meilleur Derrière Les 14 ») :
1. **Signature Émotionnelle** (`signature_test_v2`) — 16 mails sur 14 j + notification, 4 cadeaux
   (ebooks + méditation). Générateurs : `lib/email-templates/quiz-v2/email-01..16`. Cron :
   `app/api/cron/quiz-emails`. Seed : `app/api/admin/seed-quiz-emails`. **Corrige les incohérences**
   (ancien prix 29,90€, « sans carte », essai gratuit) en re-seedant depuis le code (déjà propre).
2. **Inscription** (`registration_*`, 5 mails) — câblé dans `app/auth/callback` (welcome + 4 conversions).
3. **File A — Nouveau membre 49,90€** (`member_onboarding`, 7 mails) — `lib/email-templates/lifecycle/fileA.ts`.
   Déclenchée au paiement dans `processSuccessfulPayment` (remplace l'ancien nurturing). A1 = le welcome.
4. **File B — Achat 33€** (`protocol_33`, 7 mails) — `fileB.ts`. Déclenchée dans le webhook Stripe
   (bloc achat protocole `p_`), **seulement si non-abonné**.
5. **File C — Silence** (`nurture_silence`, 7 mails, J+16→J+180) — `fileC.ts`. Déclenchée à J+14 par le
   cron quiz si ni abo ni 33€ (garde `activeLifecycleTrigger`).
6. **La Lettre** (newsletter hebdo) — 12 lettres mensuelles `lib/email-templates/newsletter/letters.ts`,
   cron `app/api/cron/newsletter-weekly` (dimanche 18h), dédup par (email, mois), vente 1 fois sur 4.
7. **Transactionnels** : abonnement, renouvellement, résiliation+winback, affiliation, événements,
   liste d'attente, rappels de paiement (payment_failed 1/2/3, expiring_soon, access_blocked).

Seed des files A/B/C : `app/api/admin/seed-lifecycle-emails`. Générateur du SQL complet :
`scripts/gen-crm-sql.ts`. **Doublons supprimés** (SQL exécuté par l'utilisateur : ancien suivi quiz,
ancien nurturing, `subscription_welcome`, séquences `signature_test` & `subscription`).

Pied de page e-mail : `lib/email-templates/quiz-v2/wrapper.ts` — ligne « pourquoi tu reçois ça »
neutralisée (`vars.reason`), s'applique au prochain seed.

**Reste à faire côté CRM** : validation des textes par Julia (les 12 lettres livrées en PDF) ; appliquer
d'éventuelles corrections ; re-seed après corrections.

---

## 6. AFFILIATION (à jour)

`app/dashboard/affiliation/page.tsx` : **30% de commission, un seul niveau, récurrent** tant que le
filleul reste abonné. **Condition : être abonné** pour postuler (écran dédié sinon). Fini les paliers
bronze→diamant. Textes i18n dans `lib/i18n/translations.ts` (clés `affiliate.*`).
⚠️ Vérifier que le **taux réellement versé** (webhook/DB) est bien 30% partout.

---

## 7. CHARTE SOS SHINE

- Or `#C9A961` (accent), surfaces **noir chaud**, texte **ivoire**. Tokens globaux.
- **Interdits** : faux-or `#D4AF37`/`#B8960F`, violet/bleu/vert/orange décoratifs.

---

## 8. SOS MEET — LE PRODUIT (le gros chantier en cours)

### Vision & décisions produit (validées)
- **Rencontre « en conscience »** : l'émotionnel avant l'apparence.
- **Ouvert & gratuit au lancement.** Deux portes : bonus pour les abonnés SOS Shine ET **canal
  d'acquisition** (des nouveaux venus découvrent SOS Shine via SOS Meet).
- **Compte = compte SOS Shine** (auth.users). Un nouveau venu qui crée un profil devient un lead SOS Shine.
- **Photos en révélation progressive** : la photo reste voilée, se dévoile au **match réciproque**.
- **Les protocoles SOS Shine réalisés apparaissent sur le profil** (« Chemin accompli ») → boucle
  vertueuse + corroboration de sincérité. Source : `user_progress`.
- **Détection de triche / incohérences** = priorité forte de l'utilisateur (« que l'ordinateur détecte
  les gens qui trichent »).

### Identité visuelle (≠ SOS Shine)
« Couture après minuit » : noir encre `#0A090B`, grenat `#9B1B2E`, braise `#C1121F`, albâtre `#F2EBE4`,
gris fumé `#A99A96`. Serif **Bodoni Moda** (titres, italique grenat pour l'accent), sans **Jost**.
Beaucoup de vide, lenteur, grain, halo grenat. Images fournies par l'utilisateur (générées via ChatGPT)
dans `public/sosmeet/` : `hero-silhouettes.png`, `masked-she.png`, `masked-he.png`, `wordmark.png`,
`velvet.png`. (Prompts d'images : fonds très sombres, « vast negative space for text overlay », 16:9+3:4
pour le hero, 1:1 pour les portraits voilés, 1200×630 pour la carte sociale.)

### Base de données (déjà appliquée)
Toutes RLS **fermées** (aucun accès direct anon/authenticated → tout passe par des routes serveur avec
service role). Schéma documenté dans `supabase/schema.sql`.
- `sosmeet_waitlist` (email, first_name, city, stage, consent)
- `sosmeet_profiles` : **rattaché au compte** (`user_id`), + `email`, `answers` jsonb, `scores` jsonb,
  `first_name, birthdate, gender, seeking[] , city, headline, photo_path, age_confirmed, is_visible,
  sensitive_consent, completed`. (Migration `20260827_sosmeet_account_link.sql` : drop FK email→waitlist,
  email nullable, unique(user_id) — **à appliquer quand Supabase MCP répond** ; l'API est déjà robuste sans.)
- `sosmeet_interests` (from_user, to_user), `sosmeet_matches` (user_a, user_b), `sosmeet_messages`
  (match_id, sender_id, body), `sosmeet_reports`, `sosmeet_blocks`.
- Bucket Storage **privé** `sosmeet-photos` (8 Mo, jpeg/png/webp).

### Le moteur (code, testé)
- **Questionnaire 200** (doc de Julia) → on procède **par paliers**. Palier **Essentiel** (~30 questions
  les plus scorables) : `lib/sosmeet/essentiel.ts`. Chaque question est taguée : `dimension`, `role`
  (`similarity` | `preference` | `filter` | `info`), `weight`, options avec `value` 0..100, `desirable`
  (désirabilité), `sensitive`.
- **Matching** : `lib/sosmeet/matching.ts` — `computeProfile(answers)` → dimensions + filtres ;
  `compatibility(a,b)` → score 0..100 + raisons + frictions (similarité pondérée + préférences + filtres
  durs enfants/exclusivité qui bloquent).
- **Sincérité / anti-triche** : `lib/sosmeet/coherence.ts` — `computeSincerity(answers, timings)` →
  score 0..100, bande (haute/moyenne/à vérifier), drapeaux de modération, badge **positif** « Profil
  cohérent » (jamais de « menteur » public). 4 signaux : paires de cohérence (contradictions), redondance,
  désirabilité sociale, anti-bâclage (straight-lining + **temps de réponse**). Règles extensibles.
- Démos : `scripts/sosmeet-coherence-demo.ts`, `scripts/sosmeet-matching-demo.ts`.
- (Ancien questionnaire `lib/sosmeet/questions.ts` + `scoring.ts` + `app/api/sosmeet/profile` : **legacy**,
  plus utilisé par l'UI — à retirer un jour.)

### Parcours utilisateur (ordre)
Découverte (`/sos-meet`) → Inscription/connexion → **Mes infos** (`/sos-meet/profil`) → **Questionnaire**
(`/sos-meet/questionnaire`) → Photo (voilée) → Chemin accompli → **Découverte** des compatibles →
Connexion → Match & révélation (photo + messagerie) → Sécurité (signaler/bloquer).

### Roadmap de construction (phases)
- **Phase 0 — Fondations** ✅ : base, moteurs sincérité + matching, identité, landing + liste d'attente.
- **Phase 1 — L'entrée** ✅ : inscription reliée au compte + page « Mes infos » + consentement.
  Fichiers : `app/sos-meet/profil/ProfilClient.tsx`, `app/api/sosmeet/me/route.ts`. Garde d'auth
  (liens `/login?next=` & `/signup?next=` — l'inscription honore désormais `?next=`).
- **Phase 2 — Le questionnaire** ✅ : `app/sos-meet/questionnaire/*` (stepper couture, capte le temps,
  reprise) + `app/api/sosmeet/questionnaire/route.ts` (calcule profil + sincérité, stocke dans `answers`
  & `scores` jsonb, marque `completed`+`is_visible`, badge « Profil cohérent »).
- **Phase 3 — Le profil vitrine** ⏳ (À FAIRE) : **photo** (upload privé bucket `sosmeet-photos`, voilée) +
  section **« Chemin accompli »** (lire `user_progress`) + aperçu de son profil.
- **Phase 4 — La découverte** ⏳ : fil de profils compatibles, tri par compatibilité **pondérée par la
  sincérité**, filtres genre/âge/localisation (utiliser `is_visible`, `gender`, `seeking`, `birthdate`).
- **Phase 5 — Connexion & révélation** ⏳ : intérêt (`sosmeet_interests`) → match réciproque
  (`sosmeet_matches`) → **dévoile la photo** (signed URL bucket privé) → **messagerie** (`sosmeet_messages`).
- **Phase 6 — Sécurité & modération** ⏳ : signaler/bloquer (`sosmeet_reports`, `sosmeet_blocks`) + console
  admin (`app/admin/sosmeet`) avec drapeaux de sincérité.
- **Phase 7 — Approfondir** ⏳ : le reste des 200 questions en paliers, affinage matching, notifications.

**« Opérationnel » = Phases 1→5.**

### API SOS Meet existantes
- `GET/POST /api/sosmeet/waitlist` (liste d'attente + compteur)
- `GET/POST /api/sosmeet/me` (infos de base, authed) — NEW
- `GET/POST /api/sosmeet/questionnaire` (réponses + calcul, authed) — NEW
- `/api/sosmeet/profile` (legacy)
- `/api/sosmeet/admin` (liste)

---

## 9. ÉTAT ACTUEL — CE QUI EST FAIT / CE QUI RESTE

**Fait & en ligne (branche)** :
- SOS Shine : librairie flip-book, quiz de validation, épurations dashboard, header/logo/prix homepage,
  retrait « 200 », inscription sans birthdate & sans funnel forcé, pages légales à jour.
- CRM complet, zéro doublon (Signature V2, inscription, Files A/B/C, La Lettre, transactionnels), aiguilleur.
- Affiliation 30% un niveau, réservé abonnés.
- SOS Meet : fondations DB, moteurs sincérité + matching, identité couture + landing reskinnée + liste
  d'attente fonctionnelle, **Phases 1 & 2** (inscription reliée au compte, Mes infos, questionnaire calculé).

**Reste** :
- SOS Meet Phases **3→7** (photo/chemin accompli, découverte, connexion/messagerie, sécurité, approfondir).
- Appliquer la migration `20260827_sosmeet_account_link.sql` (quand MCP Supabase répond).
- CRM : validation des 12 lettres + textes par Julia, puis corrections.
- Vérifier le taux d'affiliation réellement versé (30%).

---

## 10. POINTS DE VIGILANCE

- **MCP Supabase instable** : ne pas bloquer une livraison dessus ; écrire les migrations en fichiers,
  rendre les API robustes. Réessayer plus tard pour appliquer/lire.
- **Données sensibles (RGPD art. 9)** : SOS Meet touche sexualité/attachement/convictions → consentement
  explicite (`sensitive_consent`), hébergement UE, +18 obligatoire. Ne jamais exposer les photos avant match.
- **Sécurité mise en relation** : signaler/bloquer indispensables avant ouverture large.
- **Textes** : toujours la voix de Julia ; SOS Meet = ton sexy mais raffiné, jamais vulgaire.
- **Aucun identifiant de modèle** dans les commits/PR/artefacts (chat uniquement).

---

## 11. DOCUMENTS & APERÇUS PRODUITS (artifacts)
- CRM cartographie e-mail (toutes les séquences lisibles) — artifact.
- Les 12 lettres à valider + calendrier d'envoi (PDF `Les_Lettres_SOS_Shine.pdf`) — artifact.
- Maquette d'ambiance SOS Meet — artifact.
- Roadmap SOS Meet — artifact.

(Les URLs d'artifacts sont dans l'historique de conversation ; recréer au besoin.)

---

## 12. PROCHAINE ACTION RECOMMANDÉE
**SOS Meet Phase 3** : la photo (upload privé + voilée) et la section « Chemin accompli » (protocoles),
puis la **Phase 4 (découverte)** qui rend le produit vivant. Objectif : atteindre « opérationnel » (Phases 1→5).
