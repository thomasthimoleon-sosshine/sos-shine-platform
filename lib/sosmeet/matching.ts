/**
 * SOS Meet — Profil de compatibilité + matching par paire.
 * Trois mécaniques : similarité (dimensions), préférences (ce que je cherche),
 * filtres durs (enfants, exclusivité). Réponses = { qid: index d'option | nombre }.
 */
import { ESSENTIEL, type Dimension, type Question } from './essentiel'

export type Answers = Record<string, number>

const BY_ID: Record<string, Question> = Object.fromEntries(ESSENTIEL.map(q => [q.id, q]))

export type Profile = {
  dimensions: Partial<Record<Dimension, number>>  // 0..100
  filters: {
    age?: number
    kids?: number          // index q131
    exclusivite?: number   // index q134
    exclusivite2?: number  // index q104
    wantSpiritual?: number // index q149
    wantMaturity?: number  // index q144
  }
  answered: number
}

/** Construit le profil scoré d'une personne à partir de ses réponses. */
export function computeProfile(answers: Answers): Profile {
  const acc: Partial<Record<Dimension, { sum: number; w: number }>> = {}
  const filters: Profile['filters'] = {}
  let answered = 0

  for (const q of ESSENTIEL) {
    const raw = answers[q.id]
    if (raw == null) continue
    answered++

    if (q.role === 'filter' || q.role === 'preference') {
      if (q.filterKey) (filters as Record<string, number>)[q.filterKey] = raw
      continue
    }
    if (q.role === 'similarity' && q.dimension && q.choices) {
      const v = q.choices[raw]?.value
      if (typeof v !== 'number') continue
      const w = q.weight ?? 1
      const cur = acc[q.dimension] || { sum: 0, w: 0 }
      cur.sum += v * w; cur.w += w
      acc[q.dimension] = cur
    }
  }

  const dimensions: Partial<Record<Dimension, number>> = {}
  for (const [dim, v] of Object.entries(acc)) {
    if (v && v.w > 0) dimensions[dim as Dimension] = Math.round(v.sum / v.w)
  }
  return { dimensions, filters, answered }
}

// Poids relatifs des dimensions dans le score de compatibilité.
const DIM_WEIGHT: Record<Dimension, number> = {
  intentions: 1.5, engagement: 1.3, securite: 1.2, valeurs: 1.1, spiritualite: 1.1,
  sexualite: 1.0, independance: 0.9, lifestyle: 0.7, social: 0.7,
}

export type Compatibility = {
  score: number                 // 0..100
  blocked: boolean              // filtre dur rédhibitoire
  reasons: string[]             // points forts
  frictions: string[]          // points de friction
}

/** Compatibilité entre deux profils déjà scorés. */
export function compatibility(a: Profile, b: Profile): Compatibility {
  const reasons: string[] = []
  const frictions: string[] = []

  // ── Filtres durs ──
  let blocked = false
  // Enfants : « oui clairement » (0) vs « non » (2) ou « déjà parent, pas plus » (4)
  const ka = a.filters.kids, kb = b.filters.kids
  if ((ka === 0 && (kb === 2 || kb === 4)) || (kb === 0 && (ka === 2 || ka === 4))) {
    blocked = true; frictions.push('Désaccord profond sur le projet d’enfants')
  }
  // Exclusivité : monogamie stricte (0) vs non-monogame (q104 idx 3)
  const exA = a.filters.exclusivite, exB = b.filters.exclusivite
  const nmA = a.filters.exclusivite2 === 3, nmB = b.filters.exclusivite2 === 3
  if ((exA === 0 && nmB) || (exB === 0 && nmA)) {
    blocked = true; frictions.push('Visions incompatibles de l’exclusivité')
  }

  // ── Similarité des dimensions ──
  let sum = 0, wsum = 0
  const dims = new Set([...Object.keys(a.dimensions), ...Object.keys(b.dimensions)]) as Set<Dimension>
  for (const d of dims) {
    const va = a.dimensions[d], vb = b.dimensions[d]
    if (va == null || vb == null) continue
    const closeness = 100 - Math.abs(va - vb)
    const w = DIM_WEIGHT[d]
    sum += closeness * w; wsum += w
    if (closeness >= 82) reasons.push(DIM_LABEL[d])
    else if (closeness <= 45) frictions.push(DIM_FRICTION[d])
  }
  let score = wsum > 0 ? sum / wsum : 50

  // ── Préférences (ce que l'un cherche chez l'autre) ──
  // Spiritualité voulue (q149 idx 0 = important) mais partenaire peu spirituel
  const applyPref = (self: Profile, other: Profile) => {
    if (self.filters.wantSpiritual === 0 && (other.dimensions.spiritualite ?? 50) < 45) {
      score -= 12; frictions.push('Attente de spiritualité non rencontrée')
    }
    if (self.filters.wantMaturity === 0) {
      const mat = Math.min(other.dimensions.securite ?? 60, other.dimensions.valeurs ?? 60)
      if (mat < 50) { score -= 10; frictions.push('Maturité émotionnelle recherchée non rencontrée') }
    }
  }
  applyPref(a, b); applyPref(b, a)

  score = Math.max(0, Math.min(100, Math.round(score)))
  if (blocked) score = Math.min(score, 20)

  return {
    score, blocked,
    reasons: dedupe(reasons).slice(0, 4),
    frictions: dedupe(frictions).slice(0, 4),
  }
}

const DIM_LABEL: Record<Dimension, string> = {
  intentions: 'Mêmes intentions', engagement: 'Même rythme d’engagement', securite: 'Sécurité émotionnelle alignée',
  independance: 'Besoin d’espace compatible', spiritualite: 'Chemin intérieur commun', sexualite: 'Rapport à l’intimité proche',
  lifestyle: 'Mêmes rythmes de vie', social: 'Vie sociale accordée', valeurs: 'Valeurs proches',
}
const DIM_FRICTION: Record<Dimension, string> = {
  intentions: 'Intentions divergentes', engagement: 'Rythmes d’engagement différents', securite: 'Sécurités émotionnelles éloignées',
  independance: 'Besoins d’espace différents', spiritualite: 'Chemins intérieurs éloignés', sexualite: 'Rapports à l’intimité différents',
  lifestyle: 'Rythmes de vie différents', social: 'Vies sociales décalées', valeurs: 'Valeurs éloignées',
}
function dedupe(a: string[]): string[] { return [...new Set(a)] }
