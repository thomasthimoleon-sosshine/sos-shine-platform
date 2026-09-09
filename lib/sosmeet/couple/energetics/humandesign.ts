/**
 * SOS Meet Couple, Human Design.
 * ---------------------------------------------------------------------------
 * CE QUI EST CALCULÉ ICI, ET CE QUI NE L'EST PAS.
 *
 * Calculé, à partir de positions solaires réelles :
 *   - les portes et lignes du SOLEIL et de la TERRE, en personnalité (l'instant
 *     de la naissance) et en design (l'instant où le Soleil était 88 degrés
 *     plus tôt). Ce sont les deux activations les plus structurantes d'un
 *     schéma, et elles ne dépendent que du Soleil, donc elles sont exactes.
 *   - le PROFIL, qui se lit sur les lignes du Soleil de personnalité et du
 *     Soleil de design.
 *
 * NON calculé, et jamais deviné :
 *   - le TYPE (générateur, projecteur, manifesteur, réflecteur), l'AUTORITÉ
 *     et les CENTRES définis. Ils dépendent des treize activations
 *     planétaires, donc de Mercure à Pluton et des noeuds lunaires. Sans
 *     éphéméride planétaire complète, ces valeurs sont indéterminées, et ce
 *     module le dit au lieu d'inventer.
 *
 * ⚠️ À VALIDER AVANT MISE EN LIGNE : la roue ci-dessous place la porte 41 au
 * début, à 2 degrés du Verseau, et les portes se suivent dans l'ordre du
 * mandala. C'est la convention standard, mais elle doit être confrontée à un
 * thème de référence connu (celui de Julia, par exemple) avant d'être montrée
 * à qui que ce soit. Tout se corrige en changeant les deux constantes
 * ROUE et DEBUT_ROUE ci-dessous, rien d'autre.
 */
import { julianDay, sunLongitude, solarArcBefore } from './ephemeris'

/** Ordre des 64 portes autour de la roue, en partant de la porte 41. */
const ROUE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
]
/** La porte 41 commence à 2 degrés du Verseau, soit 302 degrés de longitude. */
const DEBUT_ROUE = 302
const PAS = 360 / 64          // 5,625 degrés par porte
const PAS_LIGNE = PAS / 6     // 0,9375 degré par ligne

export type Activation = { porte: number; ligne: number }

export function activation(longitude: number): Activation {
  const rel = (((longitude - DEBUT_ROUE) % 360) + 360) % 360
  const i = Math.floor(rel / PAS)
  const dansLaPorte = rel - i * PAS
  return { porte: ROUE[i], ligne: Math.floor(dansLaPorte / PAS_LIGNE) + 1 }
}

export type SchemaHD = {
  personnalite: { soleil: Activation; terre: Activation }
  design: { soleil: Activation; terre: Activation }
  /** Profil, par exemple « 3/5 ». */
  profil: string
  profilNom: string
  /** Toujours renseigné : ce module ne prétend pas savoir ce qu'il ne sait pas. */
  indetermine: string[]
}

const PROFILS: Record<string, string> = {
  '1/3': 'l’Enquêteur Martyr', '1/4': 'l’Enquêteur Opportuniste',
  '2/4': 'l’Ermite Opportuniste', '2/5': 'l’Ermite Hérétique',
  '3/5': 'le Martyr Hérétique', '3/6': 'le Martyr Modèle',
  '4/6': 'l’Opportuniste Modèle', '4/1': 'l’Opportuniste Enquêteur',
  '5/1': 'l’Hérétique Enquêteur', '5/2': 'l’Hérétique Ermite',
  '6/2': 'le Modèle Ermite', '6/3': 'le Modèle Martyr',
}

export function schemaHD(dateIso: string, heure?: string | null): SchemaHD {
  const h = heure && /^\d{2}:\d{2}/.test(heure) ? heure.slice(0, 5) : '12:00'
  const jd = julianDay(new Date(`${dateIso.slice(0, 10)}T${h}:00Z`))
  const jdDesign = solarArcBefore(jd, 88)

  const sp = sunLongitude(jd)
  const sd = sunLongitude(jdDesign)
  const personnalite = { soleil: activation(sp), terre: activation(sp + 180) }
  const design = { soleil: activation(sd), terre: activation(sd + 180) }

  const profil = `${personnalite.soleil.ligne}/${design.soleil.ligne}`

  const indetermine = [
    'Type et autorité : indéterminés. Ils dépendent des treize activations planétaires, qui demandent une éphéméride complète.',
    'Centres définis : indéterminés, pour la même raison.',
  ]
  if (!heure) indetermine.push('Heure de naissance inconnue : les lignes sont données sous réserve, midi ayant été retenu par défaut.')

  return {
    personnalite, design, profil,
    profilNom: PROFILS[profil] || 'profil non standard, à vérifier',
    indetermine,
  }
}

export type HDCouple = {
  a: SchemaHD
  b: SchemaHD
  /** Portes que les deux portent : ce qui se comprend sans être expliqué. */
  portesCommunes: number[]
  lecture: string
  indetermine: string[]
}

export function humanDesignCouple(
  dateA: string, heureA: string | null | undefined,
  dateB: string, heureB: string | null | undefined,
): HDCouple {
  const a = schemaHD(dateA, heureA), b = schemaHD(dateB, heureB)
  const portes = (s: SchemaHD) => [
    s.personnalite.soleil.porte, s.personnalite.terre.porte,
    s.design.soleil.porte, s.design.terre.porte,
  ]
  const pa = new Set(portes(a))
  const portesCommunes = [...new Set(portes(b).filter(p => pa.has(p)))].sort((x, y) => x - y)

  const lecture = portesCommunes.length
    ? `Vous partagez ${portesCommunes.length === 1 ? 'une porte' : `${portesCommunes.length} portes`} (${portesCommunes.join(', ')}). ` +
      'Ce que vous avez en commun ici se comprend entre vous sans avoir besoin d’être expliqué, et c’est aussi là que vous vous renforcez dans les mêmes angles morts.'
    : 'Vos activations solaires ne se recoupent pas. Vous abordez la vie par des portes différentes : rien ne va de soi entre vous, et tout peut s’apprendre l’un de l’autre.'

  return {
    a, b, portesCommunes, lecture,
    indetermine: [...new Set([...a.indetermine, ...b.indetermine])],
  }
}
