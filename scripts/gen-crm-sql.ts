/* Génère un fichier SQL idempotent : re-seed séquence Signature (propre) + Files A/B/C + nettoyage des doublons. */
import { SEQUENCE_A } from '@/lib/email-templates/lifecycle/fileA'
import { SEQUENCE_B } from '@/lib/email-templates/lifecycle/fileB'
import { SEQUENCE_C } from '@/lib/email-templates/lifecycle/fileC'
import type { LifecycleSequence } from '@/lib/email-templates/lifecycle/shared'
import { generateEmail01 } from '@/lib/email-templates/quiz-v2/email-01-capture'
import { generateEmail02 } from '@/lib/email-templates/quiz-v2/email-02-result'
import { generateEmail03 } from '@/lib/email-templates/quiz-v2/email-03-question'
import { generateEmail04 } from '@/lib/email-templates/quiz-v2/email-04-pourquoi'
import { generateEmail05 } from '@/lib/email-templates/quiz-v2/email-05-histoire'
import { generateEmail06 } from '@/lib/email-templates/quiz-v2/email-06-temoignage'
import { generateEmail07 } from '@/lib/email-templates/quiz-v2/email-07-pratique'
import { generateEmail08 } from '@/lib/email-templates/quiz-v2/email-08-temps'
import { generateEmail09 } from '@/lib/email-templates/quiz-v2/email-09-argent'
import { generateEmail10 } from '@/lib/email-templates/quiz-v2/email-10-repos'
import { generateEmail11 } from '@/lib/email-templates/quiz-v2/email-11-bascule'
import { generateEmail12 } from '@/lib/email-templates/quiz-v2/email-12-dedans'
import { generateEmail13 } from '@/lib/email-templates/quiz-v2/email-13-doute'
import { generateEmail14 } from '@/lib/email-templates/quiz-v2/email-14-raisons'
import { generateEmail15 } from '@/lib/email-templates/quiz-v2/email-15-avant-dernier'
import { generateEmail16 } from '@/lib/email-templates/quiz-v2/email-16-dernier'

const PH = { firstName: '{firstName}', email: '{email}', resumeUrl: 'https://sosshine.com/signature-emotionnelle', topProtocol: '{topProtocol}', dominant: '3', q15Response: '{q15Response}' }
const SCORES: Record<string, number> = { '1': 40, '2': 20, '3': 100, '4': 60, '5': 30, '6': 50, '7': 35, '8': 25, '9': 80, '10': 45 }
const PROTOS = [
  { title: 'Déconditionnement Émotionnel', matchScore: 92, status: 'available', duration_days: 30 },
  { title: 'Confiance & Estime', matchScore: 85, status: 'coming_soon', duration_days: 21 },
]

type Step = { order: number; delay: number; subject: string; html: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sig(): { name: string; trigger: string; steps: Step[] } {
  const E: Array<{ order: number; delay: number; g: () => { subject: string; html: string } }> = [
    { order: 1, delay: 0, g: () => generateEmail01({ ...PH }) },
    { order: 2, delay: 0, g: () => generateEmail02({ ...PH, dominant: '3', secondary: '9', scores: SCORES, protocols: PROTOS } as never) },
    { order: 3, delay: 1, g: () => generateEmail03(PH) },
    { order: 4, delay: 2, g: () => generateEmail04(PH) },
    { order: 5, delay: 3, g: () => generateEmail05(PH) },
    { order: 6, delay: 4, g: () => generateEmail06(PH) },
    { order: 7, delay: 5, g: () => generateEmail07({ ...PH }) },
    { order: 8, delay: 6, g: () => generateEmail08(PH) },
    { order: 9, delay: 7, g: () => generateEmail09(PH) },
    { order: 10, delay: 8, g: () => generateEmail10(PH) },
    { order: 11, delay: 9, g: () => generateEmail11(PH) },
    { order: 12, delay: 10, g: () => generateEmail12(PH) },
    { order: 13, delay: 11, g: () => generateEmail13(PH) },
    { order: 14, delay: 12, g: () => generateEmail14(PH) },
    { order: 15, delay: 13, g: () => generateEmail15(PH) },
    { order: 16, delay: 14, g: () => generateEmail16(PH) },
  ]
  return { name: 'Signature Émotionnelle V2', trigger: 'signature_test_v2', steps: E.map(e => ({ order: e.order, delay: e.delay, ...e.g() })) }
}

function lifecycle(seq: LifecycleSequence): { name: string; trigger: string; steps: Step[] } {
  const sorted = [...seq.steps].sort((a, b) => a.order - b.order)
  let prev = 0
  const steps: Step[] = sorted.map((s, i) => {
    const gap = i === 0 ? s.delay : s.delay - prev
    prev = s.delay
    const built = s.build({ firstName: '{firstName}', email: '{email}' })
    return { order: s.order, delay: Math.max(0, gap), subject: built.subject, html: built.html }
  })
  return { name: seq.name, trigger: seq.triggerType, steps }
}

function dollar(tag: string, val: string): string {
  return `$${tag}$${val}$${tag}$`
}

function emitSequence(s: { name: string; trigger: string; steps: Step[] }): string {
  const rows = s.steps.map((st, i) => {
    const st_tag = `S${st.order}_${i}`
    const h_tag = `H${st.order}_${i}`
    return `    (seq_id, ${st.order}, ${st.delay}, ${dollar(st_tag, st.subject)}, ${dollar(h_tag, st.html)})`
  }).join(',\n')
  return `-- ═══ ${s.name} (${s.trigger}) ═══
DO $DOBLK$
DECLARE seq_id uuid;
BEGIN
  SELECT id INTO seq_id FROM crm_sequences WHERE trigger_type = ${dollar('T', s.trigger)} LIMIT 1;
  IF seq_id IS NULL THEN
    INSERT INTO crm_sequences (name, trigger_type, status) VALUES (${dollar('N', s.name)}, ${dollar('T', s.trigger)}, 'active') RETURNING id INTO seq_id;
  ELSE
    UPDATE crm_sequences SET name = ${dollar('N', s.name)}, status = 'active' WHERE id = seq_id;
  END IF;
  DELETE FROM crm_sequence_steps WHERE sequence_id = seq_id;
  INSERT INTO crm_sequence_steps (sequence_id, step_order, delay_days, subject, html_content) VALUES
${rows};
END
$DOBLK$;
`
}

const cleanup = `-- ═══ NETTOYAGE DES DOUBLONS ═══
-- Anciens templates remplacés par la séquence Signature V2 et par la File A.
DELETE FROM email_templates WHERE template_key IN (
  'quiz_result', 'quiz_followup_j2', 'quiz_conversion_j5',
  'nurturing_j1', 'nurturing_j3', 'nurturing_j7', 'nurturing_j14',
  'subscription_welcome'
);

-- Anciennes séquences CRM en doublon (Parcours Signature v1 + Nurturing abonné v1).
-- On retire d'abord enrôlements et pas, puis la séquence.
DELETE FROM crm_sequence_enrollments WHERE sequence_id IN (
  SELECT id FROM crm_sequences WHERE trigger_type IN ('signature_test', 'subscription')
);
DELETE FROM crm_sequence_steps WHERE sequence_id IN (
  SELECT id FROM crm_sequences WHERE trigger_type IN ('signature_test', 'subscription')
);
DELETE FROM crm_sequences WHERE trigger_type IN ('signature_test', 'subscription');
`

const header = `-- ════════════════════════════════════════════════════════════════
-- SOS SHINE — CRM e-mail : mise au propre complète
-- Généré depuis le code (voix de Julia, tarifs 49,90€ / 33€, sans essai gratuit).
-- Idempotent : ré-exécutable sans risque. À coller dans l'éditeur SQL Supabase.
--   1) Séquence Signature V2 (corrige ancien prix + « sans carte » + essai gratuit)
--   2) File A (membre), File B (33€), File C (silence)
--   3) Nettoyage des doublons
-- ════════════════════════════════════════════════════════════════
`

const out = [
  header,
  emitSequence(sig()),
  emitSequence(lifecycle(SEQUENCE_A)),
  emitSequence(lifecycle(SEQUENCE_B)),
  emitSequence(lifecycle(SEQUENCE_C)),
  cleanup,
].join('\n')

process.stdout.write(out)
