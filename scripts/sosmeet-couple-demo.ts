/**
 * Démonstration du croisement couple. Trois cas construits à la main pour
 * vérifier que le moteur voit ce qu'il doit voir.
 * Lancer : npx tsx scripts/sosmeet-couple-demo.ts
 */
import { COUPLE_QUESTIONS, QUESTIONS_BY_ID } from '../lib/sosmeet/couple/questionnaire'
import { buildCrossing, pointsDOr, leviers } from '../lib/sosmeet/couple/crossing'
import { assessSafety } from '../lib/sosmeet/couple/safety'

/** Choisit l'index d'option dont la valeur est la plus proche de la cible. */
function pick(qid: string, cible: number): number {
  const q = QUESTIONS_BY_ID[qid]
  if (!q?.choices) return 0
  let best = 0, d = Infinity
  q.choices.forEach((c, i) => { const e = Math.abs((c.value ?? 50) - cible); if (e < d) { d = e; best = i } })
  return best
}

/** Fabrique un jeu de réponses : cible par dimension, plus des surcharges. */
function repondant(parDimension: Record<string, number>, defaut = 60, surcharges: Record<string, number> = {}) {
  const a: Record<string, number> = {}
  for (const q of COUPLE_QUESTIONS) {
    if (q.nature !== 'self' && q.nature !== 'perceived' && q.nature !== 'safety') continue
    const cible = surcharges[q.id] ?? (q.dimension ? parDimension[q.dimension] ?? defaut : 100)
    a[q.id] = pick(q.id, cible)
  }
  return a
}

function montre(titre: string, A: Record<string, number>, B: Record<string, number>) {
  const c = buildCrossing(A, B)
  console.log('\n' + '='.repeat(72))
  console.log(titre)
  console.log('='.repeat(72))
  console.log(`santé globale ${c.sante}/100   lucidité ${c.lucidite}/100   dimensions mesurées ${c.mesurees}`)
  const or = pointsDOr(c)
  console.log('\nPoints d\'or  :', or.length ? or.map(f => f.label).join(' · ') : 'aucun')
  console.log('\nLeviers prioritaires :')
  for (const f of leviers(c)) {
    console.log(`  ${f.label.padEnd(28)} ${f.verdict.padEnd(11)} impact ${String(f.impact).padStart(3)}` +
      `  (divergence ${f.divergence}, malentendu ${f.malentendu}, usure ${f.usure}, porté par ${f.porte_par ?? 'personne'})`)
  }
}

// ── 1. Couple aligné et solide ────────────────────────────────────────────
const bon = { responsivite: 90, communication: 85, conflit: 85, reparation: 90, admiration: 95,
  intimite: 85, desir: 80, securite: 90, equite: 80, projet: 90, autonomie: 80,
  rancoeur: 90, valeurs: 90, respect: 95 }
montre('CAS 1  Couple solide : les deux vivent la même chose, et elle est bonne',
  repondant(bon), repondant(bon))

// ── 2. Le malentendu pur : B va mal, A ne le voit pas du tout ─────────────
const aVaBien = repondant({ ...bon, desir: 85, responsivite: 85 })
const bVaMal = repondant({ ...bon, desir: 20, responsivite: 25, intimite: 30 })
// A croit que tout va bien du côté de B : ses réponses « l'autre » restent hautes.
montre('CAS 2  Le malentendu : B souffre en silence, A n\'a rien vu',
  aVaBien, bVaMal)

// ── 3. L'usure partagée : les deux d'accord, et les deux à bout ───────────
const use = { responsivite: 30, communication: 30, conflit: 30, reparation: 25, admiration: 30,
  intimite: 25, desir: 20, securite: 35, equite: 30, projet: 30, autonomie: 45,
  rancoeur: 25, valeurs: 55, respect: 40 }
montre('CAS 3  L\'usure : parfaitement d\'accord, et tous les deux à bout',
  repondant(use), repondant(use))

// ── 4. Vigilance ──────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(72))
console.log('VIGILANCE')
console.log('='.repeat(72))
const sain = repondant(bon)
console.log('couple sain          :', JSON.stringify(assessSafety(sain)))
const emprise = repondant(bon, 60, { v_peur: 10, v_isolement: 10, v_argent: 20 })
const r = assessSafety(emprise)
console.log('signaux d\'emprise    :', r.level, '| indice', r.score)
console.log('  signaux            :', r.signals.join(' · '))
