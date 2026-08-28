/**
 * SOS Meet Couple, le rapport complet.
 * Assemble le croisement des réponses, la lecture écrite, et la couche
 * énergétique quand les dates de naissance sont disponibles.
 *
 * ORDRE DE LECTURE, qui est une décision produit : ce qui tient d'abord,
 * les blocages ensuite, l'énergétique en dernier. Les failles viennent
 * TOUJOURS des réponses. La couche énergétique éclaire, elle ne diagnostique
 * jamais : aucune faille n'est détectée par une position planétaire.
 */
import { buildCrossing, type Crossing } from './crossing'
import { buildNarrative, type Narrative } from './narrative'
import { buildEnergetique, type Energetique, type Naissance } from './energetics'
import type { CoupleAnswers } from './types'

export const ENGINE_VERSION = '1.0.0'

export type CoupleReport = {
  engineVersion: string
  crossing: Crossing
  narrative: Narrative
  energetique: Energetique | null
  /** Vrai quand la couche énergétique manque, avec la raison. */
  energetiqueAbsente: string | null
}

export function buildCoupleReport(
  answersA: CoupleAnswers,
  answersB: CoupleAnswers,
  opts: { prenomA?: string; prenomB?: string; naissanceA?: Naissance | null; naissanceB?: Naissance | null } = {},
): CoupleReport {
  const crossing = buildCrossing(answersA, answersB)
  const narrative = buildNarrative(crossing, opts.prenomA, opts.prenomB)

  let energetique: Energetique | null = null
  let energetiqueAbsente: string | null = null
  if (opts.naissanceA?.date && opts.naissanceB?.date) {
    energetique = buildEnergetique(opts.naissanceA, opts.naissanceB)
  } else {
    energetiqueAbsente = 'La lecture énergétique demande les deux dates de naissance, et le consentement de chacun.'
  }

  return { engineVersion: ENGINE_VERSION, crossing, narrative, energetique, energetiqueAbsente }
}
