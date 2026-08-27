/**
 * SOS Meet — Questionnaire, palier ESSENTIEL (~30 questions).
 * Sélection des questions les plus scorables/discriminantes des 200, avec les
 * métadonnées qui rendent le matching ET la détection d'incohérences possibles.
 *
 * Trois rôles de scoring :
 *   - 'similarity' : trait de SOI → on rapproche les profils qui se ressemblent
 *                    (ou pas, selon la dimension). Chaque option a une valeur 0..100.
 *   - 'preference' : ce que je cherche CHEZ L'AUTRE → filtre/pondère les candidats.
 *   - 'filter'     : donnée dure (âge, enfants, monogamie) → peut éliminer.
 *   - 'info'       : affiché sur le profil, non scoré.
 *
 * À prioriser/affiner ensuite avec Julia — la structure est prête à s'étendre
 * au palier « Approfondir » (les ~170 autres) sans rien casser.
 */

export type Dimension =
  | 'intentions' | 'engagement' | 'securite' | 'independance'
  | 'spiritualite' | 'sexualite' | 'lifestyle' | 'social' | 'valeurs'
  // Ajoutées avec les paliers d'approfondissement (voir paliers.ts) :
  | 'communication' | 'conflit' | 'famille' | 'materiel'

export type Role = 'similarity' | 'preference' | 'filter' | 'info'

export type Choice = { label: string; value?: number }

export type Question = {
  id: string
  module: number
  type: 'choice' | 'scale' | 'number'
  text: string
  choices?: Choice[]
  sensitive?: boolean
  role: Role
  dimension?: Dimension     // pour similarity
  weight?: number           // défaut 1
  desirable?: number[]      // indices d'options « flatteuses » (désirabilité)
  filterKey?: string        // pour role 'filter'/'preference' (clé extraite)
}

// Échelle 1-10 → valeur 0..100 (question q140)
const READY: Choice[] = [
  { label: '1–2', value: 10 }, { label: '3–4', value: 30 }, { label: '5–6', value: 50 },
  { label: '7–8', value: 75 }, { label: '9–10', value: 95 },
]

export const ESSENTIEL: Question[] = [
  // ── Identité / filtres durs ──
  { id: 'q1', module: 1, type: 'number', text: 'Quel est ton âge ?', role: 'filter', filterKey: 'age' },
  { id: 'q131', module: 9, type: 'choice', text: 'Veux-tu des enfants (encore) avec un futur partenaire ?', role: 'filter', filterKey: 'kids',
    choices: [{ label: 'Oui clairement' }, { label: 'Oui, possible' }, { label: 'Non' }, { label: 'Je ne sais pas' }, { label: 'Déjà parent, et pas plus' }] },
  { id: 'q134', module: 9, type: 'choice', text: 'Quel niveau de liberté relationnelle imagines-tu ?', role: 'filter', filterKey: 'exclusivite',
    choices: [{ label: 'Monogamie stricte' }, { label: 'Monogamie, discussion possible' }, { label: 'Ouverture possible' }, { label: 'Je ne sais pas encore' }] },
  { id: 'q14', module: 1, type: 'choice', text: 'Alcool / substances ?', role: 'info',
    choices: [{ label: 'Non' }, { label: 'Occasionnellement' }, { label: 'Régulièrement' }, { label: 'Je préciserai' }] },

  // ── Intentions & engagement (similarité) ──
  { id: 'q127', module: 9, type: 'choice', text: 'Priorité de la vie amoureuse en ce moment ?', role: 'similarity', dimension: 'intentions', weight: 1.3,
    choices: [{ label: 'Priorité haute', value: 100 }, { label: 'Importante, sans sacrifier mon chemin', value: 70 }, { label: 'Secondaire', value: 35 }, { label: 'Ouvert, sans priorité', value: 50 }] },
  { id: 'q140', module: 9, type: 'choice', text: 'À quel point te sens-tu prêt·e pour une relation profonde et engagée ?', role: 'similarity', dimension: 'intentions', weight: 1.4, desirable: [4],
    choices: READY },
  { id: 'q148', module: 10, type: 'choice', text: 'Niveau d’engagement recherché ?', role: 'similarity', dimension: 'engagement', weight: 1.2,
    choices: [{ label: 'Engagé et exclusif assez vite', value: 100 }, { label: 'Construction progressive', value: 65 }, { label: 'Profonde même si cadre non classique', value: 55 }, { label: 'Je ne sais pas encore', value: 40 }] },
  { id: 'q133', module: 9, type: 'choice', text: 'Vivre ensemble assez vite, ou garder des espaces séparés longtemps ?', role: 'similarity', dimension: 'engagement',
    choices: [{ label: 'Vivre ensemble assez vite', value: 100 }, { label: 'Progression lente', value: 65 }, { label: 'Espaces séparés longtemps OK', value: 35 }, { label: 'Flexible', value: 55 }] },

  // ── Attachement (M6) — sécurité & indépendance ──
  { id: 'q83', module: 6, type: 'choice', text: 'Ton style d’attachement dominant ?', sensitive: true, role: 'similarity', dimension: 'securite', weight: 1.3, desirable: [0],
    choices: [{ label: 'Sécure', value: 100 }, { label: 'Anxieux', value: 45 }, { label: 'Évitant', value: 45 }, { label: 'Désorganisé / oscillant', value: 25 }, { label: 'Je ne sais pas', value: 55 }] },
  { id: 'q80', module: 6, type: 'choice', text: 'Besoin d’indépendance dans une relation ?', role: 'similarity', dimension: 'independance',
    choices: [{ label: 'Très élevé', value: 100 }, { label: 'Élevé mais compatible engagement', value: 70 }, { label: 'Modéré', value: 45 }, { label: 'Plus proximité / fusion', value: 20 }, { label: 'A évolué', value: 55 }] },
  { id: 'q87', module: 6, type: 'choice', text: 'As-tu peur de l’abandon ?', sensitive: true, role: 'similarity', dimension: 'securite',
    choices: [{ label: 'Oui, fortement', value: 20 }, { label: 'Un peu', value: 55 }, { label: 'Rarement', value: 80 }, { label: 'Non', value: 100 }] },
  { id: 'q88', module: 6, type: 'choice', text: 'As-tu peur de l’envahissement / de perdre ta liberté ?', sensitive: true, role: 'similarity', dimension: 'independance',
    choices: [{ label: 'Oui, fortement', value: 100 }, { label: 'Un peu', value: 70 }, { label: 'Rarement', value: 40 }, { label: 'Non', value: 25 }] },
  { id: 'q95', module: 6, type: 'choice', text: 'Besoin élevé de contrôle dans ta vie / tes relations ?', role: 'similarity', dimension: 'securite', desirable: [2, 3],
    choices: [{ label: 'Oui', value: 30 }, { label: 'Un peu', value: 55 }, { label: 'J’ai travaillé dessus', value: 85 }, { label: 'Non', value: 95 }] },

  // ── Sexualité & intimité (M7, sensible) ──
  { id: 'q96', module: 7, type: 'choice', text: 'Place de la sexualité dans une relation ?', sensitive: true, role: 'similarity', dimension: 'sexualite',
    choices: [{ label: 'Très importante', value: 100 }, { label: 'Importante, pas centrale', value: 70 }, { label: 'Secondaire si le reste est bon', value: 40 }, { label: 'Essentielle pour le lien', value: 90 }, { label: 'Variable', value: 55 }] },
  { id: 'q105', module: 7, type: 'choice', text: 'L’intimité émotionnelle est-elle un prérequis avant l’intimité sexuelle ?', sensitive: true, role: 'similarity', dimension: 'sexualite',
    choices: [{ label: 'Oui clairement', value: 100 }, { label: 'Souvent', value: 75 }, { label: 'Pas nécessairement', value: 35 }, { label: 'Variable', value: 55 }] },
  { id: 'q104', module: 7, type: 'choice', text: 'Monogame par conviction, ou ouvert·e à d’autres formes ?', sensitive: true, role: 'filter', filterKey: 'exclusivite2',
    choices: [{ label: 'Monogame clair', value: 100 }, { label: 'Monogame, mais j’ai questionné', value: 75 }, { label: 'Ouvert à discuter', value: 45 }, { label: 'Non-monogame / éthique', value: 10 }] },

  // ── Valeurs & spiritualité (M11) ──
  { id: 'q166', module: 11, type: 'choice', text: 'Place du développement personnel / de la spiritualité dans ta vie ?', role: 'similarity', dimension: 'spiritualite', weight: 1.2,
    choices: [{ label: 'Centrale', value: 100 }, { label: 'Importante', value: 80 }, { label: 'Présente, pas dominante', value: 55 }, { label: 'Exploratoire', value: 45 }, { label: 'Peu présente', value: 20 }] },
  { id: 'q168', module: 11, type: 'choice', text: 'Tu es plutôt en quête de…', role: 'similarity', dimension: 'valeurs',
    choices: [{ label: 'Stabilité / ancrage', value: 30 }, { label: 'Transformation continue', value: 90 }, { label: 'Les deux', value: 60 }, { label: 'Simplicité / présence', value: 70 }] },
  { id: 'q149', module: 10, type: 'choice', text: 'L’autre doit-il partager ton intérêt pour le développement personnel / la spiritualité ?', role: 'preference', filterKey: 'wantSpiritual',
    choices: [{ label: 'Oui, important' }, { label: 'Un minimum de conscience' }, { label: 'Pas nécessairement' }, { label: 'Indifférent' }] },
  { id: 'q144', module: 10, type: 'choice', text: 'Niveau de maturité émotionnelle recherché chez l’autre ?', role: 'preference', filterKey: 'wantMaturity',
    choices: [{ label: 'Beaucoup déjà travaillé sur soi' }, { label: 'En chemin sérieux' }, { label: 'La maturité se verra dans le lien' }, { label: 'Ouvert à différents niveaux' }] },

  // ── Lifestyle & rythme (M2) — servent aussi à la cohérence ──
  { id: 'q16', module: 2, type: 'choice', text: 'Es-tu du matin ou du soir ?', role: 'similarity', dimension: 'lifestyle',
    choices: [{ label: 'Vrai lève-tôt', value: 100 }, { label: 'Plutôt matin', value: 75 }, { label: 'Neutre', value: 50 }, { label: 'Vrai couche-tard', value: 10 }, { label: 'Très variable', value: 45 }] },
  { id: 'q17', module: 2, type: 'choice', text: 'Heure de coucher en semaine ?', role: 'info',
    choices: [{ label: 'Avant 22h30' }, { label: '22h30–00h' }, { label: '00h–1h30' }, { label: 'Après 1h30' }, { label: 'Irrégulier' }] },
  { id: 'q21', module: 2, type: 'choice', text: 'Fréquence de sorties le soir ?', role: 'similarity', dimension: 'social',
    choices: [{ label: '≥3×/semaine', value: 100 }, { label: '1–2×/semaine', value: 70 }, { label: 'Quelques×/mois', value: 45 }, { label: 'Rarement', value: 20 }, { label: 'Presque jamais', value: 10 }] },
  { id: 'q23', module: 2, type: 'choice', text: 'Besoin de solitude dans une semaine type ?', role: 'similarity', dimension: 'independance',
    choices: [{ label: 'Beaucoup', value: 100 }, { label: 'Moyen', value: 60 }, { label: 'Peu', value: 25 }, { label: 'Très variable', value: 50 }] },
  { id: 'q32', module: 2, type: 'choice', text: 'Aimes-tu recevoir des gens chez toi ?', role: 'similarity', dimension: 'social',
    choices: [{ label: 'Oui, souvent', value: 100 }, { label: 'De temps en temps', value: 65 }, { label: 'Rarement', value: 30 }, { label: 'Je préfère l’extérieur', value: 45 }] },
  { id: 'q33', module: 2, type: 'choice', text: 'Niveau de calme dont tu as besoin à la maison ?', role: 'info',
    choices: [{ label: 'Beaucoup de calme' }, { label: 'Calme relatif' }, { label: 'À l’aise avec l’animation' }, { label: 'Variable' }] },
  { id: 'q20', module: 2, type: 'choice', text: 'Week-end idéal ?', role: 'info',
    choices: [{ label: 'Cocooning' }, { label: 'Social / sorties' }, { label: 'Nature' }, { label: 'Culturel' }, { label: 'Sport' }, { label: 'Équilibre' }] },

  // ── Maturité / histoire (corroborent l'indice de sincérité + les protocoles) ──
  { id: 'q116', module: 8, type: 'choice', text: 'Des blessures encore actives influencent-elles ta façon d’entrer en relation ?', sensitive: true, role: 'similarity', dimension: 'valeurs', weight: 0.6,
    choices: [{ label: 'Oui, clairement', value: 55 }, { label: 'Un peu, conscient·e', value: 75 }, { label: 'Beaucoup travaillé', value: 95 }, { label: 'Je ne pense pas', value: 40 }] },
  { id: 'q120', module: 8, type: 'choice', text: 'As-tu fait un vrai deuil de tes relations passées ?', role: 'similarity', dimension: 'intentions', weight: 0.7, desirable: [0],
    choices: [{ label: 'Oui', value: 95 }, { label: 'En cours', value: 65 }, { label: 'Pas complètement', value: 40 }, { label: 'Je pense que oui', value: 60 }] },
  { id: 'q125', module: 8, type: 'choice', text: 'Te considères-tu comme quelqu’un de loyal·e ?', role: 'info', desirable: [0, 1],
    choices: [{ label: 'Oui, très' }, { label: 'Oui' }, { label: 'Globalement' }, { label: 'J’ai des zones d’ombre' }] },
]

export const ESSENTIEL_COUNT = ESSENTIEL.length
