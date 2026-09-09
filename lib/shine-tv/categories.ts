import type { ShineIconName } from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CATÉGORIES SHINE TV — source unique de vérité
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Pourquoi ce fichier existe : l'admin et le dashboard tenaient chacun leur
 *  propre liste, et elles avaient divergé.
 *
 *    · L'admin proposait « Masterclass » et « Témoignages » — absentes du
 *      dashboard. Une vidéo rangée là devenait INVISIBLE dans l'onglet
 *      « Tout » : elle n'appartenait à aucune rangée, donc elle n'était
 *      affichée nulle part. C'est ce qui est arrivé à « La Science des
 *      Comportements ».
 *    · Le dashboard proposait « Tendances du moment » que l'admin ne pouvait
 *      pas attribuer : un filtre qui ne renvoyait jamais rien.
 *
 *  Les deux pages importent désormais cette liste. Toute catégorie ajoutée ici
 *  apparaît des deux côtés du même coup.
 */

export type ShineTvCategory = {
  id: string
  label: string
  /** Signe du jeu « Les Éclats » — plus aucun émoji système. */
  icon: ShineIconName
}

/** Les catégories réellement attribuables à une vidéo en base. */
export const SHINE_TV_CATEGORIES: ShineTvCategory[] = [
  { id: 'healing', label: 'Guérison intérieure', icon: 'healing' },
  { id: 'meditation', label: 'Méditations guidées', icon: 'meditation' },
  { id: 'confidence', label: 'Confiance en soi', icon: 'confidence' },
  { id: 'relationships', label: 'Relations saines', icon: 'relationships' },
  { id: 'resilience', label: 'Résilience', icon: 'resilience' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: 'gratitude' },
  { id: 'sleep', label: 'Sommeil & Détente', icon: 'sleep' },
  { id: 'masterclass', label: 'Masterclass', icon: 'masterclass' },
  { id: 'testimony', label: 'Témoignages', icon: 'temoignage' },
  { id: 'children', label: 'Enfants', icon: 'children' },
]

const IDS = new Set(SHINE_TV_CATEGORIES.map(c => c.id))

/** Une catégorie stockée en base qui ne correspond à rien de connu. */
export function isKnownCategory(id: string | null | undefined): boolean {
  return !!id && IDS.has(id)
}

export function categoryLabel(id: string | null | undefined): string {
  return SHINE_TV_CATEGORIES.find(c => c.id === id)?.label || 'Autres'
}
