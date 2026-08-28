/**
 * SOS Meet Couple, positions célestes.
 * ---------------------------------------------------------------------------
 * Astronomie réelle, sans dépendance externe : formules classiques de Meeus,
 * « Astronomical Algorithms ». Ce qui est calculé ici est vrai, avec les
 * précisions annoncées ci-dessous. Rien n'est inventé.
 *
 *   Soleil   : longitude apparente, précision de l'ordre de 0,01 degré.
 *              Largement suffisant pour le signe ET le degré.
 *   Lune     : formule abrégée, précision de l'ordre de 0,3 degré. Suffisant
 *              pour le signe sauf tout près d'une cuspide, où l'on préfère
 *              annoncer l'incertitude plutôt que trancher.
 *   Ascendant: exact SI l'heure et le lieu sont connus. Sinon indéterminé.
 *
 * Les autres planètes demandent une éphéméride complète : elles ne sont pas
 * calculées ici, et rien ne prétend le contraire.
 */

const RAD = Math.PI / 180

/** Jour julien à partir d'une date UTC. */
export function julianDay(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5
}

/** Siècles juliens depuis J2000.0 */
function T(jd: number): number { return (jd - 2451545.0) / 36525 }

function norm360(x: number): number { return ((x % 360) + 360) % 360 }

/**
 * Longitude apparente du Soleil, en degrés. Meeus, chapitre 25.
 * Inclut l'équation du centre et la correction de nutation/aberration.
 */
export function sunLongitude(jd: number): number {
  const t = T(jd)
  const L0 = norm360(280.46646 + 36000.76983 * t + 0.0003032 * t * t)      // longitude moyenne
  const M = norm360(357.52911 + 35999.05029 * t - 0.0001537 * t * t)       // anomalie moyenne
  const Mr = M * RAD
  const C =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(Mr) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr)
  const trueLong = L0 + C
  const omega = 125.04 - 1934.136 * t
  return norm360(trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD))
}

/** Longitude de la Lune, en degrés. Formule abrégée, environ 0,3 degré. */
export function moonLongitude(jd: number): number {
  const t = T(jd)
  const Lp = 218.316 + 481267.8813 * t                       // longitude moyenne
  const M = 357.529 + 35999.0503 * t                         // anomalie solaire
  const Mp = 134.963 + 477198.8676 * t                       // anomalie lunaire
  const D = 297.850 + 445267.1115 * t                        // élongation
  const F = 93.272 + 483202.0175 * t                         // argument de latitude
  const l =
    Lp +
    6.289 * Math.sin(Mp * RAD) +
    1.274 * Math.sin((2 * D - Mp) * RAD) +
    0.658 * Math.sin(2 * D * RAD) +
    0.214 * Math.sin(2 * Mp * RAD) -
    0.186 * Math.sin(M * RAD) -
    0.114 * Math.sin(2 * F * RAD)
  return norm360(l)
}

/**
 * Ascendant, en degrés de longitude écliptique.
 * Exact quand l'heure et les coordonnées sont connues. Renvoie null sinon.
 */
export function ascendant(jd: number, latitude: number, longitude: number): number | null {
  if (!isFinite(latitude) || !isFinite(longitude)) return null
  const t = T(jd)
  // Temps sidéral apparent de Greenwich, puis local.
  const gmst = norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t
  )
  const lst = norm360(gmst + longitude) * RAD
  // Obliquité de l'écliptique.
  const eps = (23.439291 - 0.0130042 * t) * RAD
  const phi = latitude * RAD
  const asc = Math.atan2(
    Math.cos(lst),
    -(Math.sin(lst) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
  )
  return norm360(asc / RAD)
}

/**
 * Instant où le Soleil était 88 degrés plus tôt en longitude.
 * C'est la définition du « design » en Human Design. Résolu par recherche
 * dichotomique sur la date, à la minute près.
 */
export function solarArcBefore(jd: number, degrees = 88): number {
  const target = sunLongitude(jd) - degrees
  const wrapped = ((target % 360) + 360) % 360
  // Le Soleil parcourt environ 1 degré par jour : on encadre puis on affine.
  let lo = jd - degrees * 1.05 - 2
  let hi = jd - degrees * 0.95 + 2
  const diff = (x: number) => {
    let d = sunLongitude(x) - wrapped
    while (d > 180) d -= 360
    while (d < -180) d += 360
    return d
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (diff(lo) * diff(mid) <= 0) hi = mid; else lo = mid
  }
  return (lo + hi) / 2
}

export const SIGNES = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
] as const
export type Signe = (typeof SIGNES)[number]

export type Position = { longitude: number; signe: Signe; degre: number }

export function toPosition(longitude: number): Position {
  const l = norm360(longitude)
  const i = Math.floor(l / 30)
  return { longitude: l, signe: SIGNES[i], degre: +(l - i * 30).toFixed(2) }
}

/** Est-on à moins de `marge` degrés d'un changement de signe ? */
export function presDeCuspide(longitude: number, marge = 1): boolean {
  const d = norm360(longitude) % 30
  return d < marge || d > 30 - marge
}
