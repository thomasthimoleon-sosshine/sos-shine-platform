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
 *  (#D4AF37, #B8960F). Contraste vérifié ≥ 4.5:1 sur la carte (#16130D).
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
    meaning: 'Le grand éclat — ce qui rayonne sans rien demander',
  },
  {
    value: 'partage',
    label: "Partage d'expériences",
    colorName: 'Albâtre',
    color: '#E3D5BE',
    icon: 'partage',
    meaning: "Le passage — ce que l'un traverse, l'autre le reçoit",
  },
  {
    value: 'temoignage',
    label: 'Témoignage',
    colorName: 'Or',
    color: '#C9A961',
    icon: 'temoignage',
    meaning: 'La voix — une parole qui porte au-delà de soi',
  },
  {
    value: 'question',
    label: 'Question',
    colorName: 'Bronze',
    color: '#A88248',
    icon: 'question',
    meaning: "La facette ouverte — ce qui n'est pas encore refermé",
  },
  {
    value: 'remerciements',
    label: 'Remerciements',
    colorName: 'Rose fané',
    color: '#C78790',
    icon: 'remerciements',
    meaning: 'Ce qui revient — on reçoit ce qu\'on a donné',
  },
  {
    value: 'citation',
    label: 'Citation',
    colorName: 'Incarnat',
    color: '#D2536A',
    icon: 'citation',
    meaning: 'La parole gardée — les mots d\'un autre, tenus comme une pierre',
  },
]

const BY_VALUE = new Map(POST_CATEGORIES.map(c => [c.value, c]))

/** Repli sur « Partage » : c'est la catégorie la plus neutre du jeu. */
export function getCategory(value: string | null | undefined): CategoryDef {
  return (value && BY_VALUE.get(value as PostCategory)) || BY_VALUE.get('partage')!
}

/** Types de contenu d'une publication (texte / image / vidéo / audio). */
export const MEDIA_TYPES: { value: 'text' | 'image' | 'video' | 'audio'; label: string; icon: ShineIconName }[] = [
  { value: 'text', label: 'Texte', icon: 'texte' },
  { value: 'image', label: 'Image', icon: 'image' },
  { value: 'video', label: 'Vidéo', icon: 'video' },
  { value: 'audio', label: 'Audio', icon: 'audio' },
]
