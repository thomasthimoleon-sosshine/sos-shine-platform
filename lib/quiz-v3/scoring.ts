import type { Answers, Dim, DimScores, V3Profile } from './types'
import { QUESTIONS } from './questions'

function dominant(scores: Record<string, number>): string {
  let best = '', bestPts = -1
  for (const [k, v] of Object.entries(scores)) {
    if (v > bestPts) { bestPts = v; best = k }
  }
  return best
}

function topN(scores: Record<string, number>, n: number): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .filter(([, v]) => v > 0)
    .map(([k]) => k)
}

export function calculateProfile(answers: Answers, firstName: string, email: string, birthdate?: string, topProtocolTitle?: string, topProtocolSlug?: string): V3Profile {
  // Accumulate dimension sub-scores
  const dimScores: DimScores = {
    ARCH: {}, MF: {}, PAR: {}, COND: {}, ATT: {}, SOMA: {},
    CORPS: {}, ENF: {}, SPI: {}, ENE: {}, TGEN: {}, PHASE: {},
  }

  for (const q of QUESTIONS) {
    const ans = answers[q.id]
    if (!ans) continue
    const choice = q.choices.find(c => c.key === ans)
    if (!choice) continue
    for (const w of choice.weights) {
      const d = dimScores[w.dim]
      d[w.sub] = (d[w.sub] || 0) + w.pts
    }
  }

  // Derive dominant values per dimension
  const arch = dominant(dimScores.ARCH) || 'analyste'
  const attachmentStyle = dominant(dimScores.ATT) || 'anxieux'

  // SPI level
  const spiScores = dimScores.SPI
  const spiLevel = spiScores['élevée'] >= (spiScores['moyenne'] || 0) && spiScores['élevée'] >= (spiScores['faible'] || 0) && spiScores['élevée'] >= (spiScores['fermée'] || 0)
    ? 'élevée'
    : spiScores['moyenne'] >= (spiScores['faible'] || 0) && spiScores['moyenne'] >= (spiScores['fermée'] || 0)
      ? 'moyenne'
      : spiScores['fermée'] >= (spiScores['faible'] || 0)
        ? 'fermée'
        : 'faible'

  // ENE level
  const eneScores = dimScores.ENE
  const eneLevel = dominant(eneScores) || 'moyenne'

  const phase = dominant(dimScores.PHASE) || 'reconstruction'

  // PAR — separate père / mère
  const parScores = dimScores.PAR
  const pereSubs = Object.entries(parScores).filter(([k]) => k.startsWith('père')).sort((a, b) => b[1] - a[1])
  const mereSubs = Object.entries(parScores).filter(([k]) => k.startsWith('mère')).sort((a, b) => b[1] - a[1])
  const parentalPere = pereSubs[0]?.[0]?.replace('père ', '') || 'peu présent'
  const parentalMere = mereSubs[0]?.[0]?.replace('mère ', '') || 'distante'

  // SOMA — top 3 zones
  const somaZones = topN(dimScores.SOMA, 3)

  // CORPS rapport
  const corpsRapport = dominant(dimScores.CORPS) || 'déconnecté'

  // ENF type
  const enfanceType = dominant(dimScores.ENF) || 'ordinaire'

  // TGEN level
  const tgenScores = dimScores.TGEN
  const tgenLevel = tgenScores['élevée'] >= (tgenScores['moyenne'] || 0) ? 'élevée' : tgenScores['moyenne'] >= (tgenScores['faible'] || 0) ? 'moyenne' : 'faible'

  // MF dominant
  const mfDominant = dominant(dimScores.MF) || 'équilibré'

  // Top 3 conditionnements
  const conditionnements = topN(dimScores.COND, 3)

  // Q40 desire — map answer to text
  const q40 = QUESTIONS.find(q => q.id === 'Q40')
  const q40Answer = answers['Q40']
  const q40Desire = q40?.choices.find(c => c.key === q40Answer)?.label || 'se transformer'

  return {
    firstName,
    email,
    birthdate,
    answers,
    dimScores,
    archetype: arch,
    attachmentStyle,
    spiritualLevel: spiLevel,
    energyLevel: eneLevel,
    phase,
    parentalPere,
    parentalMere,
    somaZones,
    corpsRapport,
    enfanceType,
    tgenLevel,
    mfDominant,
    conditionnements,
    q40Desire,
    topProtocolTitle,
    topProtocolSlug,
  }
}
