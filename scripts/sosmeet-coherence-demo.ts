import { computeSincerity } from '@/lib/sosmeet/coherence'

// Profil SINCÈRE : couche-tard cohérent, solitude modérée, réponses variées, temps normaux
const honnete = { q10:2, q16:3, q17:3, q20:5, q21:2, q23:1, q25:2, q31:2, q32:1, q33:1 }
const tHonnete = Object.fromEntries(Object.keys(honnete).map(k=>[k, 4200]))

// Profil TRICHEUR : contradictions (couche-tard MAIS couché avant 22h30 ; beaucoup de
// solitude MAIS sort tous les soirs ET reçoit souvent), options toujours flatteuses, bâclé
const tricheur = { q10:0, q16:3, q17:0, q20:1, q21:0, q23:0, q25:0, q31:0, q32:0, q33:0 }
const tTricheur = Object.fromEntries(Object.keys(tricheur).map(k=>[k, 500]))

for (const [nom, a, t] of [['SINCÈRE', honnete, tHonnete], ['TRICHEUR', tricheur, tTricheur]] as const) {
  const r = computeSincerity(a, t)
  console.log(`\n=== ${nom} ===`)
  console.log(`Score de sincérité : ${r.score}/100  ·  bande : ${r.band}  ·  badge « Profil cohérent » : ${r.coherent ? 'OUI' : 'non'}`)
  console.log(`Signaux :`, Object.fromEntries(Object.entries(r.signals).map(([k,v])=>[k, Math.round(v*100)/100])))
  console.log(`Drapeaux modération :`, r.flags.length ? r.flags : '(aucun)')
}
