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

import { ALL_QUESTIONS } from './paliers'

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

  // ══ Palier « Le lien » ══════════════════════════════════════════════════
  // Dit tout dire calmement, mais garde tout pour soi.
  {
    id: 'dit_vs_tait', a: 'q201', b: 'q202',
    label: 'Dit exprimer ses blessures aussitôt mais se décrit comme pudique',
    // q201: 0 = je le dis vite · q202: 2 = pudique
    penalty: clash([0], [2]),
  },
  // Sait demander, mais attend qu'on devine.
  {
    id: 'demande_vs_devine', a: 'q205', b: 'q201',
    label: 'Se dit à l’aise pour demander mais rumine sans rien dire',
    weight: 0.9,
    // q205: 0 = je sais demander · q201: 3 = je garde pour moi
    penalty: clash([0], [3]),
  },
  // Reste et parle jusqu'au bout, mais met plusieurs jours à revenir.
  {
    id: 'reste_vs_boude', a: 'q206', b: 'q207',
    label: 'Dit rester pour parler mais met plusieurs jours à revenir',
    // q206: 0 = rester et parler · q207: 3 = plusieurs jours
    penalty: clash([0], [3]),
  },
  // Ne s'emporte jamais… mais son réflexe est de hausser le ton.
  {
    id: 'calme_vs_ton', a: 'q210', b: 'q206',
    label: 'Se dit incapable de s’emporter mais hausse le ton en dispute',
    // q210: 3 = jamais · q206: 3 = hausser le ton
    penalty: clash([3], [3]),
  },
  // Jalousie quasi absente mais besoin d'être rassuré·e en permanence.
  {
    id: 'jalousie_vs_rassurance', a: 'q212', b: 'q213',
    label: 'Se dit sans jalousie mais a besoin d’être rassuré·e en permanence',
    weight: 0.9,
    // q212: 3 = quasi absente · q213: 0 = oui souvent
    penalty: clash([3], [0]),
  },
  // « Sécure » (Essentiel) mais envie de fuir dès que ça devient sérieux.
  {
    id: 'secure_vs_fuite', a: 'q83', b: 'q214',
    label: 'Se dit « sécure » mais veut fuir dès qu’une relation devient sérieuse',
    // q83: 0 = sécure · q214: 2 = envie de fuir
    penalty: clash([0], [2]),
  },
  // Confiance immédiate mais méfiance dès que ça s'engage.
  {
    id: 'confiance_vs_mefiance', a: 'q215', b: 'q214',
    label: 'Dit faire confiance d’emblée mais réagit par la méfiance',
    weight: 0.8,
    // q215: 0 = d'emblée · q214: 3 = méfiance
    penalty: clash([0], [3]),
  },
  // Veut vivre ensemble très vite (Essentiel) mais cache ses relations à ses proches.
  {
    id: 'emmenager_vs_cacher', a: 'q133', b: 'q217',
    label: 'Veut vivre ensemble très vite mais présente ses partenaires le plus tard possible',
    weight: 0.8,
    // q133: 0 = vivre ensemble vite · q217: 3 = le plus tard possible
    penalty: clash([0], [3]),
  },
  // Se projette très vite mais refuse tout engagement formel et vit au présent.
  {
    id: 'projection_vs_present', a: 'q219', b: 'q148',
    label: 'Dit se projeter très vite mais ne sait pas quel engagement il·elle cherche',
    weight: 0.6,
    // q219: 0 = oui très vite · q148: 3 = je ne sais pas encore
    penalty: clash([0], [3]),
  },

  // ══ Palier « La vie » ═══════════════════════════════════════════════════
  // Famille centrale mais ne veut pas que l'autre s'en approche.
  {
    id: 'famille_vs_integration', a: 'q301', b: 'q302',
    label: 'Famille décrite comme centrale mais refuse d’y intégrer son/sa partenaire',
    weight: 0.8,
    // q301: 0 = centrale · q302: 3 = non je sépare
    penalty: clash([0], [3]),
  },
  // Épargne et prévoit, mais l'argent est un sujet difficile et incontrôlé.
  {
    id: 'epargne_vs_depense', a: 'q306', b: 'q307',
    label: 'Se dit prévoyant·e mais ne veut aucune mise en commun ni discussion',
    weight: 0.5,
    penalty: clash([0], [2]),
  },
  // Ne fume jamais mais juge le tabac indifférent parce qu'« il·elle fume aussi ».
  {
    id: 'tabac_incoherent', a: 'q315', b: 'q316',
    label: 'Déclare ne jamais fumer mais répond « je fume aussi »',
    // q315: 0 = jamais · q316: 3 = je fume aussi
    penalty: clash([0], [3]),
  },
  // Sport presque tous les jours mais ne sort jamais et déteste bouger.
  {
    id: 'sport_vs_sedentaire', a: 'q317', b: 'q319',
    label: 'Sport quotidien déclaré mais ne quitte jamais son domicile',
    weight: 0.4,
    penalty: clash([0], [3]),
  },
  // Va spontanément vers les gens mais n'a aucun ami proche et fuit les soirées.
  {
    id: 'sociable_vs_isole', a: 'q320', b: 'q321',
    label: 'Se décrit très sociable mais déclare n’avoir aucun ami proche',
    weight: 0.6,
    penalty: clash([0], [3]),
  },
  // Écologie structurante mais rythme de vie qui la contredit frontalement.
  {
    id: 'ecolo_vs_voyages', a: 'q313', b: 'q319',
    label: 'Écologie décrite comme structurante mais voyages très fréquents',
    weight: 0.3,
    penalty: clash([0], [0]),
  },

  // ══ Palier « L'intime » ═════════════════════════════════════════════════
  // Parle très librement de sexualité mais n'ose rien dire de ses envies.
  {
    id: 'parle_vs_ose', a: 'q403', b: 'q404',
    label: 'Dit parler très librement de sexualité mais n’ose pas dire ce qu’il·elle aime',
    // q403: 0 = très librement · q404: 3 = non
    penalty: clash([0], [3]),
  },
  // Désir très fréquent mais peut s'en passer très longtemps sans que ça compte.
  {
    id: 'desir_vs_abstinence', a: 'q401', b: 'q407',
    label: 'Déclare un désir très fréquent mais dit pouvoir s’en passer indéfiniment',
    weight: 0.8,
    penalty: clash([0], [3]),
  },
  // Aucune pudeur revendiquée mais rapport au corps très difficile.
  {
    id: 'pudeur_vs_corps', a: 'q410', b: 'q409',
    label: 'Se dit sans pudeur mais décrit un rapport très difficile à son corps',
    weight: 0.6,
    penalty: clash([0], [3]),
  },
  // L'intimité ne fait pas peur, mais la sexualité est déclarée essentielle
  // ET l'attachement est désorganisé — signal faible, poids réduit.
  {
    id: 'intimite_vs_peur', a: 'q412', b: 'q214',
    label: 'Dit n’avoir aucune peur de l’intimité mais veut fuir dès que ça devient sérieux',
    weight: 0.7,
    // q412: 0 = non · q214: 2 = envie de fuir
    penalty: clash([0], [2]),
  },
  // Sexualité « très importante » (Essentiel) mais désir déclaré très rare.
  {
    id: 'sexe_important_vs_desir_rare', a: 'q96', b: 'q401',
    label: 'Dit la sexualité très importante mais déclare un désir très rare',
    weight: 0.9,
    // q96: 0 = très importante · q401: 3 = peu
    penalty: clash([0], [3]),
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
  ...ALL_QUESTIONS.filter(q => q.desirable && q.desirable.length)
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
