// Release schedule for encyclopedia protocols
// Priority order based on the 25 archetypes quiz mapping
// 5 protocols per month starting May 2026

const PRIORITY_ORDER: string[] = [
  // Tier 1 - touches 21 archetypes
  'couple',
  'trahison',
  'relation-au-travail',
  'mission-de-vie',
  // Tier 2 - 3 archetypes each
  'famille-toxique',
  'controle',
  'honte',
  'relation-au-corps',
  'anxiete',
  'dissociation',
  'vide-existentiel',
  'identite',
  // Tier 3 - 2 archetypes each
  'hypervigilance',
  'injustice',
  'colere',
  'solitude',
  // Tier 4 - 1 archetype each
  'attachement',
  'perfectionnisme',
  'culpabilite',
  'codependance',
  'mecanismes-de-defense',
  'enfant-interieur',
  'disqualification-de-soi',
  'psychosomatique',
  'generosite-excessive',
  'fatigue-emotionnelle',
  'hypersensibilite',
  'isolement-social',
  'estime-de-soi',
  'loyautes-invisibles',
  'psychogenealogie',
  'autosabotage',
  'peur',
  'urgence-chronique',
]

const START_YEAR = 2026
const START_MONTH = 4 // May (0-indexed: 0=Jan)
const PER_MONTH = 5

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function buildSchedule(): Map<string, string> {
  const schedule = new Map<string, string>()

  let month = START_MONTH
  let year = START_YEAR
  let countInMonth = 0

  for (const slug of PRIORITY_ORDER) {
    if (countInMonth >= PER_MONTH) {
      month++
      if (month > 11) { month = 0; year++ }
      countInMonth = 0
    }
    schedule.set(slug, `${MONTH_NAMES_FR[month]} ${year}`)
    countInMonth++
  }

  return schedule
}

const RELEASE_SCHEDULE = buildSchedule()

/**
 * Returns the planned release date label for an unpublished protocol.
 * Falls back to a calculated date based on alphabetical position
 * for protocols not in the priority list.
 */
export function getReleaseDate(slug: string, allSlugs?: string[]): string {
  const normalized = slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Check priority schedule first
  const priority = RELEASE_SCHEDULE.get(normalized)
  if (priority) return priority

  // For non-priority protocols: continue after priority list ends
  if (!allSlugs) return '2027'

  const priorityEnd = PRIORITY_ORDER.length
  let month = START_MONTH + Math.floor(priorityEnd / PER_MONTH)
  let year = START_YEAR
  while (month > 11) { month -= 12; year++ }

  // Find position among non-priority slugs (alphabetical)
  const nonPrioritySlugs = allSlugs
    .filter(s => !RELEASE_SCHEDULE.has(s))
    .sort()
  const idx = nonPrioritySlugs.indexOf(normalized)
  if (idx === -1) return '2027'

  const additionalMonths = Math.floor(idx / PER_MONTH)
  month += additionalMonths
  while (month > 11) { month -= 12; year++ }

  return `${MONTH_NAMES_FR[month]} ${year}`
}
