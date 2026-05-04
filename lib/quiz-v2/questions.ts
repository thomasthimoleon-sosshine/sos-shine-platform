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
    intro: 'On creuse. Les prochaines questions vont révéler le cœur du problème.',
    question: "Complète cette phrase honnêtement — même si la réponse te surprend : 'Au fond, je me sens vraiment moi-même quand…'",
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "…j'ai compris ce qui se passe — l'analyse me rassure", scores: { '1': 3 } },
      { emoji: '⚡', text: "…je suis en mouvement — m'arrêter me rendrait trop visible à moi-même", scores: { '2': 3 } },
      { emoji: '💝', text: "…les gens que j'aime vont bien — leur bonheur est ma boussole", scores: { '3': 3 } },
      { emoji: '🏔️', text: "…je suis seul(e) — c'est le seul endroit où je n'ai pas à me gérer", scores: { '4': 3 } },
      { emoji: '⚖️', text: "…tout est à sa place — le désordre m'est physiquement insupportable", scores: { '5': 3 } },
      { emoji: '🦎', text: "…je sens que je plais, que je connecte — sinon je ne sais pas vraiment qui je suis", scores: { '6': 3 } },
      { emoji: '👁️', text: "…je suis en sécurité — quand le danger est absent, je peux enfin exister", scores: { '7': 3 } },
      { emoji: '🌟', text: "…je rêve à mieux — la réalité me suffit rarement", scores: { '8': 3 } },
      { emoji: '🕊️', text: "…il n'y a pas de conflit — la paix est ma condition de survie", scores: { '9': 3 } },
      { emoji: '🔥', text: "…l'intensité est là — le calme plat me donne l'impression de ne pas vivre", scores: { '10': 3 } },
    ],
  },
  {
    id: 7,
    phase: 2,
    type: 'multi',
    intro: 'Sois honnête — même si ta réaction n\'est pas celle que tu voudrais avoir.',
    question: "Quand quelqu'un pleure devant toi, ce qui te traverse vraiment (même si tu ne le montres pas) :",
    hasOther: true,
    choices: [
      { emoji: '🔍', text: "Je cherche à comprendre pourquoi — pour trouver une solution, pas juste ressentir avec eux", scores: { '1': 2 } },
      { emoji: '🏃', text: "Je propose de faire quelque chose — rester assis dans l'émotion me met mal à l'aise", scores: { '2': 2 } },
      { emoji: '🤲', text: "Je prends tout en charge — leur douleur devient ma responsabilité", scores: { '3': 3 } },
      { emoji: '😰', text: "Je me fige — leurs larmes réveillent quelque chose en moi que je n'arrive pas à nommer", scores: { '4': 2, '7': 1 } },
      { emoji: '✨', text: "Je ramène vers le positif — les voir se noyer dans la douleur m'est insupportable", scores: { '8': 2 } },
      { emoji: '😢', text: "Je pleure avec eux — leurs émotions entrent en moi comme si c'étaient les miennes", scores: { '10': 2 } },
      { emoji: '🧊', text: "Je me fige complètement — le silence m'envahit et je ne sais plus quoi faire de moi", scores: { '4': 2, '7': 1 } },
      { emoji: '💭', text: "Je pense à mes propres émotions que j'ai rangées quelque part sans les regarder", scores: { '1': 2 } },
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
    intro: 'On arrive à la fin. Cette fois on regarde vers qui tu veux vraiment être.',
    question: "Si tu te réveillais demain sans ces schémas — vraiment libéré(e) — la PREMIÈRE chose qui changerait :",
    multiMax: 3,
    hasOther: true,
    choices: [
      { emoji: '🧠', text: "Je pourrais ressentir sans avoir besoin de tout analyser d'abord", scores: { '1': 2 } },
      { emoji: '😌', text: "Je pourrais m'arrêter et ne rien faire — sans cette anxiété au fond", scores: { '2': 2 } },
      { emoji: '🎁', text: "Je recevrais sans culpabiliser — au lieu de toujours donner", scores: { '3': 2 } },
      { emoji: '🙏', text: "Je demanderais de l'aide sans avoir honte de ne pas y arriver seul(e)", scores: { '4': 2 } },
      { emoji: '🌊', text: "Je lâcherais le contrôle — et ça ne me terrifierait plus", scores: { '5': 2 } },
      { emoji: '🪞', text: "Je serais la même personne partout — sans adapter ma version selon qui est en face", scores: { '6': 2 } },
      { emoji: '😴', text: "Je dormirais sans rejouer les scènes de la journée dans ma tête", scores: { '7': 2 } },
      { emoji: '☀️', text: "Je serais capable d'être heureux(se) maintenant — pas juste 'quand ça ira mieux'", scores: { '8': 2 } },
      { emoji: '🚫', text: "Je dirais non sans avoir à m'en justifier pendant des heures après", scores: { '9': 2 } },
      { emoji: '💖', text: "Je pourrais aimer sans avoir peur que ça me détruise", scores: { '10': 2 } },
    ],
  },
  {
    id: 12,
    phase: 3,
    type: 'freetext',
    question: "Complète cette phrase — pas la réponse sage, la vraie : 'Ce que je veux vraiment dans la vie, c'est…'",
    maxChars: 100,
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
    question: "Si la personne qui te connaît le mieux devait décrire ta plus grande force — pas celle que tu voudrais qu'elle voie, celle qu'elle voit vraiment — ce serait :",
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
    intro: 'Dernière question. Celle-ci est personnelle. Prends le temps qu\'il te faut.',
    question: "Si tu pouvais dire une seule phrase à toi-même enfant — à celui ou celle qui a construit tous ces schémas pour survivre — ce serait quoi ?",
    maxChars: 200,
  },
]
