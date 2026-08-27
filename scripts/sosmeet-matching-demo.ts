import { computeProfile, compatibility } from '@/lib/sosmeet/matching'
import { computeSincerity } from '@/lib/sosmeet/coherence'

const A = { q1:34,q131:0,q134:0,q127:0,q140:4,q148:0,q133:0,q83:0,q80:1,q87:3,q88:2,q95:3,q96:1,q105:0,q104:0,q166:0,q168:1,q149:0,q144:0,q16:1,q21:1,q23:1,q32:1,q116:2,q120:0,q125:0 }
const B = { q1:36,q131:1,q134:0,q127:1,q140:3,q148:1,q133:1,q83:0,q80:1,q87:2,q88:2,q96:1,q105:0,q104:0,q166:0,q168:2,q149:1,q144:1,q16:1,q21:2,q23:1,q32:1,q116:2,q120:1,q125:1 }
// C : veut PAS d'enfants + non-monogame → conflit dur avec A
const C = { ...B, q131:2, q104:3, q134:2, q166:4, q140:2 }

const pA = computeProfile(A), pB = computeProfile(B), pC = computeProfile(C)
console.log('Dimensions A :', pA.dimensions)
const AB = compatibility(pA, pB), AC = compatibility(pA, pC)
console.log(`\nA × B : ${AB.score}%  bloqué=${AB.blocked}`)
console.log('  forts :', AB.reasons); console.log('  frictions :', AB.frictions)
console.log(`\nA × C : ${AC.score}%  bloqué=${AC.blocked}`)
console.log('  frictions :', AC.frictions)

// Cohérence : profil « sécure » qui déclare peur d'abandon forte + prêt 9-10 sans deuil + couche-tard mais couché tôt
const incoherent = { q83:0,q87:0,q88:0,q140:4,q120:2,q16:3,q17:0,q21:0,q23:0,q32:0,q95:0 }
const s = computeSincerity(incoherent)
console.log(`\n=== Cohérence (profil suspect) ===  score ${s.score}/100 · ${s.band}`)
console.log('  drapeaux :', s.flags)
