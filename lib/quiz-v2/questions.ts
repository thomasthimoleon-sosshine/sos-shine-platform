/**
 * SOS Shine — Quiz V2 Questions
 * 15 questions across 3 phases, 7 input types
 */

export type QuestionType =
  | 'single'        // Single choice + optional "Autre"
  | 'multi'         // Multi-select (1-3) + optional "Autre"
  | 'slider'        // Slider 1-10 + optional free text
  | 'freetext'      // Pure free text
  | 'freetext_suggestions' // Free text with clickable suggestions

export type Choice = {
  emoji: string
  text: string
  scores: Record<string, number> // dimension_id → points
}

export type Question = {
  id: number
  phase: 1 | 2 | 3
  type: QuestionType
  intro?: string
  question: string
  choices?: Choice[]
  multiMax?: number // for 'multi' type
  sliderLabels?: { left: string; right: string }
  sliderScoring?: (value: number) => Record<string, number>
  suggestions?: string[] // for 'freetext_suggestions'
  maxChars?: number
  hasOther?: boolean // adds "Autre" field to choice questions
}

export const QUESTIONS: Question[] = [
  // ══════════════════════════════════════════
  // PHASE 1 — DIAGNOSTIC (Q1-Q5)
  // ══════════════════════════════════════════
  {
    id: 1,
    phase: 1,
    type: 'single',
    intro: 'Pas de jugement. La première réponse qui te touche est toujours la bonne.',
    question: 'Quand quelque chose te fait vraiment mal — même si tu gardes le sourire à l\'extérieur — ta première réaction intérieure :',
    hasOther: true,
    choices: [
      { emoji: '🔍', text: "Je cherche à comprendre pourquoi — comme si comprendre la douleur la rendait moins menaçante", scores: { '1': 3 } },
      { emoji: '🏃', text: "Je passe à autre chose immédiatement — rester dans la douleur n'est pas une option", scores: { '2': 3 } },
      { emoji: '🤲', text: "Je me demande si l'autre va bien… avant même de me demander si moi je vais bien", scores: { '3': 3, '9': 1 } },
      { emoji: '🏰', text: "Je me ferme. Je digère seul(e) — montrer que ça m'a touché serait trop dangereux", scores: { '4': 3 } },
      { emoji: '📋', text: "Je vérifie si j'ai fait une erreur — c'est probablement de ma faute", scores: { '5': 3 } },
    ],
  },
  {
    id: 2,
    phase: 1,
    type: 'single',
    question: 'Si tu t\'arrêtes vraiment — pas ce que tu dis aux autres, ce que tu ressens au fond — ce qui te vide vraiment :',
    hasOther: true,
    choices: [
      { emoji: '💭', text: "Ressentir des émotions que je n'arrive pas à contrôler ou à comprendre", scores: { '1': 2, '5': 1 } },
      { emoji: '🏋️', text: "L'impression d'être le seul(e) à tenir tout debout — tout le temps", scores: { '3': 2, '4': 2 } },
      { emoji: '💔', text: "La peur constante que quelqu'un que j'aime s'éloigne ou me rejette", scores: { '6': 2, '9': 1 } },
      { emoji: '⚠️', text: "Ne jamais savoir ce que les gens pensent vraiment — l'imprévisibilité m'épuise", scores: { '7': 3 } },
      { emoji: '🌫️', text: "L'écart douloureux entre ce que je voudrais que ma vie soit et ce qu'elle est", scores: { '8': 3 } },
    ],
  },
  {
    id: 3,
    phase: 1,
    type: 'multi',
    intro: 'Sois honnête. Pas ce que tu devrais faire — ce que tu fais vraiment.',
    question: 'Il est 22h. Tu as passé une journée difficile. Ce qui se passe vraiment chez toi :',
    multiMax: 3,
    hasOther: true,
    choices: [
      { emoji: '📱', text: "Je scrolle sans raison — pour ne pas rester seul(e) avec mes pensées", scores: { '2': 2, '6': 1 } },
      { emoji: '🛏️', text: "Je me couche sans parler à personne — personne ne saura que ça ne va pas", scores: { '4': 3 } },
      { emoji: '👶', text: "Je m'occupe des autres — c'est plus facile que de m'occuper de moi", scores: { '3': 3 } },
      { emoji: '🔄', text: "Je rejoue les scènes de la journée en boucle — cherchant ce que j'aurais dû faire autrement", scores: { '1': 2, '7': 2 } },
      { emoji: '🍷', text: "Je bois un verre, je mange, je cherche une sensation forte — pour ne plus ressentir le vide", scores: { '10': 3 } },
      { emoji: '😭', text: "Je pleure sans trop savoir pourquoi — et ça fait presque du bien", scores: { '10': 2 } },
      { emoji: '🎵', text: "Je mets de la musique et je disparais dedans — pour quelques minutes être ailleurs", scores: { '2': 2, '8': 1 } },
    ],
  },
  {
    id: 4,
    phase: 1,
    type: 'slider',
    question: "Quand quelqu'un te demande 'comment tu vas ?', à quel point lui dis-tu vraiment ce que tu ressens ?",
    sliderLabels: {
      left: '"Ça va." C\'est ma réponse par défaut. Même quand ce n\'est pas vrai.',
      right: 'Je dis ce que je ressens vraiment. Sans filtre.',
    },
    sliderScoring: (value: number): Record<string, number> => {
      if (value <= 3) return { '4': 3, '9': 2 }
      if (value <= 6) return { '6': 2, '9': 1 }
      return {}
    },
    hasOther: true,
  },
  {
    id: 5,
    phase: 1,
    type: 'freetext',
    intro: 'Prends le temps qu\'il te faut. Personne ne te lit par-dessus l\'épaule.',
    question: "Complète honnêtement cette phrase — pas la réponse 'correcte', la vraie : 'Ma plus grande peur dans une relation intime, c'est…'",
    maxChars: 200,
  },

  // ══════════════════════════════════════════
  // PHASE 2 — AMPLIFICATION (Q6-Q10)
  // ══════════════════════════════════════════
  {
    id: 6,
    phase: 2,
    type: 'single',
    intro: 'On creuse. Ces réponses vont plus loin que tu ne le crois.',
    question: "Il y a des moments où tu souffles vraiment — pas en surface, vraiment. Qu'est-ce qui est là quand ça arrive ?",
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "…j'ai compris quelque chose qui me démangeait depuis des jours — même si ça ne change rien concrètement", scores: { '1': 3 } },
      { emoji: '⚡', text: "…j'ai quelque chose à faire et que le temps passe vite — dès que ça s'arrête, quelque chose remonte", scores: { '2': 3 } },
      { emoji: '💝', text: "…quelqu'un a besoin de moi — c'est le seul endroit où je ne doute pas de ma valeur", scores: { '3': 3 } },
      { emoji: '🏔️', text: "…je suis seul(e) et que personne n'a besoin de moi pour les deux prochaines heures", scores: { '4': 3 } },
      { emoji: '⚖️', text: "…les choses sont à leur place et que rien ne risque de déraper", scores: { '5': 3 } },
      { emoji: '🦎', text: "…je sens que l'autre est bien avec moi — dès que ce n'est plus clair, quelque chose en moi cherche", scores: { '6': 3 } },
      { emoji: '👁️', text: "…rien de mauvais ne peut arriver dans les prochaines heures — c'est rare, et je le sais", scores: { '7': 3 } },
      { emoji: '🌟', text: "…je me projette dans quelque chose qui n'existe pas encore — la réalité revient toujours trop vite", scores: { '8': 3 } },
      { emoji: '🕊️', text: "…tout le monde autour est bien et qu'il n'y a rien à gérer — c'est ma définition du bonheur, je crois", scores: { '9': 3 } },
      { emoji: '🔥', text: "…quelque chose m'embrase — dans la joie, dans l'amour, dans la colère. Le reste c'est juste attendre", scores: { '10': 3 } },
    ],
  },
  {
    id: 7,
    phase: 2,
    type: 'multi',
    intro: 'Sois honnête — même si ta réaction n\'est pas celle que tu voudrais avoir.',
    question: "Quand quelqu'un s'effondre devant toi — ce qui traverse vraiment, pas ce que tu montres :",
    hasOther: true,
    choices: [
      { emoji: '🔍', text: "Mentalement je cherche pourquoi — analyser me permet de rester à distance de ce que ça me fait", scores: { '1': 2 } },
      { emoji: '🏃', text: "Je propose de faire quelque chose — pas pour eux vraiment, pour ne plus avoir à juste rester là", scores: { '2': 2 } },
      { emoji: '🤲', text: "Leur douleur entre en moi et devient automatiquement la mienne — je ne choisis pas ça, ça se fait", scores: { '3': 3 } },
      { emoji: '😰', text: "Quelque chose en moi se verrouille — je suis là mais je ne sais plus où me mettre dans mon propre corps", scores: { '4': 2, '7': 1 } },
      { emoji: '✨', text: "Je cherche quelque chose à dire pour que ça aille mieux — les voir rester dans la douleur me met hors de moi", scores: { '8': 2 } },
      { emoji: '😢', text: "Je pleure aussi — je ne sais pas toujours si c'est pour eux ou pour quelque chose de moi", scores: { '10': 2 } },
      { emoji: '🚪', text: "Une partie de moi cherche à sortir de la pièce — je reste, mais j'ai besoin de savoir qu'il y a une sortie", scores: { '4': 2, '7': 1 } },
      { emoji: '💭', text: "Je pense à quelque chose à moi que je n'ai pas regardé depuis longtemps — sans savoir si c'est le moment de le dire", scores: { '1': 2 } },
    ],
  },
  {
    id: 8,
    phase: 2,
    type: 'freetext_suggestions',
    intro: 'Cette question est la plus difficile. C\'est aussi celle qui révélera le plus sur toi.',
    question: "Si tu devais admettre une chose que personne — pas même les gens les plus proches de toi — ne sait vraiment, ce serait :",
    maxChars: 300,
    suggestions: [
      'Je me demande si je suis vraiment normal(e) ou si je simule depuis toujours',
      "J'ai peur d'être vide à l'intérieur — que si quelqu'un regardait vraiment, il ne trouverait rien",
      "Je fais semblant d'aller bien depuis si longtemps que je ne sais plus si c'est vrai",
      "J'ai l'impression de passer à côté de ma vie en regardant les autres vivre",
      "J'ai peur que les gens m'aiment pour ce que je fais, pas pour ce que je suis",
      "Je contrôle tout parce que si je lâche prise une seule fois, quelque chose va s'effondrer",
    ],
  },
  {
    id: 9,
    phase: 2,
    type: 'single',
    question: 'Dans une dispute — ta réaction automatique, pas celle que tu voudrais avoir — tu as tendance à :',
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Argumenter logiquement — convaincre l'autre compte plus que d'entendre la douleur sous la dispute", scores: { '1': 2, '5': 1 } },
      { emoji: '🚪', text: "Disparaître — physiquement ou dans ma tête — parce que le conflit m'est insupportable", scores: { '2': 2, '4': 2 } },
      { emoji: '🙏', text: "Céder, même si j'ai raison — la paix vaut plus que d'avoir le dernier mot", scores: { '9': 3, '3': 1 } },
      { emoji: '💥', text: "Partir en claquant la porte — parfois je ne sais pas comment faire autrement", scores: { '4': 2, '10': 1 } },
      { emoji: '🌊', text: "M'effondrer — les émotions prennent le contrôle avant que j'aie pu les retenir", scores: { '10': 3 } },
      { emoji: '🧊', text: "Me figer et ne plus pouvoir parler — mon corps se verrouille et je disparais intérieurement", scores: { '4': 2, '7': 1 } },
      { emoji: '⚔️', text: "Attaquer pour ne pas être touché(e) — l'offensive comme défense", scores: { '10': 2, '7': 1 } },
    ],
  },
  {
    id: 10,
    phase: 2,
    type: 'slider',
    intro: 'On arrive à la moitié du chemin.',
    question: "Quand tu imagines la version de toi libérée de tout ça — sans ces réactions automatiques, sans ces peurs — ce que tu ressens en toi :",
    sliderLabels: {
      left: "😔 Je n'y crois plus vraiment. Ça fait trop longtemps.",
      right: "✨ Je sais qu'elle est là. Je veux la retrouver.",
    },
    sliderScoring: (): Record<string, number> => ({}), // No dimension scoring — stored for Acte 5
    hasOther: true,
  },

  // ══════════════════════════════════════════
  // PHASE 3 — VISUALISATION (Q11-Q15)
  // ══════════════════════════════════════════
  {
    id: 11,
    phase: 3,
    type: 'multi',
    intro: 'On arrive à la fin. Ces réponses ne sont pas pour les autres.',
    question: "La chose que tu t'autorises rarement à vraiment vouloir :",
    multiMax: 3,
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Que quelqu'un devine ce que je ressens — sans que j'aie à l'analyser pour le formuler", scores: { '1': 2 } },
      { emoji: '😌', text: "Qu'on me dise que j'ai le droit de m'arrêter — et que ce ne soit pas juste une phrase vide", scores: { '2': 2 } },
      { emoji: '🎁', text: "Être celui ou celle qu'on aide — juste une fois — sans avoir à m'en excuser après", scores: { '3': 2 } },
      { emoji: '🙏', text: "M'effondrer complètement — et que quelqu'un reste quand même", scores: { '4': 2 } },
      { emoji: '🌊', text: "Laisser quelque chose se défaire — sans lever le petit doigt pour le retenir", scores: { '5': 2 } },
      { emoji: '🪞', text: "Que quelqu'un me voie telle que je suis — pas la version que j'ai construite pour lui", scores: { '6': 2 } },
      { emoji: '😴', text: "Dormir une nuit entière sans surveiller quelque chose — même en rêvant", scores: { '7': 2 } },
      { emoji: '☀️', text: "Vivre un moment sans la certitude que ce n'est pas encore ça", scores: { '8': 2 } },
      { emoji: '🚫', text: "Disparaître une semaine — sans que personne ait besoin de moi — et ne pas m'en vouloir", scores: { '9': 2 } },
      { emoji: '💖', text: "Être aimé(e) d'une façon tellement certaine que je n'aie plus jamais à vérifier si c'est vrai", scores: { '10': 2 } },
    ],
  },
  {
    id: 12,
    phase: 3,
    type: 'freetext',
    intro: 'Celle-là est pour toi seul(e).',
    question: "La chose que tu recommenceras probablement demain — même en sachant que ça ne t'aide pas — c'est :",
    maxChars: 200,
  },
  {
    id: 13,
    phase: 3,
    type: 'freetext',
    intro: 'Prends ton temps. Cette réponse compte vraiment.',
    question: "Ta plus grande peur profonde — celle qui te suit depuis toujours, même quand tu n'en parles pas — c'est quoi ?",
    maxChars: 250,
  },
  {
    id: 14,
    phase: 3,
    type: 'single',
    question: "Si la personne qui te connaît vraiment — pas la version que tu montres — devait résumer qui tu es, ce serait :",
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Toujours une longueur d'avance — et souvent seul(e) à avoir compris", scores: { '1': 2 } },
      { emoji: '⚡', text: "Debout avant les autres, jamais à court — et jamais vraiment à l'arrêt", scores: { '2': 2 } },
      { emoji: '💝', text: "Là pour tout le monde — même quand personne ne demande comment toi tu vas", scores: { '3': 2 } },
      { emoji: '🏔️', text: "On peut tout lui dire — elle ne s'effondre jamais. Du moins pas devant les autres.", scores: { '4': 2 } },
      { emoji: '⚖️', text: "Ne rate jamais — et ne se le pardonne pas quand ça arrive", scores: { '5': 2 } },
      { emoji: '🦎', text: "S'adapte à n'importe qui — parfois au point qu'on ne sait plus vraiment qui elle est, elle", scores: { '6': 2 } },
      { emoji: '👁️', text: "Voit ce que les autres ne voient pas — surtout ce qui peut mal tourner", scores: { '7': 2 } },
      { emoji: '🌟', text: "Projette toujours à deux coups d'avance — du mal à se contenter de maintenant", scores: { '8': 2 } },
      { emoji: '🕊️', text: "Calme tout le monde autour — en absorbant ce qu'elle ne montre pas", scores: { '9': 2 } },
      { emoji: '🔥', text: "Tout ou rien — quand elle s'embrase, ça brûle tout autour aussi", scores: { '10': 2 } },
    ],
  },
  {
    id: 15,
    phase: 3,
    type: 'freetext',
    intro: 'Dernière question. Celle-ci est personnelle. Prends le temps qu\'il te faut.',
    question: "Si tu pouvais dire une seule phrase à toi-même enfant — à celui ou celle qui a construit tous ces schémas pour survivre — ce serait quoi ?",
    maxChars: 200,
  },
]
