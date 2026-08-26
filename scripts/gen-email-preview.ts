/* Écrit quelques e-mails en HTML pour aperçu visuel. */
import { writeFileSync } from 'fs'
import { LETTERS } from '@/lib/email-templates/newsletter/letters'
import { SEQUENCE_A } from '@/lib/email-templates/lifecycle/fileA'
import { SEQUENCE_B } from '@/lib/email-templates/lifecycle/fileB'
import { SEQUENCE_C } from '@/lib/email-templates/lifecycle/fileC'

const OUT = process.argv[2] || '.'
const V = { firstName: 'Marie', email: 'marie@example.com' }

function dump(name: string, subject: string, html: string) {
  const withSub = html.replace('{firstName}', 'Marie')
  writeFileSync(`${OUT}/${name}.html`, withSub)
  // eslint-disable-next-line no-console
  console.log(`${name}  —  « ${subject.replace('{firstName}', 'Marie')} »`)
}

for (const l of LETTERS) {
  const b = l.build(V)
  dump(`lettre-${String(l.month).padStart(2, '0')}-${l.format}`, b.subject, b.html)
}
for (const s of [SEQUENCE_A, SEQUENCE_B, SEQUENCE_C]) {
  const first = s.steps[0].build(V)
  dump(`file-${s.triggerType}-01`, first.subject, first.html)
}
