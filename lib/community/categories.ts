import type { ShineIconName } from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CODE COULEUR DES PUBLICATIONS — source unique de vérité
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Les six catégories ne sont pas six couleurs arbitraires : elles occupent un
 *  seul arc chaud, de la lumière la plus haute au sang le plus profond. Lues
 *  ensemble elles forment une famille — jamais un arc-en-ciel d'application.
 *
 *  Ordre de l'arc :  Lumière → Albâtre → Or → Bronze → Rose fané → Incarnat
 *
 *  Charte respectée : aucun bleu / vert / violet décoratif, aucun faux-or
 *  (#C9A961, #A88248). Contraste vérifié ≥ 4.5:1 sur la carte (#16130D).
 */

export type PostCategory =
  | 'temoignage'
  | 'partage'
  | 'question'
  | 'remerciements'
  | 'gratitude'
  | 'citation'

export type CategoryDef = {
  value: PostCategory
  /** Libellé par défaut (le mur communautaire). */
  label: string
  /** Nom de la couleur dans la charte — sert à en parler, pas à l'afficher. */
  colorName: string
  color: string
  icon: ShineIconName
  /** Ce que le signe raconte. Sert d'infobulle et de documentation. */
  meaning: string
}

export const POST_CATEGORIES: CategoryDef[] = [
  {
    value: 'gratitude',
    label: 'Gratitude',
    colorName: 'Lumière',
    color: '#F5DE9B',
    icon: 'gratitude',
    meaning: 'Le grand éclat, ce qui rayonne sans rien demander',
  },
  {
    value: 'partage',
    label: "Partage d'expériences",
    colorName: 'Albâtre',
    color: '#E3D5BE',
    icon: 'partage',
    meaning: "Le passage, ce que l'un traverse, l'autre le reçoit",
  },
  {
    value: 'temoignage',
    label: 'Témoignage',
    colorName: 'Or',
    color: '#C9A961',
    icon: 'temoignage',
    meaning: 'La voix, une parole qui porte au-delà de soi',
  },
  {
    value: 'question',
    label: 'Question',
    colorName: 'Bronze',
    color: '#A88248',
    icon: 'question',
    meaning: "La facette ouverte, ce qui n'est pas encore refermé",
  },
  {
    value: 'remerciements',
    label: 'Remerciements',
    colorName: 'Rose fané',
    color: '#C78790',
    icon: 'remerciements',
    meaning: 'Ce qui revient, on reçoit ce qu\'on a donné',
  },
  {
    value: 'citation',
    label: 'Citation',
    colorName: 'Incarnat',
    color: '#D2536A',
    icon: 'citation',
    meaning: 'La parole gardée, les mots d\'un autre, tenus comme une pierre',
  },
]

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  FUSIONS — deux sujets qui disaient la même chose
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  « Remerciements » et « Gratitude » se chevauchaient : au moment d'écrire on
 *  hésitait entre les deux, et le mur finissait avec deux tas de la même chose.
 *  « Gratitude » absorbe l'autre : c'est le mot le plus large et le plus chaud.
 *
 *  On ne touche pas à la base. La valeur `remerciements` reste reconnue — les
 *  publications déjà écrites gardent la leur — mais elle s'affiche et se filtre
 *  sous « Gratitude ». Rien ne disparaît du mur, tout se retrouve au même endroit.
 *
 *  Le journal personnel (« Mon éclat ») n'est pas concerné : `remerciements` y
 *  porte le libellé « Moment de joie », qui n'est pas la même chose, et il lit
 *  POST_CATEGORIES directement.
 */
const FUSIONS: Partial<Record<PostCategory, PostCategory>> = {
  remerciements: 'gratitude',
}

/** Les sujets proposés au moment d'écrire et de filtrer sur le mur. */
export const CATEGORIES_MUR: CategoryDef[] = POST_CATEGORIES.filter(c => !FUSIONS[c.value])

/**
 * Toutes les valeurs qu'un filtre doit interroger pour un sujet du mur :
 * choisir « Gratitude » doit aussi ramener les anciens « Remerciements ».
 */
export function valeursCategorie(value: PostCategory): PostCategory[] {
  const absorbees = (Object.keys(FUSIONS) as PostCategory[]).filter(k => FUSIONS[k] === value)
  return [value, ...absorbees]
}

const BY_VALUE = new Map(POST_CATEGORIES.map(c => [c.value, c]))

/**
 * Le sujet à afficher pour une publication du mur, fusions appliquées.
 * Repli sur « Partage » : c'est la catégorie la plus neutre du jeu.
 */
export function getCategory(value: string | null | undefined): CategoryDef {
  const brut = (value || '') as PostCategory
  const apresFusion = FUSIONS[brut] || brut
  return BY_VALUE.get(apresFusion) || BY_VALUE.get('partage')!
}

/** Types de contenu d'une publication (texte / image / vidéo / audio). */
export const MEDIA_TYPES: { value: 'text' | 'image' | 'video' | 'audio'; label: string; icon: ShineIconName }[] = [
  { value: 'text', label: 'Texte', icon: 'texte' },
  { value: 'image', label: 'Image', icon: 'image' },
  { value: 'video', label: 'Vidéo', icon: 'video' },
  { value: 'audio', label: 'Audio', icon: 'audio' },
]

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROPOSITION N°2 — « Les Souffles », palette Incarnat (chair → sang → or mat)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Non branchée dans l'application : elle attend le choix de Julia et Thomas.
 *  Pour basculer, il suffira de remplacer POST_CATEGORIES par SOUFFLE_CATEGORIES
 *  et ShineIcon par SouffleIcon — la forme des données est identique.
 *  Contraste vérifié ≥ 4.5:1 sur la carte (#16130D) pour les six.
 */
export const SOUFFLE_CATEGORIES: CategoryDef[] = [
  { value: 'gratitude', label: 'Gratitude', colorName: 'Albâtre', color: '#E8DCCB', icon: 'gratitude', meaning: "L'expiration qui se répand, une graine, trois souffles" },
  { value: 'partage', label: "Partage d'expériences", colorName: 'Rose poudré', color: '#E0A9A4', icon: 'partage', meaning: 'Deux souffles qui se frôlent, et ce qui passe entre eux' },
  { value: 'temoignage', label: 'Témoignage', colorName: 'Or mat', color: '#B08A4A', icon: 'temoignage', meaning: "La voix qui se déploie, un point, puis tout s'ouvre" },
  { value: 'question', label: 'Question', colorName: 'Vieux rose', color: '#C2687E', icon: 'question', meaning: "Le souffle qui s'enroule et s'arrête" },
  { value: 'remerciements', label: 'Remerciements', colorName: 'Braise', color: '#C8785E', icon: 'remerciements', meaning: 'La paume ouverte, on remercie en recevant' },
  { value: 'citation', label: 'Citation', colorName: 'Incarnat', color: '#D2536A', icon: 'citation', meaning: "La parole d'un autre, deux virgules, un vide au milieu" },
]
