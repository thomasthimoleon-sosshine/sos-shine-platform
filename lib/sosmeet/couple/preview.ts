/**
 * SOS Meet Couple — le couple d'exemple.
 * Sert UNIQUEMENT à se projeter sur le rendu du livrable avant d'avoir de
 * vrais couples. Les réponses sont fabriquées, jamais présentées comme
 * réelles, et la page d'aperçu le dit en haut.
 *
 * Le scénario choisi est le plus instructif : Camille va bien, Alex ne va
 * pas bien sur trois dimensions, et Camille ne s'en doute pas. C'est le
 * malentendu que le moteur est fait pour attraper.
 */
import { COUPLE_QUESTIONS, QUESTIONS_BY_ID } from './questionnaire'
import { buildCoupleReport, type CoupleReport } from './report'
import type { Dimension } from './types'

/** L'index d'option dont la valeur est la plus proche de la cible. */
function proche(qid: string, cible: number): number {
  const q = QUESTIONS_BY_ID[qid]
  if (!q?.choices) return 0
  let best = 0, d = Infinity
  q.choices.forEach((c, i) => { const e = Math.abs((c.value ?? 50) - cible); if (e < d) { d = e; best = i } })
  return best
}

function repondant(parDimension: Partial<Record<Dimension, number>>, defaut: number) {
  const a: Record<string, number> = {}
  for (const q of COUPLE_QUESTIONS) {
    if (q.type === 'text') continue
    if (q.nature === 'safety') { a[q.id] = proche(q.id, 100); continue }  // aucun signal
    const cible = q.dimension ? parDimension[q.dimension] ?? defaut : defaut
    a[q.id] = proche(q.id, cible)
  }
  return a
}

const SOLIDE: Partial<Record<Dimension, number>> = {
  responsivite: 85, communication: 80, conflit: 80, reparation: 85, admiration: 90,
  intimite: 80, desir: 78, securite: 85, equite: 70, projet: 85, autonomie: 75,
  rancoeur: 85, valeurs: 85, respect: 90,
}
// Alex vit trois dimensions bien plus mal, et Camille ne le voit pas.
const EN_SOUFFRANCE: Partial<Record<Dimension, number>> = {
  ...SOLIDE, responsivite: 25, intimite: 30, desir: 20, equite: 40,
}

export function previewReport(): CoupleReport {
  const camille = repondant(SOLIDE, 78)
  const alex = repondant(EN_SOUFFRANCE, 70)
  return buildCoupleReport(camille, alex, {
    prenomA: 'Camille', prenomB: 'Alex',
    naissanceA: { date: '1990-05-15', heure: '10:30', lat: 43.6047, lon: 1.4442 },
    naissanceB: { date: '1985-11-02', heure: '21:15', lat: 48.8566, lon: 2.3522 },
  })
}
