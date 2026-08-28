/**
 * SOS Meet, Les PALIERS du questionnaire.
 * ---------------------------------------------------------------------------
 * L'« Essentiel » (~30 q) débloque la découverte. Ensuite, on ne force personne :
 * on propose de « continuer à se dévoiler ». Chaque palier franchi affine le
 * profil, le matching, et l'indice de sincérité, sans jamais rien invalider
 * de ce qui a déjà été répondu (le stockage reste `{ qid: valeur }`).
 *
 * ⚠️ NUMÉROTATION : les questions ci-dessous sont numérotées q2xx / q3xx / q4xx
 * pour ne PAS entrer en collision avec les ~200 questions du document de Julia
 * (numérotées q1..q200). Elles sont rédigées dans sa voix et prêtes à être
 * remplacées/complétées une à une par les siennes, sans toucher au code.
 *
 * Ajouter un palier = ajouter une banque ici + une entrée dans PALIERS.
 * Tout le reste (scoring, cohérence, UI, API) s'adapte automatiquement.
 */

import { ESSENTIEL, type Question } from './essentiel'

// ════════════════════════════════════════════════════════════════════════════
// PALIER 2, « Le lien » : comment tu aimes, comment tu te disputes, comment
// tu répares. C'est ici que se joue la vraie compatibilité de couple.
// ════════════════════════════════════════════════════════════════════════════
export const LIEN: Question[] = [
  // ── Communication ──
  { id: 'q201', module: 20, type: 'choice', text: 'Quand quelque chose te blesse dans un couple, que fais-tu le plus souvent ?', role: 'similarity', dimension: 'communication', weight: 1.3, desirable: [0],
    choices: [{ label: 'Je le dis assez vite, calmement', value: 100 }, { label: 'J’attends le bon moment', value: 75 }, { label: 'Je rumine puis ça sort d’un coup', value: 30 }, { label: 'Je garde pour moi', value: 15 }] },
  { id: 'q202', module: 20, type: 'choice', text: 'On te dit plutôt…', role: 'similarity', dimension: 'communication',
    choices: [{ label: 'Que tu parles beaucoup de tes émotions', value: 100 }, { label: 'Que tu en parles quand on te le demande', value: 65 }, { label: 'Que tu es pudique là-dessus', value: 30 }, { label: 'Que tu montres plus que tu ne dis', value: 45 }] },
  { id: 'q203', module: 20, type: 'choice', text: 'As-tu besoin de beaucoup de mots pour te sentir aimé·e ?', role: 'similarity', dimension: 'communication',
    choices: [{ label: 'Oui, les mots comptent énormément', value: 100 }, { label: 'Ils comptent, sans être tout', value: 70 }, { label: 'Les gestes me parlent plus', value: 35 }, { label: 'La présence me suffit', value: 20 }] },
  { id: 'q204', module: 20, type: 'choice', text: 'Combien de temps peux-tu rester sans nouvelles de la personne que tu aimes, sans que ça te pèse ?', role: 'similarity', dimension: 'communication', weight: 0.9,
    choices: [{ label: 'Quelques heures', value: 100 }, { label: 'Une journée', value: 75 }, { label: 'Deux ou trois jours', value: 45 }, { label: 'Une semaine ou plus', value: 15 }] },
  { id: 'q205', module: 20, type: 'choice', text: 'Es-tu à l’aise pour demander ce dont tu as besoin ?', role: 'similarity', dimension: 'communication', weight: 1.1, desirable: [0],
    choices: [{ label: 'Oui, je sais demander', value: 100 }, { label: 'J’apprends', value: 70 }, { label: 'Difficilement', value: 35 }, { label: 'J’attends qu’on devine', value: 15 }] },

  // ── Conflit & réparation ──
  { id: 'q206', module: 21, type: 'choice', text: 'Au cœur d’une dispute, ton réflexe ?', role: 'similarity', dimension: 'conflit', weight: 1.3,
    choices: [{ label: 'Rester et parler jusqu’au bout', value: 100 }, { label: 'Demander une pause puis revenir', value: 80 }, { label: 'Me fermer, partir', value: 25 }, { label: 'Hausser le ton', value: 30 }, { label: 'Céder pour que ça s’arrête', value: 40 }] },
  { id: 'q207', module: 21, type: 'choice', text: 'Après une dispute, combien de temps te faut-il pour revenir ?', role: 'similarity', dimension: 'conflit', weight: 1.1,
    choices: [{ label: 'Quelques minutes', value: 100 }, { label: 'Quelques heures', value: 75 }, { label: 'Un jour ou deux', value: 40 }, { label: 'Plusieurs jours', value: 15 }] },
  { id: 'q208', module: 21, type: 'choice', text: 'Sais-tu dire « je me suis trompé·e » ?', role: 'similarity', dimension: 'conflit', desirable: [0],
    choices: [{ label: 'Oui, assez facilement', value: 100 }, { label: 'Quand j’ai eu le temps d’y penser', value: 70 }, { label: 'Ça me coûte beaucoup', value: 35 }, { label: 'Rarement', value: 15 }] },
  { id: 'q209', module: 21, type: 'choice', text: 'Le silence de l’autre, pour toi, c’est…', sensitive: true, role: 'similarity', dimension: 'conflit',
    choices: [{ label: 'Insupportable', value: 20 }, { label: 'Inconfortable mais gérable', value: 55 }, { label: 'Un espace nécessaire', value: 90 }, { label: 'Ça dépend du contexte', value: 65 }] },
  { id: 'q210', module: 21, type: 'choice', text: 'Le ton monte-t-il facilement chez toi ?', role: 'similarity', dimension: 'conflit', desirable: [3],
    choices: [{ label: 'Oui, je m’emporte', value: 25 }, { label: 'Parfois', value: 55 }, { label: 'Rarement', value: 85 }, { label: 'Jamais, je me fige plutôt', value: 60 }] },
  { id: 'q211', module: 21, type: 'choice', text: 'Comment supportes-tu la critique de ton/ta partenaire ?', role: 'similarity', dimension: 'conflit', weight: 0.9,
    choices: [{ label: 'Bien, je l’entends', value: 100 }, { label: 'Ça pique puis je l’intègre', value: 75 }, { label: 'Je me défends d’abord', value: 40 }, { label: 'Je le vis comme un rejet', value: 20 }] },

  // ── Sécurité affective (approfondissement) ──
  { id: 'q212', module: 22, type: 'choice', text: 'La jalousie, chez toi ?', sensitive: true, role: 'similarity', dimension: 'securite', weight: 1.2, desirable: [3],
    choices: [{ label: 'Très présente', value: 20 }, { label: 'Présente mais maîtrisée', value: 55 }, { label: 'Rare', value: 85 }, { label: 'Quasi absente', value: 100 }] },
  { id: 'q213', module: 22, type: 'choice', text: 'As-tu besoin d’être rassuré·e régulièrement ?', sensitive: true, role: 'similarity', dimension: 'securite',
    choices: [{ label: 'Oui, souvent', value: 25 }, { label: 'De temps en temps', value: 60 }, { label: 'Peu', value: 85 }, { label: 'Non', value: 100 }] },
  { id: 'q214', module: 22, type: 'choice', text: 'Quand une relation devient sérieuse, que ressens-tu en premier ?', sensitive: true, role: 'similarity', dimension: 'securite', weight: 1.1,
    choices: [{ label: 'De la joie, de l’élan', value: 100 }, { label: 'De la joie et un peu de peur', value: 75 }, { label: 'Une envie de fuir', value: 25 }, { label: 'De la méfiance', value: 30 }] },
  { id: 'q215', module: 22, type: 'choice', text: 'Fais-tu confiance facilement ?', role: 'similarity', dimension: 'securite',
    choices: [{ label: 'Oui, d’emblée', value: 100 }, { label: 'Après quelques preuves', value: 70 }, { label: 'Lentement', value: 40 }, { label: 'Très difficilement', value: 15 }] },
  { id: 'q216', module: 22, type: 'choice', text: 'Es-tu déjà resté·e dans une relation qui te faisait du mal ?', sensitive: true, role: 'similarity', dimension: 'securite', weight: 0.7,
    choices: [{ label: 'Oui, longtemps', value: 40 }, { label: 'Oui, mais je suis parti·e', value: 75 }, { label: 'Non', value: 90 }, { label: 'Je préfère ne pas dire', value: 60 }] },

  // ── Engagement (approfondissement) ──
  { id: 'q217', module: 23, type: 'choice', text: 'Au bout de combien de temps présentes-tu quelqu’un à tes proches ?', role: 'similarity', dimension: 'engagement',
    choices: [{ label: 'Très vite', value: 100 }, { label: 'Après quelques mois', value: 70 }, { label: 'Quand c’est vraiment sérieux', value: 45 }, { label: 'Le plus tard possible', value: 15 }] },
  { id: 'q218', module: 23, type: 'choice', text: 'Le mariage, pour toi ?', role: 'similarity', dimension: 'engagement', weight: 0.9,
    choices: [{ label: 'Important, je le veux', value: 100 }, { label: 'Pourquoi pas', value: 65 }, { label: 'Pas nécessaire', value: 35 }, { label: 'Non merci', value: 10 }] },
  { id: 'q219', module: 23, type: 'choice', text: 'Te projettes-tu facilement dans l’avenir avec quelqu’un ?', role: 'similarity', dimension: 'engagement',
    choices: [{ label: 'Oui, très vite', value: 100 }, { label: 'Quand la confiance est là', value: 70 }, { label: 'Difficilement', value: 35 }, { label: 'Je vis au présent', value: 45 }] },
  { id: 'q220', module: 23, type: 'choice', text: 'Serais-tu prêt·e à déménager pour une histoire d’amour ?', role: 'filter', filterKey: 'mobility',
    choices: [{ label: 'Oui, sans hésiter' }, { label: 'Oui, si c’est solide' }, { label: 'Difficilement' }, { label: 'Non, je suis ancré·e ici' }] },
  { id: 'q221', module: 23, type: 'choice', text: 'La distance au début d’une histoire, tu la vis comment ?', role: 'similarity', dimension: 'engagement', weight: 0.7,
    choices: [{ label: 'Ça ne me gêne pas', value: 100 }, { label: 'Quelques mois, pas plus', value: 65 }, { label: 'Mal', value: 30 }, { label: 'Rédhibitoire', value: 10 }] },
  { id: 'q222', module: 23, type: 'choice', text: 'Ce que tu attends d’abord d’une relation ?', role: 'similarity', dimension: 'intentions', weight: 1.2,
    choices: [{ label: 'Un foyer, une vie construite', value: 100 }, { label: 'Un compagnon de route', value: 75 }, { label: 'Une intensité, un feu', value: 45 }, { label: 'Une paix, une douceur', value: 65 }] },
]

// ════════════════════════════════════════════════════════════════════════════
// PALIER 3, « La vie » : d'où tu viens, ce que tu construis, ce qui t'entoure.
// Ce qui fait qu'on tient dans la durée, ou pas.
// ════════════════════════════════════════════════════════════════════════════
export const VIE: Question[] = [
  // ── Famille & racines ──
  { id: 'q301', module: 30, type: 'choice', text: 'Quelle place tient ta famille dans ta vie ?', role: 'similarity', dimension: 'famille', weight: 1.2,
    choices: [{ label: 'Centrale, on se voit beaucoup', value: 100 }, { label: 'Importante, à distance', value: 70 }, { label: 'Distante', value: 35 }, { label: 'Rompue ou compliquée', value: 20 }] },
  { id: 'q302', module: 30, type: 'choice', text: 'Attends-tu de ton/ta partenaire qu’il ou elle s’intègre à ta famille ?', role: 'preference', filterKey: 'wantFamilyClose',
    choices: [{ label: 'Oui, c’est essentiel' }, { label: 'J’aimerais, sans l’imposer' }, { label: 'Pas particulièrement' }, { label: 'Non, je sépare' }] },
  { id: 'q303', module: 30, type: 'choice', text: 'As-tu déjà des enfants ?', role: 'info',
    choices: [{ label: 'Non' }, { label: 'Oui, à la maison' }, { label: 'Oui, en garde partagée' }, { label: 'Oui, grands / autonomes' }] },
  { id: 'q304', module: 30, type: 'choice', text: 'Comment vis-tu l’idée d’aimer quelqu’un qui a déjà des enfants ?', role: 'similarity', dimension: 'famille', weight: 1.1,
    choices: [{ label: 'Très bien, ça ne change rien', value: 100 }, { label: 'Bien, avec du temps', value: 75 }, { label: 'Ça me freine', value: 35 }, { label: 'Je préfère éviter', value: 10 }] },
  { id: 'q305', module: 30, type: 'choice', text: 'Les animaux à la maison ?', role: 'filter', filterKey: 'pets',
    choices: [{ label: 'J’en ai et j’y tiens' }, { label: 'J’aime, sans en avoir' }, { label: 'Indifférent' }, { label: 'Non, allergie ou refus' }] },

  // ── Argent, travail, ambition ──
  { id: 'q306', module: 31, type: 'choice', text: 'Ton rapport à l’argent ?', role: 'similarity', dimension: 'materiel', weight: 1.1,
    choices: [{ label: 'Je prévois, j’épargne', value: 100 }, { label: 'Équilibré', value: 70 }, { label: 'Je dépense assez librement', value: 35 }, { label: 'C’est un sujet difficile', value: 20 }] },
  { id: 'q307', module: 31, type: 'choice', text: 'Dans un couple, l’argent…', role: 'similarity', dimension: 'materiel',
    choices: [{ label: 'Se met en commun', value: 100 }, { label: 'Se partage en partie', value: 70 }, { label: 'Reste séparé', value: 30 }, { label: 'À discuter au cas par cas', value: 55 }] },
  { id: 'q308', module: 31, type: 'choice', text: 'Quelle place prend ton travail ?', role: 'similarity', dimension: 'materiel', weight: 1.1,
    choices: [{ label: 'Très grande, c’est ma vocation', value: 100 }, { label: 'Importante, avec des limites', value: 70 }, { label: 'Alimentaire', value: 35 }, { label: 'En transition', value: 50 }] },
  { id: 'q309', module: 31, type: 'choice', text: 'L’ambition professionnelle chez l’autre, c’est…', role: 'preference', filterKey: 'wantAmbition',
    choices: [{ label: 'Important pour moi' }, { label: 'Un plus' }, { label: 'Indifférent' }, { label: 'Plutôt un frein' }] },
  { id: 'q310', module: 31, type: 'choice', text: 'Ton équilibre vie pro / vie perso aujourd’hui ?', role: 'similarity', dimension: 'materiel', weight: 0.7, desirable: [0],
    choices: [{ label: 'Bon', value: 100 }, { label: 'Perfectible', value: 70 }, { label: 'Déséquilibré', value: 35 }, { label: 'Je subis', value: 20 }] },

  // ── Convictions ──
  { id: 'q311', module: 32, type: 'choice', text: 'Ton rapport à la religion ou à la foi ?', sensitive: true, role: 'filter', filterKey: 'faith',
    choices: [{ label: 'Croyant·e et pratiquant·e' }, { label: 'Croyant·e, non pratiquant·e' }, { label: 'Spirituel·le sans religion' }, { label: 'Agnostique' }, { label: 'Athée' }] },
  { id: 'q312', module: 32, type: 'choice', text: 'As-tu besoin que l’autre partage tes convictions religieuses ?', sensitive: true, role: 'preference', filterKey: 'wantSameFaith',
    choices: [{ label: 'Oui, c’est indispensable' }, { label: 'Je préférerais' }, { label: 'Peu importe' }, { label: 'Je préfère que non' }] },
  { id: 'q313', module: 32, type: 'choice', text: 'L’engagement écologique dans ton quotidien ?', role: 'similarity', dimension: 'valeurs', weight: 0.8,
    choices: [{ label: 'Structurant', value: 100 }, { label: 'Présent', value: 70 }, { label: 'Léger', value: 40 }, { label: 'Absent', value: 15 }] },
  { id: 'q314', module: 32, type: 'choice', text: 'Parles-tu politique facilement ?', role: 'similarity', dimension: 'valeurs', weight: 0.6,
    choices: [{ label: 'Oui, j’aime ça', value: 100 }, { label: 'Avec des proches', value: 65 }, { label: 'J’évite', value: 30 }, { label: 'Ça me fatigue', value: 20 }] },

  // ── Corps, santé, rythme ──
  { id: 'q315', module: 33, type: 'choice', text: 'Fumes-tu ?', role: 'filter', filterKey: 'smoking',
    choices: [{ label: 'Non, jamais' }, { label: 'Occasionnellement' }, { label: 'Oui, tous les jours' }, { label: 'J’arrête en ce moment' }] },
  { id: 'q316', module: 33, type: 'choice', text: 'Le tabac chez l’autre ?', role: 'preference', filterKey: 'wantSmokeFree',
    choices: [{ label: 'Rédhibitoire' }, { label: 'Je préférerais que non' }, { label: 'Indifférent' }, { label: 'Je fume aussi' }] },
  { id: 'q317', module: 33, type: 'choice', text: 'Le sport dans ta semaine ?', role: 'similarity', dimension: 'lifestyle',
    choices: [{ label: 'Presque tous les jours', value: 100 }, { label: '2 à 3 fois', value: 70 }, { label: 'De temps en temps', value: 40 }, { label: 'Jamais', value: 10 }] },
  { id: 'q318', module: 33, type: 'choice', text: 'Ton rapport à la nourriture ?', role: 'similarity', dimension: 'lifestyle', weight: 0.7,
    choices: [{ label: 'Très attentif·ve', value: 100 }, { label: 'Plutôt sain', value: 75 }, { label: 'Gourmand·e sans règles', value: 40 }, { label: 'Régime particulier', value: 60 }] },
  { id: 'q319', module: 33, type: 'choice', text: 'Voyager, pour toi ?', role: 'similarity', dimension: 'lifestyle',
    choices: [{ label: 'Vital, je pars souvent', value: 100 }, { label: 'J’aime, une ou deux fois par an', value: 70 }, { label: 'Rarement', value: 35 }, { label: 'Je suis bien chez moi', value: 15 }] },

  // ── Vie sociale (approfondissement) ──
  { id: 'q320', module: 34, type: 'choice', text: 'Dans une soirée où tu ne connais personne, tu…', role: 'similarity', dimension: 'social',
    choices: [{ label: 'Vas vers les gens', value: 100 }, { label: 'Attends qu’on vienne', value: 55 }, { label: 'Restes avec qui tu connais', value: 35 }, { label: 'Pars assez vite', value: 15 }] },
  { id: 'q321', module: 34, type: 'choice', text: 'Combien d’amis proches, vraiment proches ?', role: 'similarity', dimension: 'social', weight: 0.8,
    choices: [{ label: 'Beaucoup', value: 100 }, { label: 'Quelques-uns', value: 70 }, { label: 'Un ou deux', value: 40 }, { label: 'Aucun en ce moment', value: 15 }] },
  { id: 'q322', module: 34, type: 'choice', text: 'Ton/ta partenaire doit-il·elle s’entendre avec tes amis ?', role: 'similarity', dimension: 'social', weight: 0.7,
    choices: [{ label: 'Oui, c’est important', value: 100 }, { label: 'Ce serait bien', value: 70 }, { label: 'Pas obligatoire', value: 40 }, { label: 'Je cloisonne', value: 20 }] },
]

// ════════════════════════════════════════════════════════════════════════════
// PALIER 4, « L'intime » : le désir, le corps, ce qu'on ose dire.
// Entièrement sensible (RGPD art. 9), proposé en dernier, jamais imposé.
// ════════════════════════════════════════════════════════════════════════════
export const INTIME: Question[] = [
  { id: 'q401', module: 40, type: 'choice', text: 'À quelle fréquence le désir te traverse-t-il ?', sensitive: true, role: 'similarity', dimension: 'sexualite', weight: 1.2,
    choices: [{ label: 'Très souvent', value: 100 }, { label: 'Souvent', value: 75 }, { label: 'Par périodes', value: 50 }, { label: 'Peu', value: 20 }] },
  { id: 'q402', module: 40, type: 'choice', text: 'Le désir vient chez toi plutôt…', sensitive: true, role: 'similarity', dimension: 'sexualite',
    choices: [{ label: 'Spontanément', value: 100 }, { label: 'En réponse à l’autre', value: 55 }, { label: 'Quand je me sens en sécurité', value: 65 }, { label: 'Ça dépend des périodes', value: 50 }] },
  { id: 'q403', module: 40, type: 'choice', text: 'Parles-tu facilement de sexualité avec la personne que tu aimes ?', sensitive: true, role: 'similarity', dimension: 'sexualite', weight: 1.1, desirable: [0],
    choices: [{ label: 'Oui, très librement', value: 100 }, { label: 'Assez bien', value: 75 }, { label: 'Avec gêne', value: 35 }, { label: 'Presque pas', value: 15 }] },
  { id: 'q404', module: 40, type: 'choice', text: 'Oses-tu dire ce que tu aimes au lit ?', sensitive: true, role: 'similarity', dimension: 'sexualite', desirable: [0],
    choices: [{ label: 'Oui', value: 100 }, { label: 'En partie', value: 65 }, { label: 'Rarement', value: 35 }, { label: 'Non', value: 15 }] },
  { id: 'q405', module: 40, type: 'choice', text: 'Le corps de l’autre, ce qui te touche le plus ?', sensitive: true, role: 'info',
    choices: [{ label: 'Le regard' }, { label: 'La voix' }, { label: 'Les mains' }, { label: 'L’odeur' }, { label: 'La façon de bouger' }] },
  { id: 'q406', module: 40, type: 'choice', text: 'La tendresse hors sexualité (caresses, peau contre peau) ?', sensitive: true, role: 'similarity', dimension: 'sexualite', weight: 1.1,
    choices: [{ label: 'Vitale', value: 100 }, { label: 'Très importante', value: 80 }, { label: 'Agréable', value: 50 }, { label: 'Secondaire', value: 20 }] },
  { id: 'q407', module: 40, type: 'choice', text: 'Combien de temps peux-tu vivre une relation sans sexualité, si le lien est bon ?', sensitive: true, role: 'similarity', dimension: 'sexualite',
    choices: [{ label: 'Quelques jours', value: 100 }, { label: 'Quelques semaines', value: 70 }, { label: 'Quelques mois', value: 40 }, { label: 'Longtemps, ce n’est pas central', value: 15 }] },
  { id: 'q408', module: 40, type: 'choice', text: 'Es-tu attiré·e par la nouveauté et l’exploration ?', sensitive: true, role: 'similarity', dimension: 'sexualite',
    choices: [{ label: 'Beaucoup', value: 100 }, { label: 'Un peu', value: 65 }, { label: 'Je préfère ce que je connais', value: 30 }, { label: 'Pas du tout', value: 10 }] },
  { id: 'q409', module: 40, type: 'choice', text: 'Ton rapport à ton propre corps ?', sensitive: true, role: 'similarity', dimension: 'sexualite', weight: 0.8, desirable: [0],
    choices: [{ label: 'Apaisé', value: 100 }, { label: 'Correct', value: 70 }, { label: 'Compliqué', value: 35 }, { label: 'Difficile', value: 15 }] },
  { id: 'q410', module: 40, type: 'choice', text: 'La pudeur, chez toi ?', sensitive: true, role: 'similarity', dimension: 'sexualite', weight: 0.7,
    choices: [{ label: 'Très faible, je suis à l’aise', value: 100 }, { label: 'Modérée', value: 65 }, { label: 'Forte', value: 30 }, { label: 'Très forte', value: 15 }] },
  { id: 'q411', module: 40, type: 'choice', text: 'As-tu déjà traversé une blessure liée à l’intimité ?', sensitive: true, role: 'similarity', dimension: 'securite', weight: 0.6,
    choices: [{ label: 'Oui, et j’ai travaillé dessus', value: 85 }, { label: 'Oui, encore vive', value: 40 }, { label: 'Non', value: 90 }, { label: 'Je préfère ne pas dire', value: 60 }] },
  { id: 'q412', module: 40, type: 'choice', text: 'L’intimité te fait-elle peur ?', sensitive: true, role: 'similarity', dimension: 'securite',
    choices: [{ label: 'Non', value: 100 }, { label: 'Un peu', value: 65 }, { label: 'Oui, souvent', value: 30 }, { label: 'Oui, beaucoup', value: 15 }] },
]

// ════════════════════════════════════════════════════════════════════════════
// Le registre
// ════════════════════════════════════════════════════════════════════════════
export type PalierId = 'essentiel' | 'lien' | 'vie' | 'intime'

export type Palier = {
  id: PalierId
  title: string          // titre affiché
  tagline: string        // une ligne, voix de Julia
  minutes: number        // durée annoncée
  sensitive: boolean     // palier entièrement intime → prévenir avant
  questions: Question[]
}

export const PALIERS: Palier[] = [
  { id: 'essentiel', title: 'L’essentiel', tagline: 'Ce qu’il faut savoir de toi pour ne pas te présenter n’importe qui.', minutes: 10, sensitive: false, questions: ESSENTIEL },
  { id: 'lien', title: 'Le lien', tagline: 'Comment tu aimes, comment tu te disputes, comment tu répares.', minutes: 8, sensitive: false, questions: LIEN },
  { id: 'vie', title: 'La vie', tagline: 'D’où tu viens, ce que tu construis, ce qui t’entoure.', minutes: 8, sensitive: false, questions: VIE },
  { id: 'intime', title: 'L’intime', tagline: 'Le désir, le corps, ce qu’on ose dire. Rien n’est obligatoire.', minutes: 5, sensitive: true, questions: INTIME },
]

/** L'ordre dans lequel on propose de se dévoiler. */
export const PALIER_ORDER: PalierId[] = PALIERS.map(p => p.id)

/** Toutes les questions, tous paliers confondus. */
export const ALL_QUESTIONS: Question[] = PALIERS.flatMap(p => p.questions)

export const QUESTION_BY_ID: Record<string, Question> =
  Object.fromEntries(ALL_QUESTIONS.map(q => [q.id, q]))

export function getPalier(id: string): Palier | undefined {
  return PALIERS.find(p => p.id === id)
}

/** Le palier auquel appartient une question. */
export function palierOfQuestion(qid: string): PalierId | undefined {
  return PALIERS.find(p => p.questions.some(q => q.id === qid))?.id
}

export type PalierProgress = {
  id: PalierId
  title: string
  tagline: string
  minutes: number
  sensitive: boolean
  total: number
  answered: number
  done: boolean          // ≥ 70% répondu
  unlocked: boolean      // le palier précédent est fait
}

/**
 * Avancement palier par palier, à partir des réponses déjà données.
 * Un palier se débloque quand le précédent est fait, on ne saute pas
 * l'Essentiel pour aller directement à l'intime.
 */
export function palierProgress(answers: Record<string, number>): PalierProgress[] {
  let previousDone = true
  return PALIERS.map((p) => {
    const total = p.questions.length
    const answered = p.questions.filter(q => answers[q.id] != null).length
    const done = total > 0 && answered >= Math.ceil(total * 0.7)
    const row: PalierProgress = {
      id: p.id, title: p.title, tagline: p.tagline, minutes: p.minutes,
      sensitive: p.sensitive, total, answered, done, unlocked: previousDone,
    }
    previousDone = done
    return row
  })
}

/** Le prochain palier à proposer, ou null si tout est fait. */
export function nextPalier(answers: Record<string, number>): PalierProgress | null {
  return palierProgress(answers).find(p => p.unlocked && !p.done) || null
}

/** Profondeur du profil, 0..100, sert à valoriser ceux qui se dévoilent. */
export function depth(answers: Record<string, number>): number {
  const total = ALL_QUESTIONS.length
  const answered = ALL_QUESTIONS.filter(q => answers[q.id] != null).length
  return total > 0 ? Math.round((answered / total) * 100) : 0
}
