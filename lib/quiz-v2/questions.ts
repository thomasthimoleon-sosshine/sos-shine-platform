/**
 * SOS Shine — Quiz V2 Questions
 * 15 questions across 3 phases, closed answers only
 */

export type QuestionType =
  | 'single'
  | 'multi'
  | 'slider'
  | 'freetext'
  | 'freetext_suggestions'

export type Choice = {
  emoji: string
  text: string
  shortText?: string
  scores: Record<string, number>
}

export type Question = {
  id: number
  phase: 1 | 2 | 3
  type: QuestionType
  intro?: string
  question: string
  shortQuestion?: string
  microReveal?: (string | undefined)[]
  choices?: Choice[]
  multiMax?: number
  sliderLabels?: { left: string; right: string }
  sliderScoring?: (value: number) => Record<string, number>
  suggestions?: string[]
  maxChars?: number
  hasOther?: boolean
}

export const QUESTIONS: Question[] = [
  // ══════════════════════════════════════════
  // PHASE 1 — DIAGNOSTIC (Q1-Q5)
  // ══════════════════════════════════════════
  {
    id: 1,
    phase: 1,
    type: 'single',
    intro: 'Pas de bonne ou mauvaise réponse. La première qui te touche est toujours la bonne.',
    question: 'Quand tu souffres sans pouvoir le dire, qu\'est-ce que tu fais ?',
    hasOther: false,
    microReveal: [
      'Comprendre pour ne pas se laisser submerger.',
      'Tenir debout coûte que coûte.',
      'Les émotions dépassent ce que les mots peuvent contenir.',
      'Être seul(e) pour ne pas avoir à expliquer.',
      'Bouger pour ne pas sentir.',
    ],
    choices: [
      { emoji: '🧠', text: 'J\'analyse — comprendre aide à tenir', scores: { '1': 3, '5': 1, '7': 1 } },
      { emoji: '🎭', text: 'Je fais comme si tout allait bien', scores: { '4': 3, '6': 2 } },
      { emoji: '🌊', text: 'Je m\'effondre — les émotions débordent', scores: { '10': 2, '3': 1, '8': 1 } },
      { emoji: '🚪', text: 'Je m\'isole pour gérer seul(e)', scores: { '4': 3, '7': 1 } },
      { emoji: '⚡', text: 'Je me jette dans l\'action', scores: { '2': 3, '5': 1 } },
    ],
  },
  {
    id: 2,
    phase: 1,
    type: 'single',
    question: 'Ce qui t\'épuise le plus en ce moment ?',
    hasOther: false,
    microReveal: [
      'La tension permanente que personne ne voit.',
      'Cet état d\'alerte qui ne s\'éteint jamais.',
      'Le besoin de tout maîtriser pour se sentir en sécurité.',
      'Le poids de ne rien pouvoir déléguer.',
      'Cette impression que rien ne bougera.',
    ],
    choices: [
      { emoji: '⚡', text: 'Gérer les tensions et les conflits autour de moi', scores: { '9': 2, '6': 1 } },
      { emoji: '👁', text: 'Toujours anticiper — être en alerte permanente', scores: { '7': 3, '1': 2 } },
      { emoji: '🔄', text: 'Ne pas contrôler ce qui se passe autour de moi', scores: { '5': 2, '9': 1 } },
      { emoji: '🏋️', text: 'Tout porter seul(e) sans pouvoir demander de l\'aide', scores: { '4': 2, '2': 1 } },
      { emoji: '😶', text: 'Avoir l\'impression que rien ne changera jamais', scores: { '7': 3, '10': 1, '8': 1 } },
    ],
  },
  {
    id: 3,
    phase: 1,
    type: 'multi',
    question: 'Comment tu te retrouves souvent dans tes relations ?',
    multiMax: 2,
    hasOther: false,
    choices: [
      { emoji: '🚪', text: 'À fuir quand c\'est trop intense', scores: { '2': 2, '10': 1 } },
      { emoji: '🙏', text: 'À éviter les conflits même si j\'ai raison', scores: { '4': 2, '9': 1 } },
      { emoji: '🔍', text: 'À analyser les autres pour les comprendre vraiment', scores: { '1': 3, '7': 1 } },
      { emoji: '🌪', text: 'À m\'occuper constamment pour ne pas penser', scores: { '2': 3 } },
      { emoji: '💫', text: 'À ressentir les émotions des autres comme les miennes', scores: { '10': 2, '3': 1 } },
      { emoji: '🔥', text: 'À réagir fort sur le moment, puis à regretter', scores: { '10': 2, '2': 1 } },
      { emoji: '🌿', text: 'À m\'adapter au point de me perdre moi-même', scores: { '6': 3, '4': 1 } },
    ],
  },
  {
    id: 4,
    phase: 1,
    type: 'single',
    question: 'Tu es en conflit avec quelqu\'un. Comment tu gères ?',
    hasOther: false,
    microReveal: [
      'La paix avant tout — même au prix de toi-même.',
      'La logique comme bouclier contre la douleur.',
      'L\'intensité prend le dessus avant que tu puisses l\'arrêter.',
      'Disparaître vaut mieux qu\'affronter.',
      'Prendre soin de l\'autre même quand c\'est toi qui saignes.',
    ],
    choices: [
      { emoji: '🕊', text: 'Je cède pour que ça s\'arrête', scores: { '6': 3, '4': 2 } },
      { emoji: '🧩', text: 'Je cherche la solution logique qui arrange tout le monde', scores: { '6': 2, '7': 1, '5': 1 } },
      { emoji: '💥', text: 'Je réagis fort sur le moment, puis je regrette', scores: { '10': 1, '8': 1 } },
      { emoji: '💨', text: 'Je disparais — mentalement ou physiquement', scores: { '6': 3, '9': 1 } },
      { emoji: '🫶', text: 'Je prends soin de l\'autre même si c\'est moi qui suis blessé(e)', scores: { '3': 3, '9': 1 } },
    ],
  },
  {
    id: 5,
    phase: 1,
    type: 'multi',
    question: 'Qu\'est-ce qui déclenche ton stress ?',
    multiMax: 2,
    hasOther: false,
    choices: [
      { emoji: '💔', text: 'Sentir que quelqu\'un est déçu de moi', scores: { '3': 2, '9': 1 } },
      { emoji: '⚡', text: 'Les conflits et les tensions autour de moi', scores: { '9': 2, '6': 2 } },
      { emoji: '❓', text: 'L\'incertitude — ne pas savoir ce qui va se passer', scores: { '7': 3, '1': 1 } },
      { emoji: '🚫', text: 'Devoir dire non ou décevoir les autres', scores: { '3': 3, '6': 1 } },
      { emoji: '🌀', text: 'Perdre le contrôle d\'une situation', scores: { '5': 3, '1': 1 } },
      { emoji: '👁', text: 'Être jugé(e) ou critiqué(e)', scores: { '6': 3, '9': 1 } },
    ],
  },

  // ══════════════════════════════════════════
  // PHASE 2 — RECONNAISSANCE (Q6-Q10)
  // ══════════════════════════════════════════
  {
    id: 6,
    phase: 2,
    type: 'single',
    intro: 'On continue. Prends le temps de ressentir avant de répondre.',
    question: 'Ce qui te pèse le plus ?',
    hasOther: false,
    microReveal: [
      'Cette solitude-là est la plus épuisante.',
      'Le corps ne ment pas.',
      'L\'écart entre qui tu es et qui tu pourrais être.',
      'L\'analyse sans fin qui remplace la confiance.',
      'S\'effacer pour appartenir.',
    ],
    choices: [
      { emoji: '🫧', text: 'Me sentir seul(e) même quand je suis entouré(e)', scores: { '10': 2, '9': 1 } },
      { emoji: '🔋', text: 'Ne jamais vraiment me détendre — toujours en tension', scores: { '1': 2, '5': 2, '7': 1 } },
      { emoji: '🌑', text: 'Ne pas être à la hauteur de ce que je pourrais être', scores: { '8': 3, '10': 1 } },
      { emoji: '⚖️', text: 'Ne jamais savoir si je fais les bons choix', scores: { '7': 2, '1': 2 } },
      { emoji: '🌊', text: 'Devoir toujours m\'adapter aux attentes des autres', scores: { '6': 2, '4': 2 } },
    ],
  },
  {
    id: 7,
    phase: 2,
    type: 'single',
    question: 'Ce qui t\'empêche d\'avancer ?',
    hasOther: false,
    microReveal: [
      'La peur de l\'imperfection paralyse avant même de commencer.',
      'Demander de l\'aide c\'est admettre une limite.',
      'L\'action comme fuite de soi-même.',
      'Ressentir trop fort pour pouvoir bouger.',
      'Une peur si ancienne qu\'elle n\'a plus de nom.',
      'Vivre pour le regard des autres.',
    ],
    choices: [
      { emoji: '🫀', text: 'La peur de mal faire — je préfère ne pas commencer', scores: { '1': 2, '5': 2, '9': 1 } },
      { emoji: '🏔', text: 'La conviction que je dois y arriver seul(e)', scores: { '4': 3, '9': 1 } },
      { emoji: '🌪', text: 'Je m\'épuise en action pour ne pas avoir à ressentir', scores: { '2': 3, '4': 1 } },
      { emoji: '❄️', text: 'L\'intensité de ce que je ressens me paralyse', scores: { '10': 2, '5': 1 } },
      { emoji: '👁', text: 'Une peur sous-jacente que je ne sais pas nommer', scores: { '10': 3, '7': 1 } },
      { emoji: '🪞', text: 'Le regard et le jugement des autres', scores: { '6': 3, '9': 2 } },
    ],
  },
  {
    id: 8,
    phase: 2,
    type: 'single',
    question: 'Quand tout s\'effondre, tu…',
    hasOther: false,
    microReveal: [
      'La vulnérabilité comme danger — l\'isolation comme protection.',
      'Comprendre pour ne pas être submergé(e).',
      'Le pire comme seul scénario possible.',
      'Reprendre la main coûte que coûte.',
      'Les émotions prennent tout — il ne reste plus rien d\'autre.',
      'Tenir la façade pour que personne ne voie.',
    ],
    choices: [
      { emoji: '🚪', text: 'Tu t\'isoles et tu gères seul(e) — montrer ta faiblesse est hors de question', scores: { '4': 2, '7': 2 } },
      { emoji: '🔍', text: 'Tu analyses tout pour comprendre — comme si comprendre pouvait arrêter la douleur', scores: { '7': 3, '1': 1, '8': 1 } },
      { emoji: '🌩', text: 'Tu imagines le pire — ta tête part dans tous les scénarios catastrophiques', scores: { '8': 2, '7': 1, '10': 1 } },
      { emoji: '⚙️', text: 'Tu reprends le contrôle — listes, action, organisation', scores: { '4': 3, '5': 1 } },
      { emoji: '🌊', text: 'Tu lâches tout — les émotions te submergent complètement', scores: { '10': 3, '8': 1 } },
      { emoji: '🎭', text: 'Tu fais comme si rien n\'était — tu souris pour les autres', scores: { '6': 2, '4': 2 } },
    ],
  },
  {
    id: 9,
    phase: 2,
    type: 'single',
    question: 'Qu\'est-ce qui te fait te sentir vivant(e) ?',
    hasOther: false,
    microReveal: [
      'La vérité comme seul ancrage.',
      'Être utile comme raison d\'exister.',
      'La maîtrise comme seule sécurité.',
      'Exister dans le regard des autres.',
      'L\'autonomie comme fierté profonde.',
      'L\'intensité comme preuve d\'être en vie.',
    ],
    choices: [
      { emoji: '✨', text: 'Comprendre quelque chose en profondeur — une vérité qui clique', scores: { '1': 3, '7': 2 } },
      { emoji: '🌱', text: 'Être vraiment utile pour quelqu\'un', scores: { '3': 2, '4': 2 } },
      { emoji: '🗺️', text: 'Avoir tout planifié et maîtrisé', scores: { '7': 2, '8': 2 } },
      { emoji: '🌸', text: 'Être reconnu(e) et apprécié(e) pour ce que je fais', scores: { '6': 3, '4': 1 } },
      { emoji: '🏆', text: 'Réussir quelque chose par mes propres moyens', scores: { '4': 3, '5': 1 } },
      { emoji: '🔥', text: 'Les moments d\'intensité — quand je me sens pleinement présent(e)', scores: { '8': 2, '10': 2 } },
    ],
  },
  {
    id: 10,
    phase: 2,
    type: 'single',
    question: 'Ce que tu évites le plus ?',
    hasOther: false,
    microReveal: [
      'Le contrôle comme seul rempart contre le chaos.',
      'La déception des autres comme blessure insupportable.',
      'L\'incompréhension comme menace existentielle.',
      'La faiblesse comme honte profonde.',
      'L\'immobilité comme mort lente.',
      'Ne pas être à la hauteur de la version idéale.',
    ],
    choices: [
      { emoji: '🌀', text: 'Perdre le contrôle de toi-même ou d\'une situation', scores: { '5': 3, '1': 1 } },
      { emoji: '💔', text: 'Décevoir les personnes que tu aimes', scores: { '3': 3, '6': 1 } },
      { emoji: '🌫', text: 'Ne pas comprendre ce qui se passe vraiment', scores: { '1': 3, '7': 1 } },
      { emoji: '🛡', text: 'Paraître faible ou dans le besoin aux yeux des autres', scores: { '6': 2, '4': 2 } },
      { emoji: '⚡', text: 'Rester immobile — tu préfères l\'action même inutile', scores: { '2': 2, '5': 2 } },
      { emoji: '🪞', text: 'Ne pas être à la hauteur de l\'image que les autres ont de toi', scores: { '6': 3, '8': 1 } },
    ],
  },

  // ══════════════════════════════════════════
  // PHASE 3 — INTÉGRATION (Q11-Q15)
  // ══════════════════════════════════════════
  {
    id: 11,
    phase: 3,
    type: 'single',
    intro: 'Dernière ligne droite. Ces réponses sont les plus importantes.',
    question: 'Comment tu vis tes émotions ?',
    hasOther: false,
    microReveal: [
      'Les garder pour soi comme seule façon de survivre.',
      'La tête qui prend le relais avant que le cœur ait le droit de parler.',
      'L\'action comme seule sortie acceptable.',
      'S\'effacer pour ne pas déranger.',
      'La maîtrise comme identité.',
      'Tout ou rien — jamais dans l\'entre-deux.',
    ],
    choices: [
      { emoji: '🔒', text: 'Je les garde pour moi — les exprimer me rend vulnérable', scores: { '9': 2, '7': 1 } },
      { emoji: '🧠', text: 'J\'analyse avant de ressentir — ma tête passe avant mon cœur', scores: { '7': 2, '8': 1 } },
      { emoji: '⚡', text: 'Je les transforme en énergie — je bouge, j\'agis, je fais', scores: { '2': 1, '4': 1, '5': 1 } },
      { emoji: '🫶', text: 'Les émotions des autres passent avant les miennes', scores: { '6': 2, '7': 1 } },
      { emoji: '🎯', text: 'Je les contrôle — montrer ses émotions c\'est perdre le contrôle', scores: { '1': 1, '5': 2 } },
      { emoji: '🌋', text: 'Tout ou rien — jamais dans la nuance', scores: { '8': 3, '10': 1 } },
    ],
  },
  {
    id: 12,
    phase: 3,
    type: 'single',
    question: 'Ce que tu attends des autres ?',
    hasOther: false,
    microReveal: [
      'L\'espace comme seul luxe réel.',
      'Ne pas être une charge pour les autres.',
      'L\'harmonie comme condition de survie.',
      'L\'autonomie comme droit fondamental.',
      'Être vu(e) vraiment — pas le masque.',
      'La présence dans les moments qui comptent.',
    ],
    choices: [
      { emoji: '🛡', text: 'Qu\'ils respectent mon espace et mes limites', scores: { '5': 3, '4': 1 } },
      { emoji: '🤲', text: 'Qu\'ils n\'attendent pas trop de moi', scores: { '6': 2, '9': 2 } },
      { emoji: '🕊', text: 'Qu\'il n\'y ait pas de conflits ni de tensions', scores: { '9': 3, '2': 1 } },
      { emoji: '🗝', text: 'Qu\'ils me laissent gérer à ma façon', scores: { '4': 3, '5': 1 } },
      { emoji: '🌟', text: 'Qu\'ils me voient tel(le) que je suis vraiment', scores: { '8': 2, '9': 1 } },
      { emoji: '🫶', text: 'Qu\'ils soient là dans les moments qui comptent vraiment', scores: { '10': 2, '3': 1, '4': 1 } },
    ],
  },
  {
    id: 13,
    phase: 3,
    type: 'single',
    question: 'Comment tu prends tes décisions ?',
    hasOther: false,
    microReveal: [
      'La certitude avant l\'action.',
      'L\'instinct même quand ça dérange.',
      'Éviter de froisser quelqu\'un.',
      'Anticiper chaque risque avant de se lancer.',
      'Seul(e) — les avis compliquent.',
      'La perfection comme seule option acceptable.',
    ],
    choices: [
      { emoji: '⏳', text: 'J\'attends d\'être sûr(e) — décider trop vite m\'angoisse', scores: { '4': 2, '6': 2 } },
      { emoji: '⚡', text: 'Je décide vite et fort même si ça choque', scores: { '4': 2, '6': 1, '10': 1 } },
      { emoji: '🌐', text: 'Je consulte tout le monde pour ne froisser personne', scores: { '9': 2, '6': 2 } },
      { emoji: '🔭', text: 'J\'anticipe tous les risques possibles avant de me lancer', scores: { '4': 2, '6': 1, '7': 1 } },
      { emoji: '🔑', text: 'Je décide seul(e) — les avis des autres me compliquent', scores: { '4': 2, '6': 2 } },
      { emoji: '🔬', text: 'J\'analyse longtemps pour trouver la solution parfaite', scores: { '6': 2, '1': 1, '5': 1 } },
    ],
  },
  {
    id: 14,
    phase: 3,
    type: 'single',
    question: 'Ce que tu gardes pour toi ?',
    hasOther: false,
    microReveal: [
      'Les rêves trop grands pour être dits.',
      'La peur comme secret le plus gardé.',
      'Les vraies opinions comme danger.',
      'Les blessures qu\'on ne rouvre pas.',
      'L\'intensité que personne ne pourrait comprendre.',
      'Le poids de porter les autres sans jamais le dire.',
    ],
    choices: [
      { emoji: '🌙', text: 'Tes rêves les plus fous — trop grands pour les partager', scores: { '8': 1 } },
      { emoji: '🌑', text: 'Tes peurs les plus profondes', scores: { '8': 2, '7': 1 } },
      { emoji: '🗝', text: 'Tes vraies opinions — tu les gardes pour éviter les conflits', scores: { '6': 2, '1': 1 } },
      { emoji: '💊', text: 'Tes blessures passées — tu préfères ne pas les rouvrir', scores: { '8': 2, '10': 1 } },
      { emoji: '🌊', text: 'L\'intensité de ce que tu ressens — personne ne comprendrait', scores: { '10': 2, '8': 1 } },
      { emoji: '🏋️', text: 'À quel point tu portes les autres — tu n\'en parles jamais', scores: { '10': 2, '4': 1, '3': 1 } },
    ],
  },
  {
    id: 15,
    phase: 3,
    type: 'single',
    question: 'Ce qui te ressemble le plus ?',
    hasOther: false,
    microReveal: [
      'La vérité comme seul horizon.',
      'Toujours prêt(e) — jamais vraiment en sécurité.',
      'Donner comme façon d\'exister.',
      'Maîtriser pour ne pas avoir peur.',
      'S\'adapter comme seule façon de rester.',
      'Ressentir fort — c\'est la façon d\'être vivant(e).',
    ],
    choices: [
      { emoji: '🔍', text: 'Comprendre les choses en profondeur — la vérité avant tout', scores: { '1': 3 } },
      { emoji: '🛡', text: 'Être toujours prêt(e) — anticiper pour ne jamais être pris(e) au dépourvu', scores: { '7': 2, '8': 2 } },
      { emoji: '🌸', text: 'Prendre soin des autres — même quand tu oublies de prendre soin de toi', scores: { '3': 3, '4': 1 } },
      { emoji: '⚙️', text: 'Maîtriser ta vie — chaque détail, chaque plan', scores: { '5': 3, '1': 1 } },
      { emoji: '🌊', text: 'T\'adapter à tout et à tous — être ce dont les autres ont besoin', scores: { '6': 3, '4': 1 } },
      { emoji: '⚡', text: 'Ressentir fort — les hauts très hauts, les bas très bas', scores: { '7': 3, '8': 1 } },
    ],
  },
]
