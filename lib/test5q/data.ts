// ── Test « Signature Émotionnelle » — 5 questions (spec 500 abonnés) ──────────
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
  safety?: boolean // mentions 3114 / 116 006 (traumatisme, deuil)
}

export const PROTOCOLES: Record<Slug, Protocole> = {
  'amour-propre': {
    slug: 'amour-propre',
    titre: 'L’amour-propre',
    signature: 'Tu as passé trop de temps à croire que tu n’étais pas assez.',
    pourquoi: 'Ce n’est pas « aie plus confiance ». C’est que tu t’es habitué·e à te traiter comme quelqu’un de trop.',
    produit: 'Te faire petit·e. T’excuser. Dire oui pour rester acceptable.',
    commencer: 'Étape 1 du protocole L’amour-propre : les deux vidéos. Ensuite le cahier de 21 jours.',
  },
  'dependance-affective': {
    slug: 'dependance-affective',
    titre: 'La dépendance affective',
    signature: 'Ce n’est pas de l’amour. C’est un manque. Et le manque ne se soigne pas en remplissant l’autre côté.',
    pourquoi: 'Ce n’est pas aimer fort. C’est un manque. Le manque ne se soigne pas en remplissant l’autre côté.',
    produit: 'Vérifier. Attendre. Réorganiser tes journées autour d’un téléphone.',
    commencer: 'Étape 1 du protocole La dépendance affective. Tu ne préviens pas l’autre que tu fais ce travail.',
  },
  'confiance-en-soi': {
    slug: 'confiance-en-soi',
    titre: 'La confiance en soi',
    signature: 'La confiance ne se pense pas. Elle se prouve.',
    pourquoi: 'Tu n’attends pas d’être prêt·e. Tu attends la permission. Elle ne viendra pas.',
    produit: 'Reculer au moment d’agir. Repousser la chose que tu sais devoir faire.',
    commencer: 'Étape 1 du protocole La confiance en soi. La confiance se prouve, elle ne se pense pas.',
  },
  'burn-out': {
    slug: 'burn-out',
    titre: 'Sortir du burn-out',
    signature: 'Tu n’es pas épuisé·e d’avoir trop travaillé. Tu es épuisé·e d’avoir porté ce qui n’était pas à toi.',
    pourquoi: 'Ce n’est pas trop de travail. C’est trop de travail qui ne t’appartient pas.',
    produit: 'Dire oui. Porter. Tenir pour tout le monde. Le corps qui lâche.',
    commencer: 'Étape 1 de Sortir du burn-out. D’abord comprendre, ensuite rendre ce qui n’est pas à toi.',
  },
  'traumatisme': {
    slug: 'traumatisme',
    titre: 'Après le traumatisme',
    signature: 'Ce qui a été fait à ton corps n’a pas volé qui tu es.',
    pourquoi: 'Ce qui a été fait à ton corps n’a pas volé qui tu es. Le trauma s’est logé là. C’est là qu’on travaille.',
    produit: 'Sursaut, gel, absence. Un corps qui n’est plus un endroit sûr.',
    commencer: 'Étape 1 de Après le traumatisme. Rien n’est obligatoire. Ce cahier n’est pas un thérapeute.',
    safety: true,
  },
  'rupture': {
    slug: 'rupture',
    titre: 'Après la rupture',
    signature: 'On ne se remet pas d’une rupture. On redevient quelqu’un pour soi.',
    pourquoi: 'On ne se remet pas d’une rupture. On redevient quelqu’un pour soi.',
    produit: 'Relire. Rejouer. Vouloir effacer. Habiter une histoire finie.',
    commencer: 'Étape 1 de Après la rupture. On n’efface pas. On archive. On ne prévient pas l’autre.',
  },
  'deuil': {
    slug: 'deuil',
    titre: 'Après le deuil',
    signature: 'On ne fait pas son deuil. On le traverse.',
    pourquoi: 'On ne fait pas son deuil. On le traverse. Et on ressort autre.',
    produit: 'Faire semblant que la vie continue. Une absence qui pèse dans la pièce.',
    commencer: 'Étape 1 de Après le deuil. Le cahier est un compagnon, pas une alternative à un suivi.',
    safety: true,
  },
}

export function getProtocole(slug: string): Protocole | null {
  return (PROTOCOLES as Record<string, Protocole>)[slug] ?? null
}
