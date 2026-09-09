/**
 * SOS Meet Couple, le croisement des réponses.
 * ---------------------------------------------------------------------------
 * Trois métriques par dimension, et non une seule. C'est ce qui sépare ce
 * diagnostic d'un questionnaire de magazine.
 *
 *   DIVERGENCE  |A.moi − B.moi|
 *     Les deux ne vivent pas la même relation. Demande un arbitrage.
 *
 *   MALENTENDU  |A.croit_de_B − B.moi|  (et symétriquement)
 *     L'un se trompe sur ce que l'autre vit. La métrique la plus précieuse,
 *     parce qu'un malentendu se répare par une conversation.
 *
 *   USURE       100 − moyenne(A.moi, B.moi)
 *     Les deux souffrent sur cette dimension, en étant parfaitement d'accord.
 *     Invisible pour une approche qui ne mesurerait que le désaccord.
 *
 * Aucune réponse brute ne sort d'ici. Seulement des nombres et des verdicts.
 */
import {
  COUPLE_QUESTIONS, SCORED_QUESTIONS, QUESTIONS_BY_ID, valueOf,
} from './questionnaire'
import {
  DIMENSION_LABEL, DIMENSION_WEIGHT,
  type Dimension, type DimensionFinding, type Verdict, type CoupleAnswers,
} from './types'

type Side = { self: number[]; perceived: Record<string, number> }

/** Moyenne pondérée des items « moi » d'une dimension, 0..100. */
function selfScore(answers: CoupleAnswers, dim: Dimension): number | null {
  let sum = 0, w = 0
  for (const q of SCORED_QUESTIONS) {
    if (q.nature !== 'self' || q.dimension !== dim) continue
    const v = valueOf(q.id, answers)
    if (v == null) continue
    const weight = q.weight ?? 1
    sum += v * weight; w += weight
  }
  return w > 0 ? sum / w : null
}

/** Ce que cette personne croit du vécu de l'autre, par paire. */
function perceivedByPair(answers: CoupleAnswers): Record<string, number> {
  const out: Record<string, number> = {}
  for (const q of SCORED_QUESTIONS) {
    if (q.nature !== 'perceived' || !q.pair) continue
    const v = valueOf(q.id, answers)
    if (v != null) out[q.pair] = v
  }
  return out
}

/** Le score « moi » de la paire, pour comparer à ce que l'autre en croit. */
function selfByPair(answers: CoupleAnswers): Record<string, number> {
  const out: Record<string, number> = {}
  for (const q of SCORED_QUESTIONS) {
    if (q.nature !== 'self' || !q.pair) continue
    const v = valueOf(q.id, answers)
    if (v != null) out[q.pair] = v
  }
  return out
}

const PAIR_DIMENSION: Record<string, Dimension> = Object.fromEntries(
  COUPLE_QUESTIONS.filter(q => q.pair && q.dimension).map(q => [q.pair as string, q.dimension as Dimension])
)

// Seuils. Volontairement lisibles et ajustables : ils encodent un jugement
// produit, pas une vérité mathématique.
const PROCHE = 20        // écart en deçà duquel deux vécus se ressemblent
const ELOIGNE = 35       // écart au-delà duquel ils divergent vraiment
const BIEN = 65          // au-dessus, la dimension va bien
const MAL = 45           // en dessous, elle fait souffrir

/**
 * L'ordre de ces tests encode une décision produit.
 * Le malentendu passe AVANT la faille, même quand les deux sont élevés :
 * si l'un ignore ce que l'autre vit, c'est là qu'on peut agir, et une
 * conversation suffit parfois. Une faille, c'est quand les deux savent
 * qu'ils ne vivent pas la même chose : il faut alors arbitrer, pas informer.
 */
function classify(divergence: number, malentendu: number, usure: number): Verdict {
  if (malentendu >= ELOIGNE) return 'malentendu'
  if (divergence >= ELOIGNE) return 'faille'
  if (usure >= 100 - MAL) return 'usure'
  if (divergence <= PROCHE && usure <= 100 - BIEN) return 'point_or'
  return usure >= malentendu ? 'usure' : 'malentendu'
}

export type Crossing = {
  /**
   * Triés par impact décroissant. ATTENTION : `impact` ordonne les dimensions
   * À L'INTÉRIEUR d'un couple. Pour comparer deux couples entre eux, c'est
   * `sante` qui fait foi.
   */
  findings: DimensionFinding[]
  /** Santé globale 0..100, moyenne pondérée des deux vécus. */
  sante: number
  /** Écart de perception moyen : à quel point ils se connaissent encore. */
  lucidite: number
  /** Nombre de dimensions réellement mesurées chez les deux. */
  mesurees: number
}

export function buildCrossing(answersA: CoupleAnswers, answersB: CoupleAnswers): Crossing {
  const perceivedA = perceivedByPair(answersA)   // ce que A croit de B
  const perceivedB = perceivedByPair(answersB)   // ce que B croit de A
  const pairSelfA = selfByPair(answersA)
  const pairSelfB = selfByPair(answersB)

  const findings: DimensionFinding[] = []
  let santeSum = 0, santeW = 0
  const ecarts: number[] = []

  for (const dim of Object.keys(DIMENSION_WEIGHT) as Dimension[]) {
    const a = selfScore(answersA, dim)
    const b = selfScore(answersB, dim)
    if (a == null || b == null) continue     // dimension non mesurée chez les deux

    const divergence = Math.abs(a - b)
    const usure = 100 - (a + b) / 2

    // Malentendu : sur les paires de cette dimension, le plus grand écart
    // entre ce que l'un croit et ce que l'autre vit réellement.
    let malentendu = 0
    for (const [pair, d] of Object.entries(PAIR_DIMENSION)) {
      if (d !== dim) continue
      if (perceivedA[pair] != null && pairSelfB[pair] != null) {
        malentendu = Math.max(malentendu, Math.abs(perceivedA[pair] - pairSelfB[pair]))
        ecarts.push(Math.abs(perceivedA[pair] - pairSelfB[pair]))
      }
      if (perceivedB[pair] != null && pairSelfA[pair] != null) {
        malentendu = Math.max(malentendu, Math.abs(perceivedB[pair] - pairSelfA[pair]))
        ecarts.push(Math.abs(perceivedB[pair] - pairSelfA[pair]))
      }
    }

    const verdict = classify(divergence, malentendu, usure)

    // Qui porte la difficulté. Quand un seul souffre, la rupture surprend
    // celui qui n'avait rien vu : ces cas sont majorés.
    let porte_par: DimensionFinding['porte_par'] = null
    if (a < MAL && b < MAL) porte_par = 'les_deux'
    else if (a < MAL) porte_par = 'a'
    else if (b < MAL) porte_par = 'b'
    const asymetrie = porte_par === 'a' || porte_par === 'b' ? 1.25 : 1

    // Divergence et usure pèsent à parts égales : un couple parfaitement
    // d'accord sur son épuisement va aussi mal qu'un couple qui se déchire.
    const brut = 0.40 * divergence + 0.40 * usure + 0.20 * malentendu
    const impact = Math.round(Math.min(100, brut * DIMENSION_WEIGHT[dim] * asymetrie))

    findings.push({
      dimension: dim, label: DIMENSION_LABEL[dim], verdict, impact,
      divergence: Math.round(divergence), malentendu: Math.round(malentendu),
      usure: Math.round(usure), porte_par,
    })

    const w = DIMENSION_WEIGHT[dim]
    santeSum += ((a + b) / 2) * w; santeW += w
  }

  findings.sort((x, y) => y.impact - x.impact)

  const lucidite = ecarts.length
    ? Math.round(100 - ecarts.reduce((s, e) => s + e, 0) / ecarts.length)
    : 0

  return {
    findings,
    sante: santeW > 0 ? Math.round(santeSum / santeW) : 0,
    lucidite,
    mesurees: findings.length,
  }
}

/** Les points d'or, à présenter AVANT les failles. Un couple qui ouvre son
 *  diagnostic sur ses fractures le referme. */
export function pointsDOr(c: Crossing): DimensionFinding[] {
  return c.findings.filter(f => f.verdict === 'point_or').sort((a, b) => a.impact - b.impact).slice(0, 4)
}

/** Les leviers prioritaires : ce sur quoi agir d'abord. */
export function leviers(c: Crossing): DimensionFinding[] {
  return c.findings.filter(f => f.verdict !== 'point_or').slice(0, 3)
}
