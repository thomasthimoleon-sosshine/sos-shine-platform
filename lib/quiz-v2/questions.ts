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
    intro: 'Commençons simplement. Pas de jugement. Juste toi.',
    question: 'Quand quelque chose te blesse profondément, quelle est ta première réaction intérieure ?',
    hasOther: true,
    choices: [
      { emoji: '🔍', text: "J'essaye de comprendre pourquoi ça me fait cet effet", scores: { '1': 3 } },
      { emoji: '🏃', text: "Je passe à autre chose, je ne veux pas rester là-dedans", scores: { '2': 3 } },
      { emoji: '🤲', text: "Je me demande si l'autre va bien", scores: { '3': 3, '9': 1 } },
      { emoji: '🏰', text: "Je me ferme. Je ne dirai rien", scores: { '4': 3 } },
      { emoji: '📋', text: "Je vérifie si j'ai bien respecté les règles", scores: { '5': 3 } },
    ],
  },
  {
    id: 2,
    phase: 1,
    type: 'single',
    question: 'Dans ta vie, ce qui t\'épuise le plus c\'est :',
    hasOther: true,
    choices: [
      { emoji: '💭', text: "Les émotions intenses que je ne contrôle pas", scores: { '1': 2, '5': 1 } },
      { emoji: '🏋️', text: "L'impression que je dois toujours tout porter", scores: { '3': 2, '4': 2 } },
      { emoji: '💔', text: "Le risque que quelqu'un ne m'aime plus", scores: { '6': 2, '9': 1 } },
      { emoji: '⚠️', text: "Les gens imprévisibles", scores: { '7': 3 } },
      { emoji: '🌫️', text: "Le décalage entre ce que je veux et ce qu'est la réalité", scores: { '8': 3 } },
    ],
  },
  {
    id: 3,
    phase: 1,
    type: 'multi',
    intro: 'Tu peux choisir 1, 2 ou 3 réponses.',
    question: 'Il est 22h. Tu as passé une journée difficile. Qu\'est-ce que tu fais concrètement ?',
    multiMax: 3,
    hasOther: true,
    choices: [
      { emoji: '📱', text: "Je scrolle sur mon téléphone pour ne pas penser", scores: { '2': 2, '6': 1 } },
      { emoji: '🛏️', text: "Je me couche sans parler à personne", scores: { '4': 3 } },
      { emoji: '👶', text: "Je m'occupe des autres (enfants, tâches, messages)", scores: { '3': 3 } },
      { emoji: '🔄', text: "Je revois tout ce qui a mal tourné en boucle", scores: { '1': 2, '7': 2 } },
      { emoji: '🍷', text: "Je bois un verre, je mange, je fais quelque chose d'intense", scores: { '10': 3 } },
      { emoji: '😭', text: "Je pleure sans savoir pourquoi", scores: { '10': 2 } },
      { emoji: '🎵', text: "Je mets de la musique et je m'évade", scores: { '2': 2, '8': 1 } },
    ],
  },
  {
    id: 4,
    phase: 1,
    type: 'slider',
    question: "Quand on te demande 'comment tu vas ?', à quel point réponds-tu HONNÊTEMENT ?",
    sliderLabels: {
      left: 'Jamais. "Ça va" est ma réponse par défaut.',
      right: 'Toujours. Je dis ce que je ressens vraiment.',
    },
    sliderScoring: (value: number) => {
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
    intro: 'Prends un moment. Cette question compte.',
    question: "Complète cette phrase : 'Ma plus grande peur dans une relation intime, c'est…'",
    maxChars: 200,
  },

  // ══════════════════════════════════════════
  // PHASE 2 — AMPLIFICATION (Q6-Q10)
  // ══════════════════════════════════════════
  {
    id: 6,
    phase: 2,
    type: 'single',
    intro: 'On creuse un peu plus. Sois aussi honnête que possible.',
    question: "Complète cette phrase : 'Je me sens vraiment moi-même quand…'",
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "…je comprends ce qui se passe", scores: { '1': 3 } },
      { emoji: '⚡', text: "…je suis en mouvement, en action", scores: { '2': 3 } },
      { emoji: '💝', text: "…les gens que j'aime vont bien", scores: { '3': 3 } },
      { emoji: '🏔️', text: "…je suis seul(e)", scores: { '4': 3 } },
      { emoji: '⚖️', text: "…tout est à sa place", scores: { '5': 3 } },
      { emoji: '🦎', text: "…je fais rire ou plaire", scores: { '6': 3 } },
      { emoji: '👁️', text: "…je suis en sécurité", scores: { '7': 3 } },
      { emoji: '🌟', text: "…je rêve à mieux", scores: { '8': 3 } },
      { emoji: '🕊️', text: "…il n'y a pas de conflit", scores: { '9': 3 } },
      { emoji: '🔥', text: "…l'intensité est là", scores: { '10': 3 } },
    ],
  },
  {
    id: 7,
    phase: 2,
    type: 'multi',
    intro: 'Choisis autant de réponses que nécessaire.',
    question: "Quand quelqu'un pleure devant toi, qu'est-ce qui te traverse ?",
    hasOther: true,
    choices: [
      { emoji: '🔍', text: "Je cherche à comprendre pourquoi pour l'aider à analyser", scores: { '1': 2 } },
      { emoji: '🏃', text: "Je propose une activité pour changer d'air", scores: { '2': 2 } },
      { emoji: '🤲', text: "Je prends en charge, je m'occupe d'eux complètement", scores: { '3': 3 } },
      { emoji: '😰', text: "Je suis mal à l'aise, je ne sais pas quoi faire", scores: { '4': 2, '7': 1 } },
      { emoji: '✨', text: "Je rappelle les choses positives qui restent", scores: { '8': 2 } },
      { emoji: '😢', text: "Je pleure avec eux", scores: { '10': 2 } },
      { emoji: '🧊', text: "Je me fige, je ne sais plus quoi dire", scores: { '4': 2, '7': 1 } },
      { emoji: '💭', text: "Je pense à mes propres émotions non gérées", scores: { '1': 2 } },
    ],
  },
  {
    id: 8,
    phase: 2,
    type: 'freetext_suggestions',
    intro: 'Cette question est celle qui révélera le plus. Réponds sincèrement.',
    question: "Si tu devais admettre une chose que PERSONNE ne sait sur toi, ce serait quoi ?",
    maxChars: 300,
    suggestions: [
      'Je me demande si je suis normal(e)',
      "J'ai peur d'être vide à l'intérieur",
      "Je fais semblant d'aller bien depuis des années",
      'Je sens que je passe à côté de ma vie',
      "J'ai peur que personne ne m'aime vraiment",
      "Je contrôle tout parce que quelque chose pourrait s'effondrer",
    ],
  },
  {
    id: 9,
    phase: 2,
    type: 'single',
    question: 'Dans une dispute, tu as tendance à :',
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Argumenter logiquement jusqu'à ce que l'autre comprenne", scores: { '1': 2, '5': 1 } },
      { emoji: '🚪', text: "M'échapper physiquement ou mentalement", scores: { '2': 2, '4': 2 } },
      { emoji: '🙏', text: "Céder pour que ça s'arrête", scores: { '9': 3, '3': 1 } },
      { emoji: '💥', text: "Partir en claquant la porte", scores: { '4': 2, '10': 1 } },
      { emoji: '🌊', text: "M'effondrer (pleurs, crise, explosion)", scores: { '10': 3 } },
      { emoji: '🧊', text: "Me figer, ne plus pouvoir parler", scores: { '4': 2, '7': 1 } },
      { emoji: '⚔️', text: "Attaquer en retour pour ne pas être blessé(e)", scores: { '10': 2, '7': 1 } },
    ],
  },
  {
    id: 10,
    phase: 2,
    type: 'slider',
    intro: 'On arrive à la moitié du chemin.',
    question: "Quand tu imagines la personne que tu pourrais être si tu n'avais plus ces schémas, qu'est-ce que tu ressens ?",
    sliderLabels: {
      left: '😔 Je ne crois plus que ce soit possible',
      right: '✨ Je sais qu\'elle existe et je veux la retrouver',
    },
    sliderScoring: () => ({}), // No dimension scoring — stored for Acte 5
    hasOther: true,
  },

  // ══════════════════════════════════════════
  // PHASE 3 — VISUALISATION (Q11-Q15)
  // ══════════════════════════════════════════
  {
    id: 11,
    phase: 3,
    type: 'multi',
    intro: 'Presque fini. Cette fois on regarde vers l\'avant.',
    question: "Si tu te réveillais demain complètement libéré(e) de tes schémas, qu'est-ce qui changerait EN PREMIER ?",
    multiMax: 3,
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Je comprendrais enfin ce qui m'arrive sans analyser", scores: { '1': 2 } },
      { emoji: '😌', text: "Je pourrais m'arrêter sans angoisse", scores: { '2': 2 } },
      { emoji: '🎁', text: "Je recevrais au lieu de donner tout le temps", scores: { '3': 2 } },
      { emoji: '🙏', text: "Je demanderais de l'aide", scores: { '4': 2 } },
      { emoji: '🌊', text: "Je lâcherais le contrôle", scores: { '5': 2 } },
      { emoji: '🪞', text: "Je pourrais être moi-même avec tout le monde", scores: { '6': 2 } },
      { emoji: '😴', text: "Je dormirais en paix", scores: { '7': 2 } },
      { emoji: '☀️', text: "Je serais heureux(se) dans le présent", scores: { '8': 2 } },
      { emoji: '🚫', text: "J'oserais dire non", scores: { '9': 2 } },
      { emoji: '💖', text: "Je pourrais aimer calmement", scores: { '10': 2 } },
    ],
  },
  {
    id: 12,
    phase: 3,
    type: 'freetext',
    question: "Complète cette phrase en quelques mots : 'Ce que je veux vraiment dans la vie, c'est…'",
    maxChars: 100,
  },
  {
    id: 13,
    phase: 3,
    type: 'freetext',
    intro: 'Sois aussi précis(e) que possible.',
    question: 'Ta plus grande peur profonde, celle qui te suit depuis toujours, c\'est quoi ?',
    maxChars: 250,
  },
  {
    id: 14,
    phase: 3,
    type: 'single',
    question: "Si ton/ta meilleur(e) ami(e) devait décrire ta plus grande force en UN mot, ce serait :",
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Intelligent(e)", scores: { '1': 2 } },
      { emoji: '⚡', text: "Énergique", scores: { '2': 2 } },
      { emoji: '💝', text: "Dévoué(e)", scores: { '3': 2 } },
      { emoji: '🏔️', text: "Solide", scores: { '4': 2 } },
      { emoji: '⚖️', text: "Fiable", scores: { '5': 2 } },
      { emoji: '🦎', text: "Adaptable", scores: { '6': 2 } },
      { emoji: '👁️', text: "Lucide", scores: { '7': 2 } },
      { emoji: '🌟', text: "Visionnaire", scores: { '8': 2 } },
      { emoji: '🕊️', text: "Apaisant(e)", scores: { '9': 2 } },
      { emoji: '🔥', text: "Passionné(e)", scores: { '10': 2 } },
    ],
  },
  {
    id: 15,
    phase: 3,
    type: 'freetext',
    intro: 'Une dernière question. C\'est celle qui nous permettra de t\'offrir la page résultat la plus personnalisée possible.',
    question: "Si tu pouvais dire UNE phrase à toi-même enfant, ce serait quoi ?",
    maxChars: 200,
  },
]
