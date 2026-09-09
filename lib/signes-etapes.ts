/**
 *  SIGNES D'ÉTAPE — de l'émoji système au signe SOS Shine
 *  ───────────────────────────────────────────────────────
 *
 *  Les étapes d'un protocole portaient un émoji rangé dans `douleur_steps.icon`.
 *  Deux problèmes : un émoji n'est pas dessiné par nous (chaque téléphone a le
 *  sien, Apple, Google, Samsung — le protocole ne ressemble à rien de stable),
 *  et il ne partage rien avec la grammaire maison, la facette et le rai.
 *
 *  Cette fonction traduit, sans rien changer dans la base :
 *
 *   1. si la valeur est déjà un nom de signe maison — « oeil », « envol » —
 *      on la prend telle quelle. C'est ce que le back-office écrit désormais ;
 *   2. sinon, si c'est un émoji tapé à la main qui porte une intention —
 *      un livre, un casque, une clé — on le traduit par le signe équivalent ;
 *   3. sinon, c'est un des émojis que le code posait tout seul par défaut
 *      (🎬 ✨ ⚡ 🌊 🔥 💎 🌟) : ils ne disaient rien de plus que le rang de
 *      l'étape, donc c'est le rang qui décide.
 *
 *  Conséquence : aucun protocole n'a besoin d'être retouché, ni les anciens
 *  ni ceux à venir — il n'y a plus un seul chemin qui affiche un émoji.
 */

import { estSigneShine, type ShineIconName } from '@/components/icons/ShineIcon'

/**
 * Le récit d'un protocole : on regarde en face, on laisse partir, on pose un
 * acte. Au-delà de trois étapes, la suite reprend au début.
 */
const PAR_RANG: ShineIconName[] = [
  'oeil',        // 1 · Comprendre — voir clair
  'envol',       // 2 · Se libérer — ce qui se détache
  'cible',       // 3 · Agir — viser, poser un acte
  'boussole',    // 4 · s'orienter
  'respiration', // 5 · souffler
  'eclat',       // 6 · ce qui s'allume
  'coeur',       // 7 · ce qu'on garde
]

/**
 * Émojis tapés à la main dans le back-office : eux portent une intention,
 * on la garde. Les émojis par défaut du code n'y figurent pas exprès —
 * ils tombent sur le rang, qui est plus juste.
 */
const PAR_EMOJI: Record<string, ShineIconName> = {
  '❤': 'coeur', '💛': 'coeur', '💗': 'coeur', '💖': 'coeur', '🤍': 'coeur', '🩷': 'coeur',
  '🧘': 'meditation', '🕉': 'meditation',
  '🌬': 'respiration', '💨': 'respiration', '😮‍💨': 'respiration',
  '📖': 'livre', '📚': 'livre', '📕': 'livre', '📗': 'livre', '📘': 'livre',
  '🎧': 'audio', '🔊': 'audio', '🎵': 'audio', '🎶': 'audio', '🎙': 'audio',
  '🎥': 'video', '📹': 'video', '📽': 'video', '📺': 'video',
  '✍': 'plume', '📝': 'plume', '🖊': 'plume', '🖋': 'plume',
  '🧭': 'boussole', '🗺': 'carte',
  '🎯': 'cible',
  '🔑': 'cle', '🗝': 'cle',
  '🕊': 'envol', '🦋': 'envol', '🪶': 'plume',
  '👁': 'oeil', '👀': 'oeil',
  '🌱': 'sante', '🌿': 'sante', '🍀': 'sante', '🌸': 'sante',
  '🛡': 'bouclier',
  '⏳': 'horloge', '⏰': 'horloge', '🕐': 'horloge', '⌛': 'horloge',
  '🌙': 'sleep', '😴': 'sleep', '🛌': 'sleep',
  '🏆': 'couronne', '👑': 'couronne', '🥇': 'couronne',
  '💪': 'resilience',
  '🤝': 'membres', '👥': 'membres', '👫': 'membres', '🫂': 'membres',
  '📅': 'calendrier', '🗓': 'calendrier',
  '💡': 'astuce',
  '🔒': 'cadenas', '🔐': 'cadenas',
  '⚖': 'balance',
  '📊': 'courbe', '📈': 'courbe',
  '🏠': 'maison', '🏡': 'maison',
  '💬': 'parole', '🗨': 'parole', '🗣': 'parole',
  '🙏': 'remerciements',
  '❓': 'question', '❔': 'question',
  '📋': 'texte', '📄': 'texte', '📃': 'texte',
  '🎨': 'palette',
  '🌍': 'globe', '🌎': 'globe', '🌏': 'globe',
}

/**
 * Un même émoji arrive sous plusieurs formes : suivi du sélecteur de variante
 * (U+FE0F), d'une teinte de peau, ou composé par une jointure invisible.
 * On ramène tout à sa forme nue avant de chercher.
 */
function nu(brut: string): string {
  return brut
    .replace(/[\uFE0E\uFE0F]/g, '') // sélecteurs de variante
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    .trim()
}

/**
 * Le signe à afficher pour une étape.
 *
 * @param icone  ce que contient `douleur_steps.icon` (nom de signe, émoji, ou rien)
 * @param rang   le numéro de l'étape, à partir de 1
 */
export function signeEtape(icone: string | null | undefined, rang: number): ShineIconName {
  const valeur = (icone || '').trim()

  if (estSigneShine(valeur)) return valeur

  if (valeur) {
    const cle = nu(valeur)
    if (PAR_EMOJI[cle]) return PAR_EMOJI[cle]
    // Un émoji composé (🧘‍♀️) : on retente sur son premier élément.
    const premier = cle.split('\u200D')[0] // jointure invisible
    if (premier && PAR_EMOJI[premier]) return PAR_EMOJI[premier]
  }

  const index = Number.isFinite(rang) && rang >= 1 ? Math.floor(rang) - 1 : 0
  return PAR_RANG[index % PAR_RANG.length]
}

/** Les signes proposés au back-office quand on crée une étape. */
export const SIGNES_ETAPE_PAR_DEFAUT = PAR_RANG
