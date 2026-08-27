/**
 * SOS Meet — Moteur de sincérité / détection d'incohérences (« anti-triche »)
 * ---------------------------------------------------------------------------
 * But : à partir des seules réponses (et du temps de réponse), estimer si une
 * personne répond honnêtement et de façon cohérente — SANS jamais l'accuser
 * publiquement. Le score sert (1) à ta modération, (2) à pondérer le matching,
 * (3) à décerner un badge POSITIF « Profil cohérent » aux hauts scores.
 *
 * Quatre signaux :
 *   1. Paires de cohérence   — deux réponses qui se contredisent logiquement.
 *   2. Redondance déguisée   — un même trait demandé autrement, réponses qui divergent.
 *   3. Désirabilité sociale  — cocher systématiquement l'option la plus flatteuse.
 *   4. Anti-bâclage          — réponses toutes identiques (straight-lining) + temps.
 *
 * Format des réponses : { [questionId]: number }
 *   - question 'choice' : index de l'option choisie (0-based)
 *   - question 'scale'  : valeur 0..100
 * Temps : { [questionId]: millisecondes passées sur la question } (optionnel).
 */

import { ESSENTIEL } from './essentiel'

export type Answers = Record<string, number>
export type Timings = Record<string, number>

// ── 1 & 2. Règles de cohérence / redondance ────────────────────────────────
// `penalty(a, b)` renvoie 0 (cohérent) → 1 (contradiction totale).
export type CoherenceRule = {
  id: string
  a: string
  b: string
  label: string           // lisible en modération
  weight?: number         // importance (défaut 1)
  penalty: (a: number, b: number) => number
}

/** Contradiction franche : si a ∈ setA ET b ∈ setB → pénalité pleine. */
function clash(setA: number[], setB: number[]): (a: number, b: number) => number {
  return (a, b) => (setA.includes(a) && setB.includes(b) ? 1 : 0)
}
/** Deux échelles 0..100 censées aller dans le même sens : pénalise l'écart. */
function sameDirection(): (a: number, b: number) => number {
  return (a, b) => Math.abs(a - b) / 100
}

export const COHERENCE_RULES: CoherenceRule[] = [
  // Chrono-type vs heure de coucher (M2)
  {
    id: 'soir_vs_coucher', a: 'q16', b: 'q17',
    label: 'Se dit couche-tard mais se couche très tôt (ou l\'inverse)',
    // q16: 0 lève-tôt,1 matin,2 neutre,3 couche-tard,4 variable · q17: 0 <22h30 … 3 >1h30
    penalty: (a, b) => {
      if (a === 3 && b === 0) return 1        // couche-tard mais avant 22h30
      if (a === 0 && b === 3) return 1        // lève-tôt mais après 1h30
      return 0
    },
  },
  // Besoin de solitude vs vie nocturne/sociale (M2)
  {
    id: 'solitude_vs_sorties', a: 'q23', b: 'q21',
    label: 'Dit avoir besoin de beaucoup de solitude mais sort presque tous les soirs',
    weight: 0.8,
    // q23: 0 beaucoup … · q21: 0 ≥3/sem …
    penalty: clash([0], [0]),
  },
  // Solitude vs recevoir du monde (M2)
  {
    id: 'solitude_vs_recevoir', a: 'q23', b: 'q32',
    label: 'Beaucoup de solitude déclarée mais reçoit du monde très souvent',
    weight: 0.6,
    penalty: clash([0], [0]),
  },
  // Calme à la maison vs vie très sociale (M2)
  {
    id: 'calme_vs_social', a: 'q33', b: 'q20',
    label: 'Dit avoir besoin de beaucoup de calme mais week-end 100% social',
    weight: 0.5,
    // q33: 0 beaucoup de calme · q20: 1 social/sorties
    penalty: clash([0], [1]),
  },
  // Attachement (M6) : se dit « sécure » mais déclare une peur forte
  {
    id: 'secure_vs_abandon', a: 'q83', b: 'q87',
    label: 'Se dit « sécure » mais déclare une peur d’abandon très forte',
    // q83: 0 sécure · q87: 0 oui fortement
    penalty: clash([0], [0]),
  },
  {
    id: 'secure_vs_envahissement', a: 'q83', b: 'q88',
    label: 'Se dit « sécure » mais forte peur de l’envahissement',
    weight: 0.8,
    penalty: clash([0], [0]),
  },
  // Prêt·e « 9-10 » mais deuil des ex pas terminé
  {
    id: 'pret_vs_deuil', a: 'q140', b: 'q120',
    label: 'Se dit totalement prêt·e mais n’a pas fait le deuil de ses relations',
    weight: 0.7,
    // q140: 4 = 9-10 · q120: 2 = pas complètement
    penalty: clash([4], [2]),
  },
]

// ── 3. Désirabilité sociale ────────────────────────────────────────────────
// Pour certaines questions, une option est « la plus flatteuse ». Cocher
// TOUJOURS la flatteuse trahit une image idéalisée plutôt qu'honnête.
export type DesirabilityFlag = { q: string; flattering: number[] } // options flatteuses
// Drapeaux hérités des modules non retenus au palier Essentiel…
const DESIRABILITY_EXTRA: DesirabilityFlag[] = [
  { q: 'q31', flattering: [0, 1] },   // ponctualité : « toujours en avance / ponctuel »
  { q: 'q10', flattering: [0] },      // « clairement satisfait de ma vie pro »
  { q: 'q25', flattering: [0, 1] },   // « très planifié / organisé »
]
// …fusionnés avec ceux déclarés directement sur la banque Essentiel (champ `desirable`),
// pour rester automatiquement synchronisés quand on ajoute des questions.
export const DESIRABILITY: DesirabilityFlag[] = [
  ...DESIRABILITY_EXTRA,
  ...ESSENTIEL.filter(q => q.desirable && q.desirable.length)
    .map(q => ({ q: q.id, flattering: q.desirable as number[] })),
]

// ── Paramètres ─────────────────────────────────────────────────────────────
const FAST_MS = 900          // < 0,9 s sur une question = quasi non-lue
const MIN_MEDIAN_MS = 1500   // médiane trop basse = bâclage global

export type SincerityResult = {
  score: number              // 0..100
  coherent: boolean          // badge public « Profil cohérent »
  band: 'haute' | 'moyenne' | 'à vérifier'
  signals: {
    coherence: number        // 0..1 (1 = parfaitement cohérent)
    desirability: number
    variety: number          // anti straight-lining
    pace: number             // anti-bâclage temps
  }
  flags: string[]            // pour ta modération (lisible)
}

/**
 * Calcule l'indice de sincérité. `timings` optionnel : sans lui, le signal
 * temps est neutre (0.85) plutôt que pénalisant.
 */
export function computeSincerity(answers: Answers, timings?: Timings): SincerityResult {
  const flags: string[] = []
  const keys = Object.keys(answers)

  // 1 & 2 — cohérence & redondance
  let penSum = 0, wSum = 0
  for (const r of COHERENCE_RULES) {
    if (answers[r.a] == null || answers[r.b] == null) continue
    const w = r.weight ?? 1
    const p = r.penalty(answers[r.a], answers[r.b])
    penSum += p * w; wSum += w
    if (p >= 0.75) flags.push(`Incohérence : ${r.label}`)
  }
  const coherence = wSum > 0 ? 1 - penSum / wSum : 1

  // 3 — désirabilité sociale
  let flatter = 0, flatterTotal = 0
  for (const d of DESIRABILITY) {
    if (answers[d.q] == null) continue
    flatterTotal++
    if (d.flattering.includes(answers[d.q])) flatter++
  }
  const flatterRatio = flatterTotal > 0 ? flatter / flatterTotal : 0
  // au-delà de 70% d'options flatteuses, on pénalise progressivement
  const desirability = flatterRatio <= 0.7 ? 1 : 1 - (flatterRatio - 0.7) / 0.3
  if (flatterTotal >= 3 && flatterRatio >= 0.9) flags.push('Profil « trop parfait » (désirabilité sociale élevée)')

  // 4a — straight-lining (peu de variété dans les réponses)
  const values = keys.map(k => answers[k])
  const distinct = new Set(values).size
  const variety = keys.length >= 6 ? Math.min(1, distinct / Math.max(4, keys.length * 0.35)) : 1
  if (keys.length >= 10 && distinct <= 2) flags.push('Réponses quasi identiques (straight-lining)')

  // 4b — rythme (temps de réponse)
  let pace = 0.85
  if (timings && keys.length > 0) {
    const t = keys.map(k => timings[k]).filter(v => typeof v === 'number' && v > 0).sort((a, b) => a - b)
    if (t.length >= 5) {
      const median = t[Math.floor(t.length / 2)]
      const fast = t.filter(v => v < FAST_MS).length / t.length
      pace = 1
      if (median < MIN_MEDIAN_MS) pace -= (MIN_MEDIAN_MS - median) / MIN_MEDIAN_MS * 0.6
      pace -= fast * 0.4
      pace = Math.max(0, Math.min(1, pace))
      if (fast > 0.5 || median < FAST_MS) flags.push('Questionnaire bâclé (réponses trop rapides)')
    }
  }

  // Pondération finale
  const score01 = coherence * 0.45 + desirability * 0.2 + variety * 0.15 + pace * 0.2
  const score = Math.round(score01 * 100)
  const band: SincerityResult['band'] = score >= 78 ? 'haute' : score >= 55 ? 'moyenne' : 'à vérifier'

  return {
    score,
    coherent: score >= 78,
    band,
    signals: { coherence, desirability, variety, pace },
    flags,
  }
}
