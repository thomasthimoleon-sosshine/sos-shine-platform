/**
 * SOS Meet, PORTRAIT généré du profil solo.
 * ---------------------------------------------------------------------------
 * Le profil que les autres voient est ENTIÈREMENT généré à partir des réponses
 * au questionnaire, la personne n'écrit rien elle-même. On y ajoute un
 * indicateur de sincérité affiché en transparence (dérivé de la cohérence des
 * réponses entre elles). Objectif : que le profil parle vraiment de qui est la
 * personne, ce qu'elle cherche et ce qu'elle désire, sans mise en scène.
 *
 * 100 % déterministe (mêmes réponses → même portrait). Aucune saisie libre.
 * Rédigé sans genre : sujet = le prénom, traits décrits par des noms/verbes,
 * pour ne présumer d'aucun genre.
 */
import type { Answers } from './matching'
import type { SincerityResult } from './coherence'

export type PortraitSection = { title: string; body: string }
export type Portrait = {
  prose: string                // LE portrait : un seul texte fluide, en paragraphes
  narrative: string            // variante courte en une phrase (accroche)
  signature: string            // une ligne d'accroche générée
  sections: PortraitSection[]  // le portrait, section par section (usage interne)
  wants: string | null         // ce qu'elle/il cherche chez l'autre
}

export type Gender = 'femme' | 'homme' | string | null | undefined
export type PublicSincerity = {
  label: string
  tone: 'high' | 'medium' | 'low'
  note: string
}

/** Fragment selon l'index de réponse (ou '' si non répondu). */
function pick(answers: Answers, qid: string, map: Record<number, string>): string {
  const v = answers[qid]
  if (v == null) return ''
  return map[v] ?? ''
}

/** Assemble « sujet + fragments » en une phrase propre (ou '' si rien). */
function line(subject: string, parts: string[]): string {
  const clean = parts.filter(Boolean)
  if (clean.length === 0) return ''
  const joined = [subject, ...clean].join(' ')
    .replace(/\s+([,.;])/g, '$1')   // pas d'espace avant la ponctuation
    .replace(/^[\s,.;]+/, '')       // pas de ponctuation en tête
    .trim()
  if (!joined) return ''
  return joined.charAt(0).toUpperCase() + joined.slice(1) + (/[.!?]$/.test(joined) ? '' : '.')
}

/** Indicateur de sincérité affiché publiquement, en transparence mais avec tact. */
export function publicSincerity(s?: SincerityResult | null): PublicSincerity {
  const band = s?.band ?? 'moyenne'
  if (band === 'haute') return { label: 'Sincérité élevée', tone: 'high', note: 'Des réponses très cohérentes entre elles.' }
  if (band === 'moyenne') return { label: 'Sincérité correcte', tone: 'medium', note: 'Des réponses globalement cohérentes.' }
  return { label: 'Cohérence à confirmer', tone: 'low', note: 'Quelques réponses semblent se contredire, à explorer ensemble.' }
}

/** Accord des adjectifs selon le genre : femme → +e, homme → rien, autre → ·e. */
function agree(gender: Gender, base: string): string {
  if (gender === 'homme') return base
  if (gender === 'femme') return base + 'e'
  return base + '·e'
}

/**
 * Portrait NARRATIF en une phrase fluide, façon « Marina est une femme
 * attentionnée, qui désire encore des enfants… pour qui la loyauté ne se
 * négocie pas ». S'enrichit à mesure que la personne répond aux paliers.
 */
function buildNarrative(answers: Answers, firstName: string, gender: Gender): string {
  const noun = gender === 'femme' ? 'une femme' : gender === 'homme' ? 'un homme' : 'une personne'

  // 1) Adjectifs d'ouverture (0 à 2), selon l'attachement / le contrôle / la loyauté
  const adj: string[] = []
  const a83 = answers.q83
  if (a83 === 0) adj.push(agree(gender, 'posé') + ' et sécure')
  else if (a83 === 1) adj.push('sensible') // invariable
  else if (a83 === 2) adj.push(agree(gender, 'indépendant'))
  if (answers.q125 != null && answers.q125 <= 1) adj.push(agree(gender, 'loyal'))
  else if (answers.q95 != null && answers.q95 >= 2 && adj.length < 2) adj.push(agree(gender, 'apaisé'))
  const adjPart = adj.length ? ' ' + adj.slice(0, 2).join(', ') : ''

  // 2) Clauses « qui … » selon les réponses (on garde les plus parlantes)
  const clauses: string[] = []
  const kids = answers.q131
  if (kids === 0) clauses.push('qui désire encore fonder une famille')
  else if (kids === 2 || kids === 4) clauses.push('qui ne cherche pas à (re)fonder de famille')
  const sorties = answers.q21
  if (sorties != null && sorties >= 3) clauses.push('qui aime les soirées tranquilles')
  else if (sorties != null && sorties <= 1) clauses.push('qui aime sortir et voir du monde')
  if (answers.q166 != null && answers.q166 <= 1) clauses.push('qui avance sur un vrai chemin intérieur')
  if (answers.q96 === 0 || answers.q96 === 3) clauses.push('pour qui l’intimité compte vraiment')

  // 3) La valeur non négociable (une seule, la plus forte)
  let value = ''
  if (answers.q125 === 0) value = 'pour qui la loyauté ne se négocie pas'
  else if (answers.q104 === 0) value = 'pour qui la fidélité est sacrée'
  else if (answers.q149 === 0) value = 'pour qui le partage du chemin intérieur est essentiel'
  else if (answers.q140 != null && answers.q140 >= 3) value = agree(gender, 'prêt') + ' à s’engager pour de vrai'

  const middle = clauses.slice(0, 3)
  const tail = [...middle, value].filter(Boolean)
  if (tail.length === 0) return `${firstName} se dévoile peu à peu, dans la vérité de ses réponses, sans rien mettre en scène.`
  return `${firstName} est ${noun}${adjPart}, ${tail.join(', ')}.`
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * LE portrait : un seul texte fluide en paragraphes, prénom cité une seule
 * fois puis repris par le pronom, avec des transitions. C'est ce que les
 * autres lisent. S'enrichit à mesure que la personne répond aux paliers.
 */
function buildProse(answers: Answers, firstName: string, gender: Gender): string {
  const name = firstName || 'Cette personne'
  const noun = gender === 'femme' ? 'une femme' : gender === 'homme' ? 'un homme' : 'une personne'
  const pr = gender === 'femme' ? 'elle' : gender === 'homme' ? 'il' : 'iel'

  // Adjectifs d'ouverture
  const adj: string[] = []
  if (answers.q83 === 0) adj.push(agree(gender, 'posé') + ' et sécure')
  else if (answers.q83 === 1) adj.push('sensible')
  else if (answers.q83 === 2) adj.push(agree(gender, 'indépendant'))
  if (answers.q125 != null && answers.q125 <= 1) adj.push(agree(gender, 'loyal'))
  else if (answers.q95 != null && answers.q95 >= 2 && adj.length < 2) adj.push(agree(gender, 'apaisé'))
  const adjPart = adj.length ? ' ' + adj.slice(0, 2).join(', ') : ''

  const paras: string[] = []

  // § 1 — identité + intentions
  const sIntent = line(pr, [
    pick(answers, 'q127', { 0: 'fait aujourd’hui de la vie amoureuse une vraie priorité', 1: 'y tient, sans sacrifier son propre chemin', 2: 'la place plutôt au second plan en ce moment', 3: 'reste ' + agree(gender, 'ouvert') + ', sans pression' }),
    pick(answers, 'q148', { 0: ', et cherche assez vite un lien engagé et exclusif', 1: ', et préfère construire les choses progressivement', 2: ', en quête de profondeur même hors du cadre classique', 3: '' }),
    pick(answers, 'q133', { 0: ', ' + agree(gender, 'prêt') + ' à vivre à deux assez vite', 2: ', tout en gardant des espaces séparés un temps' }),
  ])
  paras.push([`${name} est ${noun}${adjPart}.`, sIntent].filter(Boolean).join(' '))

  // § 2 — manière d'aimer + désir
  const sLove = line(`Dans le lien, ${pr}`, [
    pick(answers, 'q83', { 0: 'avance depuis une base sécure', 1: 'compose avec un attachement plutôt anxieux, en conscience', 2: 'compose avec un attachement plutôt évitant, et le sait', 3: 'a un attachement encore en travail', 4: 'explore encore son attachement' }),
    pick(answers, 'q87', { 0: ', avec une peur de l’abandon encore présente', 3: ', sans réelle crainte de l’abandon' }),
    pick(answers, 'q80', { 0: '; un besoin marqué d’indépendance', 3: '; une recherche de proximité' }),
    pick(answers, 'q95', { 2: '. Le contrôle a été travaillé', 3: '. Le contrôle n’est pas un enjeu' }),
  ])
  const sDesir = line(`Côté désir, ${pr}`, [
    pick(answers, 'q96', { 0: 'vit l’intimité comme essentielle', 1: 'accorde de l’importance à l’intimité sans en faire le centre', 2: 'place l’intimité au second plan si le lien est fort', 3: 'met l’intimité au cœur du lien', 4: 'a un rapport variable à l’intimité' }),
    pick(answers, 'q105', { 0: ', le lien émotionnel précédant toujours le désir physique', 1: ', le lien émotionnel précédant souvent le désir', 2: ', sans en faire un prérequis' }),
  ])
  const sMono = pick(answers, 'q104', { 0: 'Monogame par conviction.', 3: cap(agree(gender, 'ouvert')) + ' à d’autres formes de relation.' })
  const p2 = [sLove, sDesir, sMono].filter(Boolean).join(' ')
  if (p2) paras.push(p2)

  // § 3 — monde intérieur + rythme
  const sInner = line(`Au fond, ${pr}`, [
    pick(answers, 'q166', { 0: 'place le chemin intérieur au centre de sa vie', 1: 'accorde une vraie place au développement de soi', 3: 'explore le développement personnel à sa façon', 4: 'est peu ' + agree(gender, 'tourné') + ' vers le développement personnel' }),
    pick(answers, 'q168', { 0: ', en quête de stabilité et d’ancrage', 1: ', en quête de transformation continue', 2: ', entre ancrage et transformation', 3: ', en quête de simplicité et de présence' }),
    pick(answers, 'q116', { 2: '. Un vrai travail sur ses blessures a été fait', 1: '. Lucide sur ses blessures, ' + pr + ' avance avec' }),
    pick(answers, 'q120', { 0: '; le deuil du passé est fait', 2: '; le passé n’est pas tout à fait refermé' }),
  ])
  const sRythme = line(`Au quotidien, ${pr}`, [
    pick(answers, 'q16', { 0: 'est plutôt lève-tôt', 1: 'est plutôt du matin', 3: 'est plutôt couche-tard', 4: 'a un rythme très variable' }),
    pick(answers, 'q23', { 0: ', avec un grand besoin de solitude', 2: ', avec peu de besoin de solitude' }),
    pick(answers, 'q21', { 0: '; sort très souvent', 3: '; sort rarement', 4: '; sort presque jamais' }),
    pick(answers, 'q32', { 0: ', mais aime recevoir du monde' }),
  ])
  const p3 = [sInner, sRythme].filter(Boolean).join(' ')
  if (p3) paras.push(p3)

  // § 4 — ce qu'iel cherche chez l'autre
  const sWants = line(`Chez l’autre, ${pr}`, [
    pick(answers, 'q144', { 0: 'cherche quelqu’un qui a déjà fait un vrai travail sur soi', 1: 'cherche quelqu’un en chemin sincère' }),
    pick(answers, 'q149', { 0: ', et un vrai partage du chemin intérieur' }),
    pick(answers, 'q131', { 0: '. Un projet d’enfants fait partie de ses envies', 2: '. Pas d’enfants au programme' }),
  ])
  if (sWants) paras.push(sWants)

  const clean = paras.filter((p) => p && p.length > 3)
  if (clean.length === 0) return `${name} se dévoile peu à peu, dans la vérité de ses réponses, sans rien mettre en scène.`
  return clean.join('\n\n')
}

/**
 * Construit le portrait à partir des réponses.
 * @param answers  { qid: index | nombre }
 * @param firstName sujet des phrases (sinon « Cette personne »)
 * @param gender    pour l'accord des adjectifs
 */
export function buildPortrait(answers: Answers, firstName?: string, gender?: Gender): Portrait {
  const who = (firstName && firstName.trim()) || 'Cette personne'

  // ── Ce qu'iel cherche (intentions / engagement) ──
  const cherche = line(who, [
    pick(answers, 'q127', { 0: 'fait aujourd’hui de la vie amoureuse une vraie priorité', 1: 'y tient, sans sacrifier son propre chemin', 2: 'la place plutôt au second plan en ce moment', 3: 'reste ouvert·e, sans pression' }),
    pick(answers, 'q148', { 0: ', et cherche assez vite un lien engagé et exclusif', 1: ', et veut construire les choses progressivement', 2: ', en quête de profondeur même hors du cadre classique', 3: '' }),
    pick(answers, 'q133', { 0: ', prêt·e à vivre à deux assez vite', 2: ', tout en gardant des espaces séparés un temps' }),
  ])

  // ── Sa manière d'aimer (attachement / sécurité / indépendance) ──
  const aimer = line(who, [
    pick(answers, 'q83', { 0: 'aborde le lien depuis une base sécure', 1: 'a un attachement plutôt anxieux, et en a conscience', 2: 'a un attachement plutôt évitant, et le sait', 3: 'a un attachement encore en travail', 4: 'explore encore son style d’attachement' }),
    pick(answers, 'q87', { 0: ', avec une peur de l’abandon encore présente', 3: ', sans réelle crainte de l’abandon' }),
    pick(answers, 'q80', { 0: '; besoin marqué d’indépendance', 3: '; en recherche de proximité' }),
    pick(answers, 'q95', { 2: '. Le contrôle a été travaillé', 3: '. Le contrôle n’est pas un enjeu' }),
  ])

  // ── Son rapport au désir (sexualité / intimité) ──
  const desir = line(who, [
    pick(answers, 'q96', { 0: 'vit l’intimité comme essentielle', 1: 'accorde de l’importance à l’intimité, sans en faire le centre', 2: 'place l’intimité au second plan si le lien est fort', 3: 'met l’intimité au cœur du lien', 4: 'a un rapport variable à l’intimité' }),
    pick(answers, 'q105', { 0: ', le lien émotionnel précédant toujours le désir physique', 1: ', le lien émotionnel précédant souvent le désir', 2: ', sans en faire un prérequis' }),
    pick(answers, 'q104', { 0: '. Monogame par conviction', 3: '. Ouvert·e à d’autres formes de relation' }),
  ])

  // ── Son monde intérieur (spiritualité / valeurs / histoire) ──
  const interieur = line(who, [
    pick(answers, 'q166', { 0: 'place le chemin intérieur au centre de sa vie', 1: 'accorde une vraie place au développement de soi', 3: 'explore le développement personnel à sa façon', 4: 'est peu tourné·e vers le développement personnel' }),
    pick(answers, 'q168', { 0: ', en quête de stabilité et d’ancrage', 1: ', en quête de transformation continue', 2: ', entre ancrage et transformation', 3: ', en quête de simplicité et de présence' }),
    pick(answers, 'q116', { 2: '. Un vrai travail sur ses blessures a été fait', 1: '. Lucide sur ses blessures, avance avec' }),
    pick(answers, 'q120', { 0: '; le deuil du passé est fait', 2: '; le passé n’est pas tout à fait refermé' }),
  ])

  // ── Son rythme (lifestyle / social) ──
  const rythme = line(who, [
    pick(answers, 'q16', { 0: 'est plutôt lève-tôt', 1: 'est plutôt du matin', 3: 'est plutôt couche-tard', 4: 'a un rythme très variable' }),
    pick(answers, 'q23', { 0: ', avec un grand besoin de solitude', 2: ', avec peu de besoin de solitude' }),
    pick(answers, 'q21', { 0: '. Sort très souvent', 3: '. Sort rarement', 4: '. Sort presque jamais' }),
    pick(answers, 'q32', { 0: ', mais aime recevoir du monde' }),
  ])

  const sections: PortraitSection[] = [
    { title: 'Ce qu’iel cherche', body: cherche },
    { title: 'Sa manière d’aimer', body: aimer },
    { title: 'Son rapport au désir', body: desir },
    { title: 'Son monde intérieur', body: interieur },
    { title: 'Son rythme', body: rythme },
  ].filter((s) => s.body.length > 1)

  // ── Ce qu'iel attend chez l'autre (préférences / filtres) ──
  const wants = line('', [
    pick(answers, 'q144', { 0: 'Cherche quelqu’un qui a déjà fait un vrai travail sur soi', 1: 'Cherche quelqu’un en chemin sincère' }),
    pick(answers, 'q149', { 0: (answers.q144 != null ? ', et' : 'Attend') + ' un vrai partage du chemin intérieur' }),
    pick(answers, 'q131', { 0: '. Un projet d’enfants fait partie des envies', 2: '. Ne souhaite pas (ou plus) d’enfants' }),
  ]) || null

  return { prose: buildProse(answers, who, gender), narrative: buildNarrative(answers, who, gender), signature: buildSignature(answers), sections, wants }
}

/** Une ligne d'accroche, dérivée des traits dominants (sans genre). */
function buildSignature(answers: Answers): string {
  const bits: string[] = []
  const ready = answers.q140
  if (ready != null && ready >= 3) bits.push('Prêt·e pour du vrai')
  else if (ready != null && ready <= 1) bits.push('Avance à son rythme')
  if (answers.q83 === 0) bits.push('base sécure')
  const spi = answers.q166
  if (spi != null && spi <= 1) bits.push('chemin intérieur assumé')
  if (answers.q104 === 0) bits.push('monogame')
  if (bits.length === 0) return 'Se dévoile par la vérité, pas par la vitrine.'
  const s = bits.join(' · ')
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}
