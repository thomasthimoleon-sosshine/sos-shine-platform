import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Use {firstName} and {email} as placeholders — replaced at send time
const PLACEHOLDER = { firstName: '{firstName}', email: '{email}', resumeUrl: '{resumeUrl}', topProtocol: '{topProtocol}', dominant: '3', q15Response: '{q15Response}' }

const SAMPLE_SCORES: Record<string, number> = { '1': 40, '2': 20, '3': 100, '4': 60, '5': 30, '6': 50, '7': 35, '8': 25, '9': 80, '10': 45 }
const SAMPLE_PROTOCOLS = [
  { title: 'Déconditionnement Émotionnel', matchScore: 92, status: 'available', duration_days: 30 },
  { title: 'Confiance & Estime', matchScore: 85, status: 'coming_soon', duration_days: 21 },
]

const EMAILS = [
  { order: 1,  delay: 0,  label: 'Capture (quiz pas fini)', gen: () => generateEmail01({ ...PLACEHOLDER, resumeUrl: 'https://sosshine.com/signature-emotionnelle' }) },
  { order: 2,  delay: 0,  label: 'Résultat complet', gen: () => generateEmail02({ ...PLACEHOLDER, dominant: '3', secondary: '9', scores: SAMPLE_SCORES, q15Response: '{q15Response}', protocols: SAMPLE_PROTOCOLS }) },
  { order: 3,  delay: 1,  label: 'La question qui touche', gen: () => generateEmail03(PLACEHOLDER) },
  { order: 4,  delay: 2,  label: 'Pourquoi maintenant', gen: () => generateEmail04(PLACEHOLDER) },
  { order: 5,  delay: 3,  label: "L'histoire de Julia", gen: () => generateEmail05(PLACEHOLDER) },
  { order: 6,  delay: 4,  label: 'Témoignage Camille', gen: () => generateEmail06(PLACEHOLDER) },
  { order: 7,  delay: 5,  label: 'Pratique gratuite 3 min', gen: () => generateEmail07({ ...PLACEHOLDER, topProtocol: '{topProtocol}' }) },
  { order: 8,  delay: 6,  label: 'Objection temps', gen: () => generateEmail08(PLACEHOLDER) },
  { order: 9,  delay: 7,  label: 'Objection argent', gen: () => generateEmail09(PLACEHOLDER) },
  { order: 10, delay: 8,  label: 'Jour de repos', gen: () => generateEmail10(PLACEHOLDER) },
  { order: 11, delay: 9,  label: 'Bascule commerciale', gen: () => generateEmail11(PLACEHOLDER) },
  { order: 12, delay: 10, label: "Ce qui t'attend dedans", gen: () => generateEmail12(PLACEHOLDER) },
  { order: 13, delay: 11, label: 'Le doute', gen: () => generateEmail13(PLACEHOLDER) },
  { order: 14, delay: 12, label: 'Les 3 raisons', gen: () => generateEmail14(PLACEHOLDER) },
  { order: 15, delay: 13, label: 'Avant-dernier', gen: () => generateEmail15(PLACEHOLDER) },
  { order: 16, delay: 14, label: 'Dernier + cadeau', gen: () => generateEmail16(PLACEHOLDER) },
]

export async function POST() {
  return seedEmails()
}

export async function GET() {
  return seedEmails()
}

async function seedEmails() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  // Find or create the quiz v2 sequence
  let { data: sequences } = await supabase
    .from('crm_sequences')
    .select('id')
    .eq('trigger_type', 'signature_test_v2')
    .limit(1)

  if (!sequences || sequences.length === 0) {
    const { data: created, error: createErr } = await supabase
      .from('crm_sequences')
      .insert({ name: 'Signature Émotionnelle V2', trigger_type: 'signature_test_v2', status: 'active' })
      .select('id')
      .single()

    if (createErr || !created) {
      return NextResponse.json({ error: 'Failed to create sequence', details: createErr?.message }, { status: 500 })
    }
    sequences = [created]
  }

  const sequenceId = sequences[0].id

  // Delete existing steps for this sequence (clean re-seed)
  await supabase.from('crm_sequence_steps').delete().eq('sequence_id', sequenceId)

  // Insert all 16 emails
  let inserted = 0
  for (const email of EMAILS) {
    const { subject, html } = email.gen()

    const { error } = await supabase.from('crm_sequence_steps').insert({
      sequence_id: sequenceId,
      step_order: email.order,
      delay_days: email.delay,
      subject: subject,
      html_content: html,
    })

    if (error) {
      console.error(`Failed to seed email ${email.order}:`, error.message)
    } else {
      inserted++
    }
  }

  return NextResponse.json({ ok: true, inserted, sequenceId })
}
