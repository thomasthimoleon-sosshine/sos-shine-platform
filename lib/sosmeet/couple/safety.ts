/**
 * SOS Meet Couple, vigilance.
 * ---------------------------------------------------------------------------
 * Un diagnostic de couple rencontrera des situations d'emprise. Répondre à
 * cela par un « rituel de reconnexion » ferait du mal. Ce module décide quand
 * le produit doit s'arrêter et proposer de l'aide à la place.
 *
 * Les items de vigilance portent sur les dimensions reconnues du contrôle
 * coercitif : peur, isolement, contrôle financier, humiliation, surveillance,
 * contrainte sexuelle.
 *
 * RÈGLES ABSOLUES :
 *  - le résultat n'apparaît JAMAIS dans le livrable commun ;
 *  - il n'est JAMAIS visible par l'autre partenaire, sous aucune forme ;
 *  - il suffit d'UN SEUL des deux partenaires pour suspendre le diagnostic.
 */
import { SAFETY_QUESTIONS } from './questionnaire'
import { valueOf } from './questionnaire'

export type SafetyLevel = 'aucun' | 'a_verifier' | 'suspendu'

export type SafetyResult = {
  level: SafetyLevel
  /** Indice 0..100, 100 étant le plus préoccupant. Usage interne. */
  score: number
  /** Libellés lisibles en modération. Jamais affichés à un partenaire. */
  signals: string[]
}

const LABEL: Record<string, string> = {
  v_peur: 'Peur de la réaction du/de la partenaire',
  v_isolement: 'Limitation des fréquentations',
  v_argent: 'Contrôle de l’accès à l’argent',
  v_humiliation: 'Humiliation',
  v_surveillance: 'Surveillance du téléphone ou des déplacements',
  v_contrainte: 'Rapport intime subi pour éviter un conflit',
}

/** Un seul signal grave suffit à suspendre, sans attendre un cumul. */
const GRAVE_SEUIL = 25   // « souvent » ou pire sur une échelle inversée
const ALERTE_SEUIL = 50  // « parfois »

export function assessSafety(answers: Record<string, number>): SafetyResult {
  const signals: string[] = []
  let graves = 0, alertes = 0, repondus = 0

  for (const q of SAFETY_QUESTIONS) {
    const v = valueOf(q.id, answers)
    if (v == null) continue
    repondus++
    if (v <= GRAVE_SEUIL) { graves++; signals.push(LABEL[q.id] || q.id) }
    else if (v <= ALERTE_SEUIL) { alertes++; signals.push(`${LABEL[q.id] || q.id} (occasionnel)`) }
  }

  // Indice interne : les signaux graves pèsent le double des signaux occasionnels.
  const max = Math.max(1, repondus)
  const score = Math.round(Math.min(100, ((graves * 2 + alertes) / (max * 2)) * 100))

  let level: SafetyLevel = 'aucun'
  if (graves >= 1) level = 'suspendu'
  else if (alertes >= 2) level = 'a_verifier'

  return { level, score, signals }
}

/** Le niveau le plus élevé des deux partenaires gouverne le couple. */
export function combineSafety(a: SafetyResult, b: SafetyResult): SafetyLevel {
  if (a.level === 'suspendu' || b.level === 'suspendu') return 'suspendu'
  if (a.level === 'a_verifier' || b.level === 'a_verifier') return 'a_verifier'
  return 'aucun'
}
