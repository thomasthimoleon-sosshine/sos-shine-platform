/**
 * SOS Meet — Profil de compatibilité + matching par paire.
 * Trois mécaniques : similarité (dimensions), préférences (ce que je cherche),
 * filtres durs (enfants, exclusivité). Réponses = { qid: index d'option | nombre }.
 */
import { type Dimension, type Question } from './essentiel'
import { ALL_QUESTIONS, depth } from './paliers'

export type Answers = Record<string, number>

const BY_ID: Record<string, Question> = Object.fromEntries(ALL_QUESTIONS.map(q => [q.id, q]))

export type Profile = {
  dimensions: Partial<Record<Dimension, number>>  // 0..100
  filters: {
    age?: number
    kids?: number          // index q131
    exclusivite?: number   // index q134
    exclusivite2?: number  // index q104
    wantSpiritual?: number // index q149
    wantMaturity?: number  // index q144
    // ── palier « Le lien » ──
    mobility?: number        // q220 — prêt·e à déménager
    // ── palier « La vie » ──
    pets?: number            // q305 — animaux
    faith?: number           // q311 — rapport à la foi
    smoking?: number         // q315 — tabac
    wantSameFaith?: number   // q312 — l'autre doit partager mes convictions
    wantSmokeFree?: number   // q316 — le tabac chez l'autre
    wantAmbition?: number    // q309 — ambition chez l'autre
    wantFamilyClose?: number // q302 — intégration à ma famille
  }
  answered: number
  /** Profondeur du profil 0..100 (paliers franchis) — sert à nuancer la confiance. */
  depth?: number
}

/** Construit le profil scoré d'une personne à partir de ses réponses. */
export function computeProfile(answers: Answers): Profile {
  const acc: Partial<Record<Dimension, { sum: number; w: number }>> = {}
  const filters: Profile['filters'] = {}
  let answered = 0

  for (const q of ALL_QUESTIONS) {
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
  return { dimensions, filters, answered, depth: depth(answers) }
}

// Poids relatifs des dimensions dans le score de compatibilité.
const DIM_WEIGHT: Record<Dimension, number> = {
  intentions: 1.5, engagement: 1.3, securite: 1.2, valeurs: 1.1, spiritualite: 1.1,
  sexualite: 1.0, independance: 0.9, lifestyle: 0.7, social: 0.7,
  // Paliers d'approfondissement : la façon de se parler et de se réparer
  // pèse autant que les intentions — c'est là que les couples tiennent ou cassent.
  communication: 1.4, conflit: 1.4, famille: 1.0, materiel: 0.9,
}

export type Compatibility = {
  score: number                 // 0..100
  blocked: boolean              // filtre dur rédhibitoire
  reasons: string[]             // points forts
  frictions: string[]          // points de friction
  /** Profondeur commune 0..100 : plus les deux se sont dévoilés, plus le score est fiable. */
  depth?: number
  /** Nombre de dimensions réellement comparées (les deux ont répondu). */
  compared?: number
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

  // ── Filtres durs des paliers d'approfondissement ──
  // Foi : l'un exige de partager les convictions (q312 « indispensable »),
  // l'autre est agnostique ou athée (q311 idx 3-4).
  const faithClash = (self: Profile, other: Profile) =>
    self.filters.wantSameFaith === 0 &&
    self.filters.faith != null && other.filters.faith != null &&
    [3, 4].includes(other.filters.faith) && [0, 1].includes(self.filters.faith)
  if (faithClash(a, b) || faithClash(b, a)) {
    blocked = true; frictions.push('Convictions religieuses inconciliables')
  }
  // Tabac : rédhibitoire pour l'un (q316 idx 0), quotidien chez l'autre (q315 idx 2).
  const smokeClash = (self: Profile, other: Profile) =>
    self.filters.wantSmokeFree === 0 && other.filters.smoking === 2
  if (smokeClash(a, b) || smokeClash(b, a)) {
    blocked = true; frictions.push('Le tabac est rédhibitoire pour l’un des deux')
  }
  // Animaux : allergie ou refus net (q305 idx 3) face à quelqu'un qui y tient (idx 0).
  const petClash = (self: Profile, other: Profile) =>
    self.filters.pets === 3 && other.filters.pets === 0
  if (petClash(a, b) || petClash(b, a)) {
    blocked = true; frictions.push('Animaux : allergie ou refus d’un côté, attachement de l’autre')
  }

  // ── Similarité des dimensions ──
  let sum = 0, wsum = 0, compared = 0
  const dims = new Set([...Object.keys(a.dimensions), ...Object.keys(b.dimensions)]) as Set<Dimension>
  for (const d of dims) {
    const va = a.dimensions[d], vb = b.dimensions[d]
    if (va == null || vb == null) continue
    compared++
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
    // Ambition professionnelle attendue (q309 « important ») non rencontrée.
    if (self.filters.wantAmbition === 0 && (other.dimensions.materiel ?? 55) < 45) {
      score -= 9; frictions.push('Ambition professionnelle attendue non rencontrée')
    }
    // Famille : l'un veut que l'autre s'intègre (q302 « essentiel »), l'autre est distant des siens.
    if (self.filters.wantFamilyClose === 0 && (other.dimensions.famille ?? 55) < 40) {
      score -= 8; frictions.push('Places de la famille très différentes')
    }
    // Tabac : simple préférence (q316 « je préférerais que non »), fumeur quotidien en face.
    if (self.filters.wantSmokeFree === 1 && other.filters.smoking === 2) {
      score -= 8; frictions.push('Tabac quotidien alors que l’autre préférerait non')
    }
    // Foi : préférence (q312 « je préférerais ») et convictions différentes.
    if (self.filters.wantSameFaith === 1 &&
        self.filters.faith != null && other.filters.faith != null &&
        self.filters.faith !== other.filters.faith) {
      score -= 6; frictions.push('Rapports à la foi différents')
    }
  }
  applyPref(a, b); applyPref(b, a)

  // Mobilité : deux personnes également enracinées ne bougeront ni l'une ni l'autre.
  // Ce n'est pas rédhibitoire (elles peuvent être voisines) — juste à dire.
  if (a.filters.mobility === 3 && b.filters.mobility === 3) {
    score -= 5; frictions.push('Aucun des deux ne se voit déménager')
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  if (blocked) score = Math.min(score, 20)

  return {
    score, blocked,
    reasons: dedupe(reasons).slice(0, 4),
    frictions: dedupe(frictions).slice(0, 4),
    depth: Math.round(Math.min(a.depth ?? 0, b.depth ?? 0)),
    compared,
  }
}

const DIM_LABEL: Record<Dimension, string> = {
  intentions: 'Mêmes intentions', engagement: 'Même rythme d’engagement', securite: 'Sécurité émotionnelle alignée',
  independance: 'Besoin d’espace compatible', spiritualite: 'Chemin intérieur commun', sexualite: 'Rapport à l’intimité proche',
  lifestyle: 'Mêmes rythmes de vie', social: 'Vie sociale accordée', valeurs: 'Valeurs proches',
  communication: 'Vous vous parlez de la même façon', conflit: 'Même façon de traverser les disputes',
  famille: 'Même place donnée à la famille', materiel: 'Même rapport au travail et à l’argent',
}
const DIM_FRICTION: Record<Dimension, string> = {
  intentions: 'Intentions divergentes', engagement: 'Rythmes d’engagement différents', securite: 'Sécurités émotionnelles éloignées',
  independance: 'Besoins d’espace différents', spiritualite: 'Chemins intérieurs éloignés', sexualite: 'Rapports à l’intimité différents',
  lifestyle: 'Rythmes de vie différents', social: 'Vies sociales décalées', valeurs: 'Valeurs éloignées',
  communication: 'Façons de se dire les choses très différentes', conflit: 'Façons de se disputer incompatibles',
  famille: 'Places de la famille différentes', materiel: 'Rapports au travail et à l’argent différents',
}
function dedupe(a: string[]): string[] { return [...new Set(a)] }
