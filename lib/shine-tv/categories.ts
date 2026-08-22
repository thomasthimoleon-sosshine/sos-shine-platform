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
  icon: string
}

/** Les catégories réellement attribuables à une vidéo en base. */
export const SHINE_TV_CATEGORIES: ShineTvCategory[] = [
  { id: 'healing', label: 'Guérison intérieure', icon: '🌿' },
  { id: 'meditation', label: 'Méditations guidées', icon: '🧘' },
  { id: 'confidence', label: 'Confiance en soi', icon: '💪' },
  { id: 'relationships', label: 'Relations saines', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: '✨' },
  { id: 'sleep', label: 'Sommeil & Détente', icon: '🌙' },
  { id: 'masterclass', label: 'Masterclass', icon: '🎓' },
  { id: 'testimony', label: 'Témoignages', icon: '🗣️' },
  { id: 'children', label: 'Enfants', icon: '👶' },
]

const IDS = new Set(SHINE_TV_CATEGORIES.map(c => c.id))

/** Une catégorie stockée en base qui ne correspond à rien de connu. */
export function isKnownCategory(id: string | null | undefined): boolean {
  return !!id && IDS.has(id)
}

export function categoryLabel(id: string | null | undefined): string {
  return SHINE_TV_CATEGORIES.find(c => c.id === id)?.label || 'Autres'
}
