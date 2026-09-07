// ── Test « Signature Émotionnelle » — 10 questions (spec 500 abonnés) ─────────
// Source unique : le spec produit. Chaque réponse A–G pointe un protocole.
// NB : le mapping slug -> contenu réel de la plateforme (table `douleurs`) se
// fait AILLEURS, au câblage de l'accès protocole. Ici on reste sur les slugs
// du spec, référencés en un seul endroit (SLUG_BY_LETTER + PROTOCOLES).

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type Slug =
  | 'amour-propre'
  | 'dependance-affective'
  | 'confiance-en-soi'
  | 'burn-out'
  | 'traumatisme'
  | 'rupture'
  | 'deuil'

export const SLUG_BY_LETTER: Record<Letter, Slug> = {
  A: 'amour-propre',
  B: 'dependance-affective',
  C: 'confiance-en-soi',
  D: 'burn-out',
  E: 'traumatisme',
  F: 'rupture',
  G: 'deuil',
}

export type Question = {
  id: number
  prompt: string
  choices: { letter: Letter; text: string }[]
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'Ce qui pèse le plus, là, tout de suite',
    choices: [
      { letter: 'A', text: 'Je me traite mal. Je ne me respecte plus.' },
      { letter: 'B', text: 'Ma vie tourne autour de quelqu’un. J’attends. Je vérifie.' },
      { letter: 'C', text: 'Il y a une chose que je voudrais oser — et je n’ai pas le droit, je crois.' },
      { letter: 'D', text: 'Mon corps a lâché. Je tiens encore, mal. Je porte trop.' },
      { letter: 'E', text: 'Il m’est arrivé quelque chose. Mon corps s’en souvient.' },
      { letter: 'F', text: 'Une histoire est finie. L’absence est là.' },
      { letter: 'G', text: 'Quelqu’un, ou toute une vie, n’est plus là.' },
    ],
  },
  {
    id: 2,
    prompt: 'La phrase qui te traverse',
    choices: [
      { letter: 'A', text: '« Je ne suis pas assez. »' },
      { letter: 'B', text: '« S’il / si elle ne répond pas, je n’existe plus. »' },
      { letter: 'C', text: '« Je le ferai quand je serai prêt·e. »' },
      { letter: 'D', text: '« Si je ne le fais pas, personne ne le fera. »' },
      { letter: 'E', text: '« Mon corps n’est plus un endroit sûr. »' },
      { letter: 'F', text: '« Je ne sais plus qui je suis sans cette personne. »' },
      { letter: 'G', text: '« Ça n’aurait pas dû s’arrêter comme ça. »' },
    ],
  },
  {
    id: 3,
    prompt: 'Ce que tu fais malgré toi',
    choices: [
      { letter: 'A', text: 'Je me fais petit·e. Je m’excuse d’exister.' },
      { letter: 'B', text: 'Je scanne le téléphone. Je réorganise ma journée autour de l’autre.' },
      { letter: 'C', text: 'Je recule au moment d’agir. J’attends la permission.' },
      { letter: 'D', text: 'Je dis oui. Je prends. Je tiens pour tout le monde.' },
      { letter: 'E', text: 'Je me coupe du corps, ou il me surprend (sursaut, gel, absence).' },
      { letter: 'F', text: 'Je relis, je rejoue, je veux effacer — et je n’y arrive pas.' },
      { letter: 'G', text: 'Je fais comme si la vie continuait, alors qu’une part de moi est restée là-bas.' },
    ],
  },
  {
    id: 4,
    prompt: 'Ce que tu veux arrêter en premier',
    choices: [
      { letter: 'A', text: 'Cesser de me trahir pour rester acceptable.' },
      { letter: 'B', text: 'Cesser d’attendre que l’autre confirme que j’existe.' },
      { letter: 'C', text: 'Cesser d’attendre la permission pour agir.' },
      { letter: 'D', text: 'Cesser de porter ce qui n’est pas à moi.' },
      { letter: 'E', text: 'Cesser de vivre comme si mon corps ne m’appartenait plus.' },
      { letter: 'F', text: 'Cesser d’habiter une histoire finie.' },
      { letter: 'G', text: 'Cesser de faire le deuil tout seul, sans cadre.' },
    ],
  },
  {
    id: 5,
    prompt: 'Dans le corps, maintenant',
    choices: [
      { letter: 'A', text: 'Les épaules rentrées. La voix trop basse.' },
      { letter: 'B', text: 'Le creux dès que le message ne vient pas.' },
      { letter: 'C', text: 'Le blocage juste avant le geste.' },
      { letter: 'D', text: 'Le vide, ou la machine qui tourne sans moi.' },
      { letter: 'E', text: 'Figé, tremblant, ou ailleurs.' },
      { letter: 'F', text: 'Un manque physique, comme une amputation.' },
      { letter: 'G', text: 'Une absence qui pèse dans la pièce.' },
    ],
  },
  {
    id: 6,
    prompt: 'La nuit, quand tout s'arrête',
    choices: [
      { letter: 'A', text: 'Je me repasse tout ce que j'ai mal fait.' },
      { letter: 'B', text: 'Je vérifie s'il / si elle a écrit.' },
      { letter: 'C', text: 'Je me dis « demain j'oserai ». Et demain, non.' },
      { letter: 'D', text: 'Je n'arrive pas à éteindre. La liste ne finit jamais.' },
      { letter: 'E', text: 'Le noir ramène des images. Ou le corps se verrouille.' },
      { letter: 'F', text: 'Je tends la main de l'autre côté du lit. Vide.' },
      { letter: 'G', text: 'Je parle à quelqu'un qui n'est plus là.' },
    ],
  },
  {
    id: 7,
    prompt: 'Ce que les autres ne voient pas',
    choices: [
      { letter: 'A', text: 'Que je me détruis à petit feu, le sourire en place.' },
      { letter: 'B', text: 'Que sans réponse, je m'effondre en silence.' },
      { letter: 'C', text: 'Que derrière le calme, il y a une terreur de se tromper.' },
      { letter: 'D', text: 'Que je suis vide. Que je fais semblant de tenir.' },
      { letter: 'E', text: 'Que certains bruits, certains gestes, me ramènent là-bas.' },
      { letter: 'F', text: 'Que je fais semblant d'aller mieux depuis des semaines.' },
      { letter: 'G', text: 'Que je souris pour eux. Pas pour moi.' },
    ],
  },
  {
    id: 8,
    prompt: 'Si tu pouvais changer une seule chose demain matin',
    choices: [
      { letter: 'A', text: 'Me regarder sans me juger.' },
      { letter: 'B', text: 'Ne plus avoir besoin de l'autre pour me sentir vivant·e.' },
      { letter: 'C', text: 'Agir sans attendre d'être parfait·e.' },
      { letter: 'D', text: 'Poser une chose. Une seule. Et ne pas la reprendre.' },
      { letter: 'E', text: 'Habiter mon corps sans peur.' },
      { letter: 'F', text: 'Penser à cette personne sans que ça brûle.' },
      { letter: 'G', text: 'Traverser une journée entière sans cette absence.' },
    ],
  },
  {
    id: 9,
    prompt: 'Ce qui te fait le plus honte',
    choices: [
      { letter: 'A', text: 'D'avoir besoin qu'on me dise que j'ai de la valeur.' },
      { letter: 'B', text: 'D'être resté·e. D'avoir accepté. D'attendre encore.' },
      { letter: 'C', text: 'D'avoir laissé passer des occasions par peur.' },
      { letter: 'D', text: 'D'en vouloir aux gens que j'aide.' },
      { letter: 'E', text: 'De ne pas « aller mieux » alors que c'est fini.' },
      { letter: 'F', text: 'De vouloir encore quelqu'un qui m'a fait du mal.' },
      { letter: 'G', text: 'D'avoir ri un jour et de m'en être voulu.' },
    ],
  },
  {
    id: 10,
    prompt: 'Ce dont tu as besoin — pas envie, besoin',
    choices: [
      { letter: 'A', text: 'Me traiter comme je traite ceux que j'aime.' },
      { letter: 'B', text: 'Exister sans que quelqu'un le confirme.' },
      { letter: 'C', text: 'Un premier pas. Petit. Mais fait.' },
      { letter: 'D', text: 'Le droit de ne rien porter pendant une heure.' },
      { letter: 'E', text: 'Un endroit sûr. Dans mon corps. Pas dehors.' },
      { letter: 'F', text: 'Redevenir quelqu'un pour moi, pas pour deux.' },
      { letter: 'G', text: 'Un cadre pour traverser, pas une injonction à guérir.' },
    ],
  },
]

// ── Scoring (règles exactes du spec) ─────────────────────────────────────────
// Chaque réponse = 1 point sur son slug. Q1 vaut 2 points. Gagnant = max.
// Égalité : Q4 départage. Encore égalité : Q1 gagne. Jamais deux signatures.
export function scoreTest(answers: Letter[]): Slug {
  const points: Partial<Record<Slug, number>> = {}
  answers.forEach((letter, i) => {
    const slug = SLUG_BY_LETTER[letter]
    points[slug] = (points[slug] ?? 0) + (i === 0 ? 2 : 1)
  })
  const max = Math.max(...Object.values(points) as number[])
  const leaders = (Object.keys(points) as Slug[]).filter((s) => points[s] === max)
  if (leaders.length === 1) return leaders[0]
  const q4slug = SLUG_BY_LETTER[answers[3]]
  if (leaders.includes(q4slug)) return q4slug
  return SLUG_BY_LETTER[answers[0]]
}

// ── Contenu de la page résultat par slug (spec §2 + §6) ──────────────────────
export type Protocole = {
  slug: Slug
  titre: string
  signature: string
  pourquoi: string
  produit: string
  commencer: string
  safetyText?: string // mention sécurité sous l'offre (traumatisme, deuil)
}

export const PROTOCOLES: Record<Slug, Protocole> = {
  'amour-propre': {
    slug: 'amour-propre',
    titre: 'L’amour-propre',
    signature: 'Tu as passé trop de temps à croire que tu n’étais pas assez.',
    pourquoi: 'Tu t’es habitué·e à te traiter comme quelqu’un de trop. Le corps a suivi : épaules rentrées, voix trop basse, oui pour rester acceptable.',
    produit: 'Te juger avant les autres. Te cacher pour être aimable. Sortir d’une pièce en t’excusant d’y être.',
    commencer: 'Ce soir : les deux vidéos. Pas un miroir. Comprendre où tu t’es trahi·e — et le premier geste pour arrêter.',
  },
  'dependance-affective': {
    slug: 'dependance-affective',
    titre: 'La dépendance affective',
    signature: 'Ce n’est pas de l’amour. C’est un manque. Et le manque ne se soigne pas en remplissant l’autre côté.',
    pourquoi: 'Tu as confié à quelqu’un le droit de confirmer que tu existes. Quand le message ne vient pas, le trou se rouvre.',
    produit: 'Le téléphone comme boussole. Les journées réorganisées. L’attente qui se fait passer pour de l’amour.',
    commencer: 'Ce soir : les deux vidéos. Tu ne préviens pas l’autre. Ce travail ne le regarde pas.',
  },
  'confiance-en-soi': {
    slug: 'confiance-en-soi',
    titre: 'La confiance en soi',
    signature: 'La confiance ne se pense pas. Elle se prouve.',
    pourquoi: 'Tu n’attends pas d’être prêt·e. Tu attends une permission qui ne viendra pas. La chose que tu repousses ne devient pas plus facile avec le temps.',
    produit: 'Reculer au moment d’agir. Avoir les mots après. Une vie en version brouillon.',
    commencer: 'Ce soir : les deux vidéos. Ensuite un acte minuscule. La confiance se prouve. Elle ne se pense pas.',
  },
  'burn-out': {
    slug: 'burn-out',
    titre: 'Sortir du burn-out',
    signature: 'Tu n’es pas épuisé·e d’avoir trop travaillé. Tu es épuisé·e d’avoir porté ce qui n’était pas à toi.',
    pourquoi: 'Tu as appris que tenir, c’était une vertu. Ton corps a arrêté de signer.',
    produit: 'Le vide au réveil. Les oui automatiques. La machine qui tourne sans toi.',
    commencer: 'Ce soir : les deux vidéos. Pas le cahier. Comprendre ce que tu portes qui n’est pas à toi.',
  },
  'traumatisme': {
    slug: 'traumatisme',
    titre: 'Après le traumatisme',
    signature: 'Ce qui a été fait à ton corps n’a pas volé qui tu es.',
    pourquoi: 'Ça s’est logé dans le corps. La tête a compris. Le corps, lui, sursaute, gèle, ou s’absente encore.',
    produit: 'Un corps qui n’est plus un endroit sûr. Fuir le contact. Se couper pour tenir.',
    commencer: 'Ce soir : les deux vidéos. À ton rythme. Si c’est trop, tu t’arrêtes. Personne ne force.',
    safetyText: 'Ce protocole est un compagnon. Il ne remplace pas un professionnel formé au trauma. France Victimes : 116 006. Détresse aiguë : 3114.',
  },
  'rupture': {
    slug: 'rupture',
    titre: 'Après la rupture',
    signature: 'On ne se remet pas d’une rupture. On redevient quelqu’un pour soi.',
    pourquoi: 'Une partie de toi habite encore une histoire finie. Effacer ne marche pas. Le souvenir reste. Il faut apprendre à vivre avec, sans qu’il dirige.',
    produit: 'Relire. Rejouer la dernière semaine. Vérifier s’il/si elle a vu. Le vide dans les pièces qui étaient à deux.',
    commencer: 'Ce soir : les deux vidéos. On n’efface rien. On archive. On redevient quelqu’un pour soi.',
  },
  'deuil': {
    slug: 'deuil',
    titre: 'Après le deuil',
    signature: 'On ne fait pas son deuil. On le traverse.',
    pourquoi: 'Une absence s’est installée dans la pièce. Le temps tout seul ne fait pas le travail. C’est ce qu’on en fait qui traverse.',
    produit: 'Faire semblant que la vie continue. Rire et s’en vouloir. Une part de toi restée au jour où ça s’est arrêté.',
    commencer: 'Ce soir : les deux vidéos. Rien n’est obligatoire. Le protocole est un cadre, pas une obligation de « aller mieux ».',
    safetyText: 'Ce protocole est un compagnon. Il ne remplace pas un professionnel. En détresse aiguë : 3114 (24h/24).',
  },
}

export function getProtocole(slug: string): Protocole | null {
  return (PROTOCOLES as Record<string, Protocole>)[slug] ?? null
}
