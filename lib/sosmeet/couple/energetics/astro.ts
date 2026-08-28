/**
 * SOS Meet Couple, astrologie.
 * ---------------------------------------------------------------------------
 * Ce qui est calculé ici est réellement calculé, à partir des positions de
 * ephemeris.ts. Ce qui ne l'est pas est déclaré indéterminé, jamais deviné.
 *
 *   Soleil     : exact. Signe et degré.
 *   Lune       : environ 0,3 degré. Le signe est annoncé avec une réserve
 *                quand la position tombe près d'une cuspide.
 *   Ascendant  : exact SI heure et lieu connus, sinon indéterminé.
 *   Le reste   : Mercure à Pluton, maisons, aspects complets, demandent une
 *                éphéméride planétaire. Non calculés, et rien ne le prétend.
 */
import {
  julianDay, sunLongitude, moonLongitude, ascendant, toPosition, presDeCuspide,
  type Position, type Signe,
} from './ephemeris'

export type Element = 'Feu' | 'Terre' | 'Air' | 'Eau'
export type Modalite = 'Cardinal' | 'Fixe' | 'Mutable'

const ELEMENT: Record<Signe, Element> = {
  'Bélier': 'Feu', 'Lion': 'Feu', 'Sagittaire': 'Feu',
  'Taureau': 'Terre', 'Vierge': 'Terre', 'Capricorne': 'Terre',
  'Gémeaux': 'Air', 'Balance': 'Air', 'Verseau': 'Air',
  'Cancer': 'Eau', 'Scorpion': 'Eau', 'Poissons': 'Eau',
}
const MODALITE: Record<Signe, Modalite> = {
  'Bélier': 'Cardinal', 'Cancer': 'Cardinal', 'Balance': 'Cardinal', 'Capricorne': 'Cardinal',
  'Taureau': 'Fixe', 'Lion': 'Fixe', 'Scorpion': 'Fixe', 'Verseau': 'Fixe',
  'Gémeaux': 'Mutable', 'Vierge': 'Mutable', 'Sagittaire': 'Mutable', 'Poissons': 'Mutable',
}

export type Naissance = {
  date: string            // ISO
  heure?: string | null   // 'HH:MM', absente = ascendant indéterminé
  lat?: number | null
  lon?: number | null
}

export type ThemeSolaire = {
  soleil: Position & { element: Element; modalite: Modalite }
  lune: (Position & { element: Element; incertain: boolean }) | null
  ascendant: Position | null
  /** Pourquoi certaines pièces manquent, dit franchement. */
  limites: string[]
}

function instant(n: Naissance): { jd: number; heureConnue: boolean } {
  const heure = n.heure && /^\d{2}:\d{2}/.test(n.heure) ? n.heure.slice(0, 5) : null
  // Sans heure, on prend midi : c'est le choix qui minimise l'erreur sur la Lune.
  const d = new Date(`${n.date.slice(0, 10)}T${heure || '12:00'}:00Z`)
  return { jd: julianDay(d), heureConnue: !!heure }
}

export function themeSolaire(n: Naissance): ThemeSolaire {
  const { jd, heureConnue } = instant(n)
  const limites: string[] = []

  const sl = sunLongitude(jd)
  const sp = toPosition(sl)
  const soleil = { ...sp, element: ELEMENT[sp.signe], modalite: MODALITE[sp.signe] }

  const ml = moonLongitude(jd)
  const mp = toPosition(ml)
  const incertain = presDeCuspide(ml, 2) || !heureConnue
  const lune = { ...mp, element: ELEMENT[mp.signe], incertain }
  if (!heureConnue) limites.push('Heure de naissance inconnue : le signe de Lune est donné sous réserve, et l’ascendant ne peut pas être calculé.')
  else if (presDeCuspide(ml, 2)) limites.push('La Lune se trouve tout près d’un changement de signe : le résultat demande une vérification.')

  let asc: Position | null = null
  if (heureConnue && typeof n.lat === 'number' && typeof n.lon === 'number') {
    const a = ascendant(jd, n.lat, n.lon)
    if (a != null) asc = toPosition(a)
  } else if (heureConnue) {
    limites.push('Lieu de naissance inconnu : l’ascendant ne peut pas être calculé.')
  }

  limites.push('Cette lecture porte sur le Soleil, la Lune et l’ascendant. Les autres planètes demandent une éphéméride complète, prévue plus tard.')

  return { soleil, lune, ascendant: asc, limites }
}

// ── Synastrie : la rencontre des deux thèmes ───────────────────────────────
const ELEMENT_ACCORD: Record<Element, Element[]> = {
  Feu: ['Feu', 'Air'], Air: ['Air', 'Feu'], Terre: ['Terre', 'Eau'], Eau: ['Eau', 'Terre'],
}

function aspect(a: number, b: number): { nom: string; orbe: number } | null {
  let d = Math.abs(a - b) % 360
  if (d > 180) d = 360 - d
  const table: Array<[string, number, number]> = [
    ['conjonction', 0, 8], ['sextile', 60, 5], ['carré', 90, 7],
    ['trigone', 120, 7], ['opposition', 180, 8],
  ]
  for (const [nom, angle, orbe] of table) {
    const e = Math.abs(d - angle)
    if (e <= orbe) return { nom, orbe: +e.toFixed(1) }
  }
  return null
}

const ASPECT_LECTURE: Record<string, string> = {
  conjonction: 'Vos deux natures se superposent : évidence immédiate, et peu de recul l’un sur l’autre.',
  sextile: 'Un appui facile, qui demande d’être activé pour donner quelque chose.',
  carré: 'Une tension féconde : c’est ce qui vous pousse, et c’est aussi ce qui frotte.',
  trigone: 'Une fluidité naturelle entre vous, au risque du confort qui n’avance plus.',
  opposition: 'Vous vous tenez face à face : chacun porte ce que l’autre n’a pas. Complémentaire, et exigeant.',
}

export type Synastrie = {
  themeA: ThemeSolaire
  themeB: ThemeSolaire
  aspectSoleils: { nom: string; orbe: number } | null
  lectureSoleils: string
  elementsAccordes: boolean
  lectureElements: string
  /** Composite solaire : le point milieu des deux Soleils. */
  compositeSoleil: Position
  lectureComposite: string
  limites: string[]
}

const COMPOSITE_LECTURE: Record<Element, string> = {
  Feu: 'Ensemble, vous formez un couple d’élan : vous avancez mieux en faisant qu’en analysant.',
  Terre: 'Ensemble, vous formez un couple d’ancrage : le concret et la durée vous réussissent mieux que les grandes déclarations.',
  Air: 'Ensemble, vous formez un couple de parole : ce qui se dit entre vous compte plus que ce qui se fait.',
  Eau: 'Ensemble, vous formez un couple de ressenti : l’ambiance entre vous précède toujours les mots.',
}

export function synastrie(a: Naissance, b: Naissance): Synastrie {
  const themeA = themeSolaire(a), themeB = themeSolaire(b)
  const asp = aspect(themeA.soleil.longitude, themeB.soleil.longitude)

  const accord = ELEMENT_ACCORD[themeA.soleil.element].includes(themeB.soleil.element)
  const lectureElements = accord
    ? `Vos deux éléments, ${themeA.soleil.element} et ${themeB.soleil.element}, se nourrissent. Vous vous comprenez sans avoir à traduire.`
    : `Vos deux éléments, ${themeA.soleil.element} et ${themeB.soleil.element}, ne parlent pas la même langue. Ce n’est pas un obstacle, c’est un travail de traduction permanent.`

  // Point milieu, en prenant le plus court arc.
  let d = themeB.soleil.longitude - themeA.soleil.longitude
  if (d > 180) d -= 360
  if (d < -180) d += 360
  const compositeSoleil = toPosition(themeA.soleil.longitude + d / 2)

  return {
    themeA, themeB,
    aspectSoleils: asp,
    lectureSoleils: asp
      ? `Vos Soleils sont en ${asp.nom} (orbe ${asp.orbe} degré). ${ASPECT_LECTURE[asp.nom]}`
      : 'Vos Soleils ne forment pas d’aspect majeur : vos natures profondes coexistent sans se chercher ni se heurter.',
    elementsAccordes: accord,
    lectureElements,
    compositeSoleil,
    lectureComposite: COMPOSITE_LECTURE[ELEMENT[compositeSoleil.signe]],
    limites: [...new Set([...themeA.limites, ...themeB.limites])],
  }
}
