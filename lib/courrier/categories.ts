/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  COURRIER ANONYME — source unique des types de message
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  La liste vivait en double : une fois dans le formulaire des membres, une
 *  fois dans le back-office. Deux copies d'une même vérité finissent toujours
 *  par diverger — et elles portaient chacune des émojis système, que chaque
 *  téléphone redessine à sa façon.
 *
 *  Une seule liste ici, avec les signes SOS Shine, du même trait que le reste.
 */

import type { ShineIconName } from '@/components/icons/ShineIcon'
import type { CourrierAnonymeCategory, CourrierAnsweredVia } from '@/types/database'

export type TypeCourrier = {
  value: CourrierAnonymeCategory
  label: string
  icon: ShineIconName
  /** Ce qu'on attend de ce type de message, montré sous les boutons. */
  desc: string
}

export const TYPES_COURRIER: TypeCourrier[] = [
  {
    value: 'question',
    label: 'Question',
    icon: 'question',
    desc: 'Posez une question que vous aimeriez voir traitée en vidéo ou en podcast',
  },
  {
    value: 'recommandation',
    label: 'Recommandation',
    icon: 'astuce',
    desc: 'Suggérez un sujet, un thème ou un format de contenu',
  },
  {
    value: 'temoignage',
    label: 'Témoignage',
    icon: 'temoignage',
    desc: 'Partagez votre vécu de manière anonyme pour inspirer les autres',
  },
  {
    value: 'suggestion',
    label: 'Suggestion',
    icon: 'chantier',
    desc: 'Proposez une amélioration pour la plateforme ou la communauté',
  },
  {
    value: 'autre',
    label: 'Autre',
    icon: 'parole',
    desc: 'Tout ce qui vous tient à cœur et que vous souhaitez partager',
  },
]

const PAR_VALEUR = new Map(TYPES_COURRIER.map(t => [t.value, t]))

/** Repli sur « Autre » : c'est le type le plus neutre du jeu. */
export function typeCourrier(valeur: string | null | undefined): TypeCourrier {
  return (valeur && PAR_VALEUR.get(valeur as CourrierAnonymeCategory)) || PAR_VALEUR.get('autre')!
}

/** Par où l'équipe fondatrice a répondu à un courrier. */
export const CANAUX_REPONSE: { value: CourrierAnsweredVia; label: string; icon: ShineIconName }[] = [
  { value: 'shine_tv', label: 'Shine TV', icon: 'video' },
  { value: 'podcast', label: 'Podcast / Audible', icon: 'podcast' },
  { value: 'article', label: 'Article / Librairie', icon: 'livre' },
  { value: 'direct', label: 'Réponse directe', icon: 'parole' },
]
