/**
 * SOS Meet Couple, les types partagés du parcours « Se retrouver ».
 * Aucune dépendance : ce fichier est lisible côté client comme côté serveur.
 */

// ── Cycle de vie du duo ────────────────────────────────────────────────────
export const COUPLE_STATUS = [
  'INVITATION_ENVOYEE',      // A a créé le duo, B n'a pas encore rejoint
  'DUO_FORME',               // les deux comptes sont liés
  'EN_COURS',                // au moins un questionnaire commencé
  'ATTENTE_PARTENAIRE',      // un seul a scellé
  'QUESTIONNAIRES_COMPLETS', // les deux ont scellé
  'PROFILAGE_EN_COURS',      // l'équipe a ouvert le dossier
  'PROFILAGE_VALIDE',        // les deux profils sont posés
  'CALCUL_EN_COURS',         // le moteur tourne
  'DIAGNOSTIC_PRET',         // la carte est lisible par les deux
  'SUSPENDU_VIGILANCE',      // signaux de danger, aucune carte publiée
  'ARCHIVE',
] as const
export type CoupleStatus = (typeof COUPLE_STATUS)[number]

/** Un statut n'avance jamais tout seul vers l'arrière. Seule l'équipe le peut. */
export const STATUS_RANK: Record<CoupleStatus, number> = {
  INVITATION_ENVOYEE: 0, DUO_FORME: 1, EN_COURS: 2, ATTENTE_PARTENAIRE: 3,
  QUESTIONNAIRES_COMPLETS: 4, PROFILAGE_EN_COURS: 5, PROFILAGE_VALIDE: 6,
  CALCUL_EN_COURS: 7, DIAGNOSTIC_PRET: 8,
  SUSPENDU_VIGILANCE: 99, ARCHIVE: 100,
}

// ── Les dimensions mesurées ────────────────────────────────────────────────
// Chacune est adossée à un construit établi de la recherche sur le couple.
export const DIMENSIONS = [
  'responsivite',   // se sentir compris, validé, pris en compte (Reis, Gable)
  'communication',  // exprimer un besoin sans attaquer, démarrage doux (Gottman)
  'conflit',        // critique, mépris, défensive, retrait (Gottman)
  'reparation',     // savoir revenir après, réparer, pardonner
  'admiration',     // estime et fierté, l'inverse du mépris
  'intimite',       // proximité émotionnelle, se confier
  'desir',          // désir, initiative, accord sur la fréquence
  'securite',       // attachement : anxiété d'abandon, évitement (Bowlby, Johnson)
  'equite',         // répartition des tâches et charge mentale
  'projet',         // vision partagée, investissement (Rusbult)
  'autonomie',      // espace individuel, identité propre
  'rancoeur',       // ce qui s'est accumulé, les blessures non refermées
  'valeurs',        // ce sur quoi on ne transige pas
  'respect',        // considération, l'inverse du contrôle
] as const
export type Dimension = (typeof DIMENSIONS)[number]

export const DIMENSION_LABEL: Record<Dimension, string> = {
  responsivite: 'Se sentir entendu', communication: 'Se parler', conflit: 'Se disputer',
  reparation: 'Revenir après', admiration: 'Le regard porté sur l’autre', intimite: 'La proximité',
  desir: 'Le désir', securite: 'La sécurité du lien', equite: 'L’équité du quotidien',
  projet: 'Le projet commun', autonomie: 'L’espace de chacun', rancoeur: 'Ce qui s’est accumulé',
  valeurs: 'Les valeurs', respect: 'Le respect',
}

/**
 * Poids dans le score d'impact. Fondé sur ce que la recherche identifie comme
 * le plus prédictif de la rupture : le mépris et l'absence de réparation
 * pèsent davantage qu'un désaccord sur les tâches ménagères.
 */
export const DIMENSION_WEIGHT: Record<Dimension, number> = {
  admiration: 1.6, reparation: 1.5, conflit: 1.4, responsivite: 1.4, securite: 1.3,
  respect: 1.3, rancoeur: 1.2, communication: 1.2, intimite: 1.1, desir: 1.0,
  valeurs: 1.0, projet: 0.9, equite: 0.9, autonomie: 0.7,
}

// ── Les questions ──────────────────────────────────────────────────────────
export type QuestionNature =
  | 'self'       // comment JE vis cette dimension
  | 'perceived'  // comment je crois que MON PARTENAIRE la vit
  | 'open'       // texte libre, ne sort jamais vers l'autre (invariant I1)
  | 'safety'     // item de vigilance, jamais affiché dans le livrable commun
  | 'info'

export type CoupleChoice = { label: string; value: number }  // value 0..100, 100 = sain

export type CoupleQuestion = {
  id: string
  section: string
  nature: QuestionNature
  text: string
  type: 'scale' | 'choice' | 'text'
  choices?: CoupleChoice[]
  dimension?: Dimension
  /** Relie une question « moi » à sa jumelle « l'autre » sur le même construit. */
  pair?: string
  weight?: number
  sensitive?: boolean
  placeholder?: string
}

export type CoupleSection = {
  id: string
  title: string
  intro: string
  sensitive?: boolean
}

// ── Ce qui sort du moteur ──────────────────────────────────────────────────
export type Verdict = 'point_or' | 'malentendu' | 'faille' | 'usure'

export type DimensionFinding = {
  dimension: Dimension
  label: string
  verdict: Verdict
  impact: number        // 0..100, donne l'ordre du livrable
  divergence: number
  malentendu: number
  usure: number
  /** Qui porte la difficulté, quand un seul des deux la porte. */
  porte_par: 'a' | 'b' | 'les_deux' | null
}

export type CoupleAnswers = Record<string, number>
export type CoupleOpenAnswers = Record<string, string>
export type CoupleTimings = Record<string, number>
