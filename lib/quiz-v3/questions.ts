import type { Question } from './types'

export const QUESTIONS: Question[] = [
  // ─── PHASE 1 — Entrée émotionnelle & cognitive ───
  {
    id: 'Q1',
    phase: 1,
    text: 'Quand tout part de travers dans votre journée, votre premier réflexe c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Analyser ce qui s\'est passé pour comprendre.',
        weights: [{ dim: 'ARCH', sub: 'analyste', pts: 3 }, { dim: 'COND', sub: 'contrôle mental', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Bouger, faire autre chose, ne pas rester immobile.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 3 }, { dim: 'SOMA', sub: 'décharge', pts: 1 }],
      },
      {
        key: 'C',
        label: 'En parler à quelqu\'un de confiance.',
        weights: [{ dim: 'ARCH', sub: 'pilier', pts: 2 }, { dim: 'ATT', sub: 'anxieux', pts: 2 }],
      },
      {
        key: 'D',
        label: 'M\'isoler pour reprendre mes esprits seul·e.',
        weights: [{ dim: 'ARCH', sub: 'citadelle', pts: 3 }, { dim: 'ATT', sub: 'évitant', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q2',
    phase: 1,
    text: 'Le matin, votre humeur dépend surtout de…',
    choices: [
      {
        key: 'A',
        label: 'La qualité de votre sommeil et de votre énergie physique.',
        weights: [{ dim: 'CORPS', sub: 'connecté', pts: 2 }, { dim: 'SOMA', sub: 'fatigue', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Des nouvelles, messages, alertes que vous découvrez.',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 2 }, { dim: 'ENE', sub: 'perméable', pts: 2 }],
      },
      {
        key: 'C',
        label: 'De ce que vous avez prévu dans la journée.',
        weights: [{ dim: 'COND', sub: 'contrôle', pts: 3 }, { dim: 'ARCH', sub: 'gardien', pts: 2 }],
      },
      {
        key: 'D',
        label: 'D\'une intuition diffuse que vous n\'expliquez pas.',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'ouverte', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q3',
    phase: 1,
    text: 'Dans votre corps en ce moment, vous sentez plutôt…',
    choices: [
      {
        key: 'A',
        label: 'Beaucoup de tension dans le haut (épaules, nuque, mâchoires).',
        weights: [{ dim: 'SOMA', sub: 'gorge/cervicales', pts: 3 }, { dim: 'COND', sub: 'contrôle', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Un poids ou une boule au niveau du ventre / plexus.',
        weights: [{ dim: 'SOMA', sub: 'plexus', pts: 3 }, { dim: 'ATT', sub: 'anxieux', pts: 1 }, { dim: 'ENF', sub: 'insécure', pts: 1 }],
      },
      {
        key: 'C',
        label: 'De la lourdeur dans les jambes ou le bassin.',
        weights: [{ dim: 'SOMA', sub: 'bassin/jambes', pts: 3 }, { dim: 'MF', sub: 'féminin', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Honnêtement, je ne sens pas grand-chose.',
        weights: [{ dim: 'CORPS', sub: 'déconnecté', pts: 3 }, { dim: 'ENF', sub: 'dissociation', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q4',
    phase: 1,
    text: 'Quand quelqu\'un vous fait un compliment sincère, intérieurement…',
    choices: [
      {
        key: 'A',
        label: 'Vous le minimisez aussitôt, vous le rejetez.',
        weights: [{ dim: 'COND', sub: 'disqualification', pts: 3 }, { dim: 'ARCH', sub: 'caméléon', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Vous cherchez ce qui se cache derrière.',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 2 }, { dim: 'COND', sub: 'méfiance', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous le recevez avec plaisir, simplement.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 3 }, { dim: 'ARCH', sub: 'équilibré', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous êtes mal à l\'aise et changez de sujet.',
        weights: [{ dim: 'COND', sub: 'imposteur', pts: 3 }, { dim: 'PAR', sub: 'critique', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q5',
    phase: 1,
    text: 'Ce qui vous épuise le plus dans une journée, c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Devoir gérer les émotions des autres.',
        weights: [{ dim: 'ARCH', sub: 'pilier', pts: 3 }, { dim: 'ENE', sub: 'perméable', pts: 2 }, { dim: 'MF', sub: 'féminin sur-investi', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Ne pas avoir bougé, fait, produit.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 3 }, { dim: 'COND', sub: 'productivité', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Devoir socialiser au-delà de ce que vous supportez.',
        weights: [{ dim: 'ENE', sub: 'saturée', pts: 2 }, { dim: 'ARCH', sub: 'citadelle', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Ne pas avoir compris quelque chose qui vous échappe.',
        weights: [{ dim: 'ARCH', sub: 'analyste', pts: 3 }, { dim: 'COND', sub: 'contrôle mental', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q6',
    phase: 1,
    text: 'Quand vous prenez une décision importante, vous écoutez d\'abord…',
    choices: [
      {
        key: 'A',
        label: 'Votre tête (les arguments, les chiffres, la logique).',
        weights: [{ dim: 'ARCH', sub: 'analyste', pts: 3 }, { dim: 'MF', sub: 'masculin', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Votre cœur (ce que vous ressentez pour les autres).',
        weights: [{ dim: 'MF', sub: 'féminin', pts: 3 }, { dim: 'ARCH', sub: 'pilier', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Votre ventre (ce qui se serre ou se détend).',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'intuition', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Le conseil de quelqu\'un en qui vous avez confiance.',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 2 }, { dim: 'ARCH', sub: 'caméléon', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q7',
    phase: 1,
    text: 'Quand quelque chose vous touche profondément, vous le manifestez…',
    choices: [
      {
        key: 'A',
        label: 'En pleurant facilement (joie, émotion, beauté).',
        weights: [{ dim: 'MF', sub: 'féminin', pts: 3 }, { dim: 'CORPS', sub: 'connecté', pts: 1 }],
      },
      {
        key: 'B',
        label: 'En vous sentant traversé·e, mais sans pleurer.',
        weights: [{ dim: 'MF', sub: 'masculin', pts: 2 }, { dim: 'CORPS', sub: 'retenu', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Par une sensation physique forte (frissons, chaleur).',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'ouverte', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous ne savez plus vraiment ce qui vous touche.',
        weights: [{ dim: 'CORPS', sub: 'déconnecté', pts: 3 }, { dim: 'COND', sub: 'anesthésie', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q8',
    phase: 1,
    text: 'Si vous deviez décrire votre rythme intérieur en ce moment…',
    choices: [
      {
        key: 'A',
        label: 'Survie : je tiens, mais ça use.',
        weights: [{ dim: 'PHASE', sub: 'crise', pts: 3 }, { dim: 'SOMA', sub: 'épuisement', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Reconstruction : je recolle les morceaux.',
        weights: [{ dim: 'PHASE', sub: 'reconstruction', pts: 3 }],
      },
      {
        key: 'C',
        label: 'Plateau : tout tourne, mais rien n\'évolue.',
        weights: [{ dim: 'PHASE', sub: 'plateau', pts: 3 }, { dim: 'COND', sub: 'stagnation', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Expansion : ça bouge, ça s\'ouvre, c\'est intense.',
        weights: [{ dim: 'PHASE', sub: 'expansion', pts: 3 }, { dim: 'ENE', sub: 'montante', pts: 1 }],
      },
    ],
  },

  // ─── PHASE 2 — Relations, parents, attachement ───
  {
    id: 'Q9',
    phase: 2,
    text: 'Quand vous pensez à votre père (ou à la figure paternelle de votre enfance), le mot qui vient en premier c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Absent, silencieux, peu présent.',
        weights: [{ dim: 'PAR', sub: 'père absent', pts: 3 }, { dim: 'MF', sub: 'masculin blessé', pts: 3 }, { dim: 'ENF', sub: 'vide', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Strict, exigeant, parfois dur.',
        weights: [{ dim: 'PAR', sub: 'père dominant', pts: 3 }, { dim: 'COND', sub: 'perfection', pts: 2 }, { dim: 'ATT', sub: 'évitant', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Aimant mais maladroit ou fragile.',
        weights: [{ dim: 'PAR', sub: 'père aimant', pts: 2 }, { dim: 'MF', sub: 'masculin doux', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Présent, solide, structurant.',
        weights: [{ dim: 'PAR', sub: 'père sécure', pts: 3 }, { dim: 'ATT', sub: 'sécure', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q10',
    phase: 2,
    text: 'Et votre mère (ou la figure maternelle), c\'était plutôt…',
    choices: [
      {
        key: 'A',
        label: 'Étouffante, envahissante, anxieuse.',
        weights: [{ dim: 'PAR', sub: 'mère fusionnelle', pts: 3 }, { dim: 'ATT', sub: 'anxieux', pts: 2 }, { dim: 'MF', sub: 'féminin envahi', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Distante, froide, peu démonstrative.',
        weights: [{ dim: 'PAR', sub: 'mère absente', pts: 3 }, { dim: 'MF', sub: 'féminin blessé', pts: 2 }, { dim: 'ATT', sub: 'évitant', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Critique, jamais satisfaite.',
        weights: [{ dim: 'PAR', sub: 'mère critique', pts: 3 }, { dim: 'COND', sub: 'imposteur', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Aimante, présente, juste.',
        weights: [{ dim: 'PAR', sub: 'mère sécure', pts: 3 }, { dim: 'ATT', sub: 'sécure', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q11',
    phase: 2,
    text: 'Dans votre famille d\'enfance, vous étiez celle ou celui qui…',
    choices: [
      {
        key: 'A',
        label: 'Sauvait, calmait, faisait le médiateur.',
        weights: [{ dim: 'ENF', sub: 'parentifié', pts: 3 }, { dim: 'ARCH', sub: 'pilier', pts: 2 }, { dim: 'ARCH', sub: 'diplomate', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Brillait, performait, faisait honneur.',
        weights: [{ dim: 'COND', sub: 'performance', pts: 3 }, { dim: 'ENF', sub: 'amour conditionnel', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Faisait le moins de vagues possible.',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 2 }, { dim: 'ARCH', sub: 'caméléon', pts: 3 }],
      },
      {
        key: 'D',
        label: 'Posait problème, dérangeait, secouait.',
        weights: [{ dim: 'ENF', sub: 'bouc émissaire', pts: 3 }, { dim: 'ARCH', sub: 'catalyseur', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q12',
    phase: 2,
    text: 'Petit·e, face à un adulte en colère, vous…',
    choices: [
      {
        key: 'A',
        label: 'Vous figiez sur place.',
        weights: [{ dim: 'SOMA', sub: 'freeze', pts: 3 }, { dim: 'ENF', sub: 'trauma', pts: 2 }, { dim: 'ATT', sub: 'désorganisé', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Tentiez de l\'apaiser, de désamorcer.',
        weights: [{ dim: 'ARCH', sub: 'diplomate', pts: 3 }, { dim: 'ENF', sub: 'parentifié', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Disparaissiez, vous cachiez.',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 3 }, { dim: 'ARCH', sub: 'citadelle', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Ça vous touchait peu, ça glissait.',
        weights: [{ dim: 'CORPS', sub: 'déconnecté', pts: 2 }, { dim: 'ENF', sub: 'dissociation', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q13',
    phase: 2,
    text: 'Dans vos relations amoureuses, votre schéma le plus récurrent c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Tomber sur des gens distants ou indisponibles.',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 3 }, { dim: 'PAR', sub: 'père absent', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Tomber sur des gens fusionnels ou envahissants.',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 3 }, { dim: 'PAR', sub: 'mère fusionnelle', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Tomber sur des gens dévalorisants ou critiques.',
        weights: [{ dim: 'COND', sub: 'disqualification', pts: 3 }, { dim: 'PAR', sub: 'critique', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Plutôt sécure, vous n\'avez pas de schéma marqué.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 3 }],
      },
    ],
  },
  {
    id: 'Q14',
    phase: 2,
    text: 'Quand quelqu\'un vous quitte ou s\'éloigne, votre première pensée c\'est…',
    choices: [
      {
        key: 'A',
        label: '« Qu\'est-ce que j\'ai fait de mal ? »',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 3 }, { dim: 'COND', sub: 'culpabilité', pts: 2 }],
      },
      {
        key: 'B',
        label: '« De toute façon je savais que ça finirait comme ça. »',
        weights: [{ dim: 'COND', sub: 'abandon', pts: 3 }, { dim: 'ENF', sub: 'rejet', pts: 2 }],
      },
      {
        key: 'C',
        label: '« Tant pis, je passe à autre chose vite. »',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 3 }, { dim: 'ARCH', sub: 'citadelle', pts: 1 }],
      },
      {
        key: 'D',
        label: '« Cette fin a un sens, je vais comprendre. »',
        weights: [{ dim: 'SPI', sub: 'ouverte', pts: 2 }, { dim: 'PHASE', sub: 'reconstruction', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q15',
    phase: 2,
    text: 'Dans votre lignée familiale, vous percevez…',
    choices: [
      {
        key: 'A',
        label: 'Des histoires lourdes (deuils, secrets, drames) qui résonnent encore.',
        weights: [{ dim: 'TGEN', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'ouverte', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Des schémas qui se répètent (divorces, addictions, échecs).',
        weights: [{ dim: 'TGEN', sub: 'moyenne', pts: 3 }, { dim: 'COND', sub: 'fatalisme', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Une lignée plutôt apaisée, ordinaire.',
        weights: [{ dim: 'TGEN', sub: 'faible', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Vous n\'y avez jamais vraiment réfléchi.',
        weights: [{ dim: 'ENF', sub: 'déconnexion', pts: 1 }, { dim: 'TGEN', sub: 'angle mort', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q16',
    phase: 2,
    text: 'Au-delà de tout ça, vous diriez que votre rapport au masculin (chez vous, chez les autres) est…',
    choices: [
      {
        key: 'A',
        label: 'En méfiance, en distance, voire en colère.',
        weights: [{ dim: 'MF', sub: 'masculin blessé', pts: 3 }, { dim: 'PAR', sub: 'père douloureux', pts: 2 }],
      },
      {
        key: 'B',
        label: 'En attente, en recherche, en manque.',
        weights: [{ dim: 'MF', sub: 'masculin en quête', pts: 3 }, { dim: 'PAR', sub: 'père absent', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Apaisé, intégré, équilibré.',
        weights: [{ dim: 'MF', sub: 'masculin intégré', pts: 3 }],
      },
      {
        key: 'D',
        label: 'Vous n\'aviez jamais formulé ça comme ça.',
        weights: [{ dim: 'MF', sub: 'angle mort', pts: 2 }, { dim: 'SPI', sub: 'peu explorée', pts: 1 }],
      },
    ],
  },

  // ─── PHASE 3 — Corps, somatique, terrain physique ───
  {
    id: 'Q17',
    phase: 3,
    text: 'Quand vous êtes très stressé·e, c\'est d\'abord où dans votre corps que ça se manifeste ?',
    choices: [
      {
        key: 'A',
        label: 'Estomac, ventre, intestins (digestif).',
        weights: [{ dim: 'SOMA', sub: 'plexus/ventre', pts: 3 }, { dim: 'ENF', sub: 'insécurité', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Gorge, mâchoire, nuque.',
        weights: [{ dim: 'SOMA', sub: 'gorge/cervicales', pts: 3 }, { dim: 'COND', sub: 'non-dit', pts: 2 }, { dim: 'MF', sub: 'expression', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Tête, migraines, tensions cérébrales.',
        weights: [{ dim: 'SOMA', sub: 'tête', pts: 3 }, { dim: 'COND', sub: 'contrôle mental', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Dos, lombaires, épaules.',
        weights: [{ dim: 'SOMA', sub: 'dos', pts: 3 }, { dim: 'COND', sub: 'fardeau porté', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q18',
    phase: 3,
    text: 'Vous avez tendance à attraper facilement…',
    choices: [
      {
        key: 'A',
        label: 'Des angines, des extinctions de voix, des problèmes ORL.',
        weights: [{ dim: 'SOMA', sub: 'gorge', pts: 3 }, { dim: 'COND', sub: 'non-dit', pts: 2 }, { dim: 'MF', sub: 'expression bloquée', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Des cystites, des problèmes intimes, des soucis de bas-ventre.',
        weights: [{ dim: 'SOMA', sub: 'bassin', pts: 3 }, { dim: 'MF', sub: 'féminin blessé', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Des problèmes de peau (eczéma, psoriasis, urticaire).',
        weights: [{ dim: 'SOMA', sub: 'peau', pts: 3 }, { dim: 'ATT', sub: 'limites floues', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Plutôt rien, votre corps tient bien.',
        weights: [{ dim: 'SOMA', sub: 'équilibré', pts: 2 }, { dim: 'CORPS', sub: 'déconnecté', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q19',
    phase: 3,
    text: 'Vos jambes (lourdeur, douleurs, agitation, varices)…',
    choices: [
      {
        key: 'A',
        label: 'Souvent lourdes, fatiguées, ou gonflées.',
        weights: [{ dim: 'SOMA', sub: 'jambes', pts: 3 }, { dim: 'PHASE', sub: 'stagnation', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Agitées, jamais en repos.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 2 }, { dim: 'SOMA', sub: 'décharge', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Plutôt OK, vous n\'y pensez pas.',
        weights: [{ dim: 'SOMA', sub: 'neutre', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous avez des soucis spécifiques (genoux, chevilles, articulations).',
        weights: [{ dim: 'SOMA', sub: 'articulations', pts: 3 }, { dim: 'COND', sub: 'rigidité', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q20',
    phase: 3,
    text: 'Côté sommeil…',
    choices: [
      {
        key: 'A',
        label: 'Vous vous endormez difficilement (mental qui tourne).',
        weights: [{ dim: 'COND', sub: 'contrôle mental', pts: 3 }, { dim: 'SOMA', sub: 'tête', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Vous vous réveillez entre 2h et 4h du matin.',
        weights: [{ dim: 'SOMA', sub: 'foie', pts: 3 }, { dim: 'COND', sub: 'colère retenue', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous dormez beaucoup mais vous n\'êtes pas reposé·e.',
        weights: [{ dim: 'SOMA', sub: 'épuisement', pts: 3 }, { dim: 'PHASE', sub: 'survie', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Vous dormez bien dans l\'ensemble.',
        weights: [{ dim: 'SOMA', sub: 'régulé', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q21',
    phase: 3,
    text: 'Votre rapport à la nourriture, en ce moment, c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Compulsif (vous mangez vos émotions).',
        weights: [{ dim: 'CORPS', sub: 'compensation', pts: 3 }, { dim: 'ENF', sub: 'vide', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Restrictif (vous contrôlez beaucoup).',
        weights: [{ dim: 'COND', sub: 'contrôle', pts: 3 }, { dim: 'MF', sub: 'féminin réprimé', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Désintéressé (vous oubliez de manger, ou ça ne vous fait pas envie).',
        weights: [{ dim: 'CORPS', sub: 'déconnecté', pts: 3 }, { dim: 'PHASE', sub: 'dépression', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Fluide et plutôt joyeux.',
        weights: [{ dim: 'CORPS', sub: 'équilibré', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q22',
    phase: 3,
    text: 'Votre énergie vitale au quotidien…',
    choices: [
      {
        key: 'A',
        label: 'En dents de scie (très haut puis très bas).',
        weights: [{ dim: 'SOMA', sub: 'surrénales', pts: 3 }, { dim: 'ARCH', sub: 'catalyseur', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Toujours basse, vous tirez sur la corde.',
        weights: [{ dim: 'SOMA', sub: 'épuisement', pts: 3 }, { dim: 'PHASE', sub: 'survie', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Stable et plutôt bonne.',
        weights: [{ dim: 'SOMA', sub: 'équilibré', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Haute, presque trop (vous avez du mal à vous poser).',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 2 }, { dim: 'COND', sub: 'hyperactivité', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q23',
    phase: 3,
    text: 'Votre rapport à votre intimité, votre désir, votre sexualité…',
    choices: [
      {
        key: 'A',
        label: 'Plutôt fluide et épanoui.',
        weights: [{ dim: 'CORPS', sub: 'équilibré', pts: 2 }, { dim: 'MF', sub: 'intégré', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Mis de côté, peu de désir.',
        weights: [{ dim: 'CORPS', sub: 'coupé', pts: 2 }, { dim: 'MF', sub: 'endormi', pts: 2 }, { dim: 'PHASE', sub: 'repli', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Compliqué (douleurs, blocages, peur).',
        weights: [{ dim: 'SOMA', sub: 'bassin', pts: 3 }, { dim: 'ENF', sub: 'blessure', pts: 2 }, { dim: 'MF', sub: 'blessé', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Vous préférez ne pas en parler.',
        weights: [{ dim: 'COND', sub: 'tabou', pts: 2 }, { dim: 'ENF', sub: 'silence', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q24',
    phase: 3,
    text: 'Si votre corps pouvait vous parler maintenant, il vous dirait surtout…',
    choices: [
      {
        key: 'A',
        label: '« Repose-moi, je suis épuisé. »',
        weights: [{ dim: 'SOMA', sub: 'épuisement', pts: 3 }, { dim: 'PHASE', sub: 'survie', pts: 2 }],
      },
      {
        key: 'B',
        label: '« Écoute-moi, je te parle depuis longtemps. »',
        weights: [{ dim: 'CORPS', sub: 'dialogue ouvert', pts: 3 }, { dim: 'ENE', sub: 'sensible', pts: 2 }],
      },
      {
        key: 'C',
        label: '« Aime-moi, accepte-moi. »',
        weights: [{ dim: 'CORPS', sub: 'rejet de soi', pts: 3 }, { dim: 'MF', sub: 'féminin blessé', pts: 2 }],
      },
      {
        key: 'D',
        label: '« Bouge, libère, ose. »',
        weights: [{ dim: 'PHASE', sub: 'expansion', pts: 2 }, { dim: 'SOMA', sub: 'potentiel bloqué', pts: 2 }],
      },
    ],
  },

  // ─── PHASE 4 — Mental, croyances, conditionnements ───
  {
    id: 'Q25',
    phase: 4,
    text: 'La voix dans votre tête, celle qui commente, elle vous dit le plus souvent…',
    choices: [
      {
        key: 'A',
        label: '« Tu n\'en fais pas assez. »',
        weights: [{ dim: 'COND', sub: 'performance', pts: 3 }, { dim: 'PAR', sub: 'critique', pts: 2 }],
      },
      {
        key: 'B',
        label: '« Tu n\'es pas à la hauteur. »',
        weights: [{ dim: 'COND', sub: 'imposteur', pts: 3 }, { dim: 'ENF', sub: 'disqualifié', pts: 2 }],
      },
      {
        key: 'C',
        label: '« Méfie-toi, surveille. »',
        weights: [{ dim: 'COND', sub: 'hypervigilance', pts: 3 }, { dim: 'ENF', sub: 'insécure', pts: 2 }],
      },
      {
        key: 'D',
        label: '« Tu fais ce que tu peux, c\'est OK. »',
        weights: [{ dim: 'COND', sub: 'bienveillance', pts: 3 }, { dim: 'ATT', sub: 'sécure', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q26',
    phase: 4,
    text: 'Sur l\'argent, votre croyance profonde c\'est plutôt…',
    choices: [
      {
        key: 'A',
        label: '« Il faut souffrir pour le gagner. »',
        weights: [{ dim: 'COND', sub: 'mérite/souffrance', pts: 3 }, { dim: 'TGEN', sub: 'lignée', pts: 2 }],
      },
      {
        key: 'B',
        label: '« Je n\'en mérite pas tant. »',
        weights: [{ dim: 'COND', sub: 'imposteur', pts: 3 }, { dim: 'ENF', sub: 'disqualifié', pts: 1 }],
      },
      {
        key: 'C',
        label: '« C\'est sale, ça corrompt. »',
        weights: [{ dim: 'COND', sub: 'rejet argent', pts: 3 }, { dim: 'TGEN', sub: 'lignée', pts: 2 }],
      },
      {
        key: 'D',
        label: '« C\'est une énergie qui circule, j\'en attire si je m\'aligne. »',
        weights: [{ dim: 'SPI', sub: 'ouverte', pts: 2 }, { dim: 'COND', sub: 'libre', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q27',
    phase: 4,
    text: 'Quand vous échouez à quelque chose…',
    choices: [
      {
        key: 'A',
        label: 'Vous ruminez longtemps, vous vous en voulez.',
        weights: [{ dim: 'COND', sub: 'culpabilité', pts: 3 }, { dim: 'ARCH', sub: 'analyste', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Vous repartez vite sur autre chose pour oublier.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 2 }, { dim: 'ATT', sub: 'évitant', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous le cachez, vous avez honte qu\'on le sache.',
        weights: [{ dim: 'COND', sub: 'honte', pts: 3 }, { dim: 'PAR', sub: 'critique', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous y voyez une info utile, vous ajustez.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 2 }, { dim: 'COND', sub: 'libre', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q28',
    phase: 4,
    text: 'Demander de l\'aide, pour vous…',
    choices: [
      {
        key: 'A',
        label: 'C\'est très difficile, presque impossible.',
        weights: [{ dim: 'ARCH', sub: 'citadelle', pts: 3 }, { dim: 'ATT', sub: 'évitant', pts: 2 }, { dim: 'MF', sub: 'masculin sur-investi', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Ça dépend à qui (vous filtrez beaucoup).',
        weights: [{ dim: 'ATT', sub: 'évitant', pts: 2 }, { dim: 'COND', sub: 'méfiance', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous le faites, mais après vous culpabilisez.',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 3 }, { dim: 'ENF', sub: 'parentifié', pts: 2 }],
      },
      {
        key: 'D',
        label: 'C\'est assez naturel, vous savez recevoir.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 3 }, { dim: 'COND', sub: 'libre', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q29',
    phase: 4,
    text: 'Le silence, pour vous…',
    choices: [
      {
        key: 'A',
        label: 'Est inconfortable, vous le remplissez vite.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 2 }, { dim: 'COND', sub: 'fuite intérieure', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Est nécessaire, vous le cherchez.',
        weights: [{ dim: 'SPI', sub: 'ouverte', pts: 2 }, { dim: 'ENE', sub: 'sensible', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Est anxiogène, surtout après un conflit.',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 3 }, { dim: 'ARCH', sub: 'diplomate', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous y êtes neutre.',
        weights: [{ dim: 'CORPS', sub: 'déconnecté', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q30',
    phase: 4,
    text: 'Ce qui vous fait honte secrètement, c\'est…',
    choices: [
      {
        key: 'A',
        label: 'Une partie de votre histoire ou de votre passé.',
        weights: [{ dim: 'ENF', sub: 'trauma', pts: 3 }, { dim: 'TGEN', sub: 'secret', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Votre corps, votre apparence.',
        weights: [{ dim: 'CORPS', sub: 'rejet', pts: 3 }, { dim: 'MF', sub: 'féminin blessé', pts: 2 }],
      },
      {
        key: 'C',
        label: 'De ne pas être à la hauteur de ce qu\'on attend de vous.',
        weights: [{ dim: 'COND', sub: 'performance', pts: 3 }, { dim: 'PAR', sub: 'critique', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Honnêtement, vous n\'avez pas vraiment de honte.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 1 }, { dim: 'ENF', sub: 'dissociation', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q31',
    phase: 4,
    text: 'Si vous deviez décrire votre plus grand combat intérieur…',
    choices: [
      {
        key: 'A',
        label: 'Le combat pour me sentir digne d\'amour.',
        weights: [{ dim: 'COND', sub: 'disqualification', pts: 3 }, { dim: 'ATT', sub: 'anxieux', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Le combat pour lâcher le contrôle.',
        weights: [{ dim: 'COND', sub: 'contrôle', pts: 3 }, { dim: 'ARCH', sub: 'gardien', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Le combat pour oser être vu·e, prendre ma place.',
        weights: [{ dim: 'COND', sub: 'invisibilité', pts: 3 }, { dim: 'MF', sub: 'expression', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Le combat pour accepter ce que je ne peux pas changer.',
        weights: [{ dim: 'PHASE', sub: 'traversée', pts: 2 }, { dim: 'SPI', sub: 'ouverture', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q32',
    phase: 4,
    text: 'Quand vous pensez à votre vie dans 5 ans, vous ressentez…',
    choices: [
      {
        key: 'A',
        label: 'De l\'angoisse, de la peur.',
        weights: [{ dim: 'PHASE', sub: 'incertitude', pts: 3 }, { dim: 'COND', sub: 'catastrophisme', pts: 2 }],
      },
      {
        key: 'B',
        label: 'De l\'élan, de l\'envie.',
        weights: [{ dim: 'PHASE', sub: 'expansion', pts: 3 }],
      },
      {
        key: 'C',
        label: 'Un vide, vous ne projetez plus.',
        weights: [{ dim: 'PHASE', sub: 'dépression', pts: 3 }, { dim: 'COND', sub: 'perte de sens', pts: 2 }],
      },
      {
        key: 'D',
        label: 'De la curiosité tranquille.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 2 }, { dim: 'SPI', sub: 'confiance', pts: 2 }],
      },
    ],
  },

  // ─── PHASE 5 — Spirituel, énergétique, projection ───
  {
    id: 'Q33',
    phase: 5,
    text: 'Votre rapport à la spiritualité, en toute honnêteté…',
    choices: [
      {
        key: 'A',
        label: 'Très ouvert, c\'est une dimension importante de ma vie.',
        weights: [{ dim: 'SPI', sub: 'élevée', pts: 3 }, { dim: 'ENE', sub: 'élevée', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Curieux, en exploration.',
        weights: [{ dim: 'SPI', sub: 'moyenne', pts: 3 }, { dim: 'PHASE', sub: 'éveil', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Distant, c\'est pas mon truc.',
        weights: [{ dim: 'SPI', sub: 'faible', pts: 3 }, { dim: 'COND', sub: 'rationalisme', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Méfiant, ça me met mal à l\'aise.',
        weights: [{ dim: 'SPI', sub: 'fermée', pts: 3 }, { dim: 'ENF', sub: 'religieux dur', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q34',
    phase: 5,
    text: 'Les synchronicités (coïncidences qui ont du sens), pour vous…',
    choices: [
      {
        key: 'A',
        label: 'Vous en voyez tout le temps, vous les suivez.',
        weights: [{ dim: 'SPI', sub: 'élevée', pts: 3 }, { dim: 'ENE', sub: 'élevée', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Vous en remarquez parfois, ça vous interpelle.',
        weights: [{ dim: 'SPI', sub: 'moyenne', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous trouvez ça forcé, c\'est juste du hasard.',
        weights: [{ dim: 'SPI', sub: 'faible', pts: 3 }, { dim: 'COND', sub: 'rationalisme', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Vous n\'y avez jamais vraiment fait attention.',
        weights: [{ dim: 'SPI', sub: 'angle mort', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q35',
    phase: 5,
    text: 'Quand vous entrez dans un lieu, vous percevez…',
    choices: [
      {
        key: 'A',
        label: 'Immédiatement l\'ambiance, l\'énergie, le non-dit.',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'perception', pts: 2 }],
      },
      {
        key: 'B',
        label: 'L\'humeur générale, sans plus.',
        weights: [{ dim: 'ENE', sub: 'moyenne', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Vous ne percevez rien de spécial.',
        weights: [{ dim: 'ENE', sub: 'faible', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Vous absorbez tout, parfois trop.',
        weights: [{ dim: 'ENE', sub: 'perméable', pts: 3 }, { dim: 'ATT', sub: 'fusionnel', pts: 1 }],
      },
    ],
  },
  {
    id: 'Q36',
    phase: 5,
    text: 'Votre intuition, vous l\'écoutez…',
    choices: [
      {
        key: 'A',
        label: 'Souvent, et elle vous guide bien.',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 3 }, { dim: 'SPI', sub: 'ouverte', pts: 2 }, { dim: 'ATT', sub: 'sécure', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Parfois, mais le mental reprend vite le dessus.',
        weights: [{ dim: 'ARCH', sub: 'analyste', pts: 2 }, { dim: 'COND', sub: 'contrôle mental', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Rarement, vous ne lui faites pas vraiment confiance.',
        weights: [{ dim: 'SPI', sub: 'faible', pts: 2 }, { dim: 'COND', sub: 'méfiance corps', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Vous ne savez pas trop ce qu\'on appelle « intuition ».',
        weights: [{ dim: 'ENE', sub: 'angle mort', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q37',
    phase: 5,
    text: 'Si vous deviez choisir un mot pour décrire ce qui vous manque le plus en ce moment…',
    choices: [
      {
        key: 'A',
        label: 'La paix.',
        weights: [{ dim: 'PHASE', sub: 'agitation', pts: 2 }, { dim: 'SOMA', sub: 'nerveux', pts: 2 }, { dim: 'COND', sub: 'contrôle', pts: 1 }],
      },
      {
        key: 'B',
        label: 'L\'amour (le vrai, le profond).',
        weights: [{ dim: 'ATT', sub: 'anxieux', pts: 2 }, { dim: 'MF', sub: 'en attente', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Le sens.',
        weights: [{ dim: 'PHASE', sub: 'perte sens', pts: 3 }, { dim: 'SPI', sub: 'quête', pts: 2 }],
      },
      {
        key: 'D',
        label: 'La liberté.',
        weights: [{ dim: 'PHASE', sub: 'enfermement', pts: 3 }, { dim: 'COND', sub: 'devoir', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q38',
    phase: 5,
    text: 'Ce qui vous donne le plus le sentiment d\'être pleinement vivant·e…',
    choices: [
      {
        key: 'A',
        label: 'La création (écrire, créer, faire émerger).',
        weights: [{ dim: 'MF', sub: 'féminin créateur', pts: 3 }, { dim: 'SPI', sub: 'incarnation', pts: 2 }],
      },
      {
        key: 'B',
        label: 'La nature, le silence, les éléments.',
        weights: [{ dim: 'ENE', sub: 'élevée', pts: 2 }, { dim: 'SPI', sub: 'incarnée', pts: 2 }],
      },
      {
        key: 'C',
        label: 'Les liens humains profonds, les conversations vraies.',
        weights: [{ dim: 'ATT', sub: 'sécure', pts: 2 }, { dim: 'ARCH', sub: 'pilier', pts: 1 }],
      },
      {
        key: 'D',
        label: 'Le mouvement, l\'action, le challenge.',
        weights: [{ dim: 'ARCH', sub: 'électron', pts: 3 }, { dim: 'MF', sub: 'masculin', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q39',
    phase: 5,
    text: 'Si vous deviez nommer l\'épreuve qui vous a le plus transformé·e dans votre vie jusqu\'ici…',
    choices: [
      {
        key: 'A',
        label: 'Une rupture, une séparation, un divorce.',
        weights: [{ dim: 'PHASE', sub: 'reconstruction', pts: 2 }, { dim: 'MF', sub: 'relationnel', pts: 2 }],
      },
      {
        key: 'B',
        label: 'Un deuil.',
        weights: [{ dim: 'PHASE', sub: 'traversée deuil', pts: 3 }],
      },
      {
        key: 'C',
        label: 'Un effondrement intérieur (burnout, dépression, crise).',
        weights: [{ dim: 'PHASE', sub: 'reconstruction soi', pts: 3 }, { dim: 'SOMA', sub: 'épuisement', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Une blessure d\'enfance qui vous a longtemps marqué·e.',
        weights: [{ dim: 'ENF', sub: 'trauma', pts: 3 }, { dim: 'TGEN', sub: 'non-résolu', pts: 2 }],
      },
    ],
  },
  {
    id: 'Q40',
    phase: 5,
    text: 'Pour terminer : si vous pouviez recevoir UNE chose de SOS Shine, ce serait…',
    choices: [
      {
        key: 'A',
        label: 'Comprendre pourquoi je répète les mêmes choses.',
        weights: [{ dim: 'COND', sub: 'schémas', pts: 3 }, { dim: 'ARCH', sub: 'analyste', pts: 1 }],
      },
      {
        key: 'B',
        label: 'Apprendre à m\'aimer vraiment.',
        weights: [{ dim: 'COND', sub: 'disqualification', pts: 3 }, { dim: 'MF', sub: 'féminin blessé', pts: 1 }],
      },
      {
        key: 'C',
        label: 'Retrouver de l\'énergie, de la joie.',
        weights: [{ dim: 'SOMA', sub: 'épuisement', pts: 2 }, { dim: 'PHASE', sub: 'reconstruction', pts: 2 }],
      },
      {
        key: 'D',
        label: 'Trouver enfin ma place, ma direction.',
        weights: [{ dim: 'PHASE', sub: 'quête', pts: 3 }, { dim: 'COND', sub: 'invisibilité', pts: 1 }],
      },
    ],
  },
]
