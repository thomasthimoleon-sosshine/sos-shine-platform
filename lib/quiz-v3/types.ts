export type Dim = 'ARCH' | 'MF' | 'PAR' | 'COND' | 'ATT' | 'SOMA' | 'CORPS' | 'ENF' | 'SPI' | 'ENE' | 'TGEN' | 'PHASE'

export type Weight = { dim: Dim; sub: string; pts: number }

export type Choice = {
  key: 'A' | 'B' | 'C' | 'D'
  label: string
  weights: Weight[]
}

export type Question = {
  id: string
  phase: 1 | 2 | 3 | 4 | 5
  text: string
  choices: Choice[]
}

export type Answers = Record<string, 'A' | 'B' | 'C' | 'D'>

export type DimScores = Record<Dim, Record<string, number>>

export type V3Profile = {
  firstName: string
  email: string
  birthdate?: string
  answers: Answers
  dimScores: DimScores
  archetype: string
  attachmentStyle: string
  spiritualLevel: string
  energyLevel: string
  phase: string
  parentalPere: string
  parentalMere: string
  somaZones: string[]
  corpsRapport: string
  enfanceType: string
  tgenLevel: string
  mfDominant: string
  conditionnements: string[]
  q40Desire: string
  topProtocolTitle?: string
  topProtocolSlug?: string
}
