# SOS Shine — Dossier complet pour élaboration d'un plan de croissance
*À donner à Grok. Objectif : qu'il produise un plan d'action concret pour atteindre 500 abonnés payants d'ici le 31 décembre 2026, en croissance 100 % organique.*

---

## 0. Ta mission (Grok)
Lis tout ce document. Tu as l'état RÉEL de la plateforme (ce qui marche ET ce qui est cassé). Produis un **plan d'action daté et priorisé** pour passer de ~1 abonné payant à **500 abonnés d'ici le 31 décembre 2026** (nous sommes le 31 juillet 2026), **sans publicité payante** — uniquement de l'organique quotidien sur Facebook, TikTok, Instagram et YouTube, plus l'affiliation. Sois concret, chiffré, priorisé par impact. Ne propose pas de généralités marketing : appuie-toi sur ce qui existe déjà et sur les trous identifiés.

---

## 1. Ce qu'est SOS Shine
Plateforme web de **transformation émotionnelle**, positionnée comme « la première encyclopédie mondiale du bien-être émotionnel ».
- Cible : personnes traversant une période douloureuse (séparation, deuil, abus vécus, burn-out, anxiété, perte de repères).
- Promesse : comprendre ce qui se passe en soi, puis suivre un chemin concret et guidé (psychologie + énergétique + méditation + hypnose + protocoles pas-à-pas).
- Site : sosshine.com. 100 % en ligne, + rencontres en présentiel dans le Sud de la France.
- Équipe : **Julia Laureau** (fondatrice, énergéticienne, seul visage public actuel), **William** (architecte d'évolution), **Thomas** (Gene Keys / clés génétiques).
- Stack technique : Next.js (App Router), Supabase (DB + auth), Stripe (paiements), Resend (emails), hébergé sur Vercel.

---

## 2. Le produit en détail

### 2.1 Le test « Signature Émotionnelle » (l'aimant du funnel)
- Quiz gratuit de **15 questions (~3 min)**, sans carte bancaire, résultat immédiat.
- 3 phases (reconnaissance → reconnaissance profonde → intégration). Questions à choix unique + quelques choix multiples, avec micro-révélations émotionnelles entre les réponses.
- À la fin : **archétype émotionnel** (blessure dominante : ex. Le Gardien Épuisé, L'Hyper-Vigilant(e), L'Invisible Lumineux(se)…) + **protocole personnalisé recommandé**.
- Capture l'email en fin de parcours.

### 2.2 L'encyclopédie des protocoles (le cœur)
- Catalogue de sujets émotionnels (la landing promet « 200+ protocoles »). **⚠️ Le volume réel est en base Supabase et n'a pas pu être vérifié — À CONFIRMER : le catalogue est-il assez rempli pour justifier un abonnement mensuel ?**
- Chaque protocole = **3 étapes** progressives.
- **Étape 1 = gratuite pour tous.** Étapes 2 & 3 = réservées (abonnement OU achat unique 33€).

### 2.3 Les espaces de contenu (inclus dans l'abonnement)
- **Shine TV** — vidéos immersives thématiques
- **Shine Shorts** — formats vidéo courts
- **Shine Audible** — méditations & hypnoses audio
- **Shine Librairie** — livres / lectures
- **Blog** — articles (⚠️ seulement ~7 articles aujourd'hui)
- **Communauté (« Feu de camp »)** — échanges entre membres
- **Courrier anonyme** — soutien/partage anonyme
- **Événements** — ateliers, conférences visio, soins collectifs, rencontres physiques
- Cahiers d'intégration, favoris, suivi de progression
- **Gamification** : XP, niveaux, badges, contributions, notifications push (système réel et fonctionnel)

### 2.4 Les Rencontres (présentiel & live)
Événements payants à l'unité (Sound Healing, cérémonies au lac) + lives hebdomadaires et soins collectifs mensuels inclus dans l'abonnement.

---

## 3. Les tarifs (à jour)
- **Gratuit (inscription obligatoire)** : test Signature, étape 1 de chaque protocole, aperçus de tout. Un non-inscrit ne peut pas payer.
- **Abonnement SOS Shine — 29,90€/mois**, tout inclus, sans engagement. Réductions : 3 mois −10 % (26,91€/mois), 6 mois −20 % (23,92€/mois), 1 an −30 % (20,93€/mois = 251,16€/an).
- **Accès unique — 33€** : débloque UN protocole complet (3 étapes) à vie, sans abonnement. Parcours dédié « Choisir mon protocole ».
- (Un plan « Essentiel » à 9,90€ existe en base mais est archivé/non vendu.)

---

## 4. Le parcours client (funnel actuel)
1. **Réseaux sociaux** (Facebook / TikTok / Instagram / YouTube — organique quotidien) → page d'accueil sosshine.com
2. **Test Signature Émotionnelle** (gratuit, 3 min) → capture email
3. **Email résultat immédiat** (email 02) avec archétype + protocole recommandé
4. **Séquence de 16 emails** signés Julia, 1 par jour pendant ~15 jours (nurturing + conversion)
5. **Inscription gratuite** (compte) → accès étape 1 de tous les protocoles
6. **Conversion** → abonnement 29,90€/mois OU protocole seul 33€
7. **Rétention** : gamification, push, emails de renouvellement/réactivation

---

## 5. Les chiffres réels connus (funnel)
- Depuis avril 2026 : **~34 personnes** ont reçu leur résultat de quiz (email 02).
- Rétention de la séquence : **~33 sur 34 vont jusqu'au 16e email** sans se désinscrire (excellente rétention email).
- Historique plus large : **61 emails captés → 1 seul abonné payant** = **taux de conversion email→payant ≈ 1,6 %**.
- Les emails automatiques partent bien (séquence quiz opérationnelle). Le tracking d'ouverture vient d'être ajouté (données à venir).
- **Le vrai problème n'est pas le trafic ni l'envoi d'emails — c'est la conversion lead→payant (1,6 %) et l'absence de boucle virale.**

---

## 6. État technique RÉEL (audit du code) — ce qui marche vs ce qui est cassé

### ✅ Ce qui est solide (déjà construit)
- **Paywall / checkout** : SubscriptionGate, FeatureGate, checkout Stripe inline, portail, webhook. Friction faible.
- **Rétention** : gamification réelle (XP, badges), push notifications fonctionnelles, nombreux emails de rétention.
- **Emails** : ~28 séquences seedées, tracking d'ouverture (pixel) en place, domaine @sosshine.com.
- **A/B testing** : socle existant (attribution ab_variant sur signups + paiements) — mais un seul test actif (landing).
- **SEO de base** : sitemap, robots, OpenGraph + JSON-LD, OG dynamique.

### 🔴 Ce qui est cassé ou manquant (bloque la croissance)
1. **AFFILIATION CASSÉE de bout en bout** : le lien de parrainage `/signup?ref=CODE` n'est **jamais lu** à l'inscription ; aucune écriture dans `affiliate_clicks`/`affiliate_conversions` ; **aucune commission créditée** dans le webhook Stripe. Le dashboard affilié affiche des tableaux que rien ne remplit. → Tout trafic de parrainage est perdu et non rémunéré. (Programme de commissions prévu : Bronze 10 % / Silver 15 % / Gold 20 % / Diamond 25 % selon le nombre de filleuls.)
2. **PARTAGE DU RÉSULTAT DE QUIZ ABSENT** : pas de bouton de partage natif du résultat (story/image). → La principale boucle virale organique gratuite n'existe pas.
3. **ONBOARDING SANS CTA PAIEMENT** : après inscription, l'onboarding renvoie vers l'encyclopédie mais ne propose jamais l'abonnement ni le 33€ au pic de motivation.
4. **PAS D'EVENTS FUNNEL PAR ÉTAPE** : le quiz n'émet quasiment pas d'events intermédiaires → on ne sait pas à quelle question les gens abandonnent.
5. **PAS DE TRACKING PUBLICITAIRE** (Meta Pixel/GA4) — non prioritaire car pas de pub payante, mais l'attribution par plateforme repose sur des UTM (tracking maison `VisitTracker` existant) qu'il faut poser systématiquement sur tous les liens en bio/description.
6. **SEO faible en surface** : ~9 pages sur 104 ont des metadata ; blog quasi vide (7 articles).
7. **CATALOGUE DE CONTENU À VÉRIFIER** : volume réel des protocoles/vidéos inconnu — si sous la promesse « 200 protocoles », la valeur perçue de l'abonnement est fragile.

---

## 7. Objectif & contraintes (le cadre du plan à produire)
- **Objectif : 500 abonnés payants au 31 décembre 2026** (départ ~1, horizon 5 mois).
- **Contrainte : 0 publicité payante.** Croissance **100 % organique** : Facebook, TikTok, Instagram, YouTube avec **publications quotidiennes**, + programme d'affiliation.
- Ressources : 3 fondateurs (Julia = visage principal), bande passante limitée.
- Leviers disponibles : le quiz viral, les 2 prix d'entrée (33€ et 29,90€/mois), l'affiliation (une fois réparée), la profondeur du contenu (énergétique + Gene Keys), une rétention email exceptionnelle.

---

## 8. Ce que j'attends de toi (Grok)
Produis un plan d'action pour atteindre 500 abonnés au 31/12/2026 :
1. Un **calcul de funnel inversé** (combien de leads/vues/partages/jour nécessaires selon différents taux de conversion) réaliste pour de l'organique.
2. Une **priorisation** des chantiers (produit + contenu + affiliation + social) par impact/effort.
3. Un **planning mois par mois** (août → décembre) avec des cibles intermédiaires d'abonnés.
4. Une **stratégie de contenu organique** concrète pour les 4 plateformes (formats, angles, cadence) qui ramène au quiz.
5. Une **stratégie d'affiliation** (recrutement, activation, rémunération) une fois le système réparé.
6. Les **risques principaux** et comment les mitiger.
7. Ce qui doit être **corrigé/construit en priorité dans le produit** (parmi les trous du §6) pour ne pas gaspiller le trafic organique.

Sois direct, chiffré, actionnable. Pas de blabla.
