import { QUESTIONS, DIMENSIONS, type DimensionKey } from './questions'

export type Answers = Record<string, number> // questionId -> value 0..100

/**
 * Calcule un score 0..100 par dimension (moyenne des réponses de la dimension).
 * Ce vecteur servira de base au futur algorithme de compatibilité.
 */
export function computeScores(answers: Answers): Record<DimensionKey, number> {
  const acc: Record<string, { sum: number; n: number }> = {}
  for (const q of QUESTIONS) {
    const v = answers[q.id]
    if (typeof v !== 'number') continue
    if (!acc[q.dim]) acc[q.dim] = { sum: 0, n: 0 }
    acc[q.dim].sum += v
    acc[q.dim].n += 1
  }
  const out = {} as Record<DimensionKey, number>
  for (const d of DIMENSIONS) {
    const a = acc[d.key]
    out[d.key] = a && a.n > 0 ? Math.round(a.sum / a.n) : 0
  }
  return out
}

export function answeredCount(answers: Answers): number {
  return QUESTIONS.filter((q) => typeof answers[q.id] === 'number').length
}
