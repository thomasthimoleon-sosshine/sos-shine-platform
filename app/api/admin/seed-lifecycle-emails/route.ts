/**
 * Seed des séquences de cycle de vie (Files A / B / C) dans la base.
 * Idempotent : recrée la séquence si besoin, remplace tous ses pas.
 *
 * Les délais des fichiers de file sont ABSOLUS (jours depuis l'entrée dans la file).
 * Le cron générique (cron/emails) avance avec un délai INCRÉMENTAL, donc on convertit ici.
 *
 * Appel : GET/POST /api/admin/seed-lifecycle-emails  (protégé par CRON_SECRET/BOT_SECRET).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SEQUENCE_A } from '@/lib/email-templates/lifecycle/fileA'
import { SEQUENCE_B } from '@/lib/email-templates/lifecycle/fileB'
import { SEQUENCE_C } from '@/lib/email-templates/lifecycle/fileC'
import type { LifecycleSequence } from '@/lib/email-templates/lifecycle/shared'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const PLACEHOLDER = { firstName: '{firstName}', email: '{email}' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedSequence(supabase: any, seq: LifecycleSequence) {
  // 1. Trouver ou créer la séquence.
  let seqId: string
  const { data: found } = await supabase
    .from('crm_sequences')
    .select('id')
    .eq('trigger_type', seq.triggerType)
    .limit(1)

  if (found && found.length > 0) {
    seqId = found[0].id
    await supabase.from('crm_sequences').update({ name: seq.name, status: 'active' }).eq('id', seqId)
    // On remplace tous les pas existants.
    await supabase.from('crm_sequence_steps').delete().eq('sequence_id', seqId)
  } else {
    const { data: created, error } = await supabase
      .from('crm_sequences')
      .insert({ name: seq.name, trigger_type: seq.triggerType, status: 'active' })
      .select('id')
      .single()
    if (error || !created) throw new Error(`create sequence ${seq.triggerType}: ${error?.message}`)
    seqId = created.id
  }

  // 2. Convertir délais absolus → incrémentaux et insérer les pas.
  const sorted = [...seq.steps].sort((a, b) => a.order - b.order)
  let prevAbs = 0
  const rows = sorted.map((step, i) => {
    const gap = i === 0 ? step.delay : step.delay - prevAbs
    prevAbs = step.delay
    const built = step.build(PLACEHOLDER)
    return {
      sequence_id: seqId,
      step_order: step.order,
      delay_days: Math.max(0, gap),
      subject: built.subject,
      html_content: built.html,
    }
  })

  const { error: insErr } = await supabase.from('crm_sequence_steps').insert(rows)
  if (insErr) throw new Error(`insert steps ${seq.triggerType}: ${insErr.message}`)

  return { trigger: seq.triggerType, name: seq.name, steps: rows.length }
}

async function run(request: Request) {
  const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
  const authHeader = request.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  try {
    const results = []
    for (const seq of [SEQUENCE_A, SEQUENCE_B, SEQUENCE_C]) {
      results.push(await seedSequence(supabase, seq))
    }
    return NextResponse.json({ ok: true, seeded: results })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function GET(request: Request) { return run(request) }
export async function POST(request: Request) { return run(request) }
