import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'

export async function POST(request: Request) {
  try {
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { trigger_type, email, first_name } = await request.json()
    if (!trigger_type || !email) {
      return NextResponse.json({ error: 'trigger_type et email requis' }, { status: 400 })
    }

    const { data: sequences } = await supabase
      .from('crm_sequences')
      .select('id')
      .eq('trigger_type', trigger_type)
      .eq('status', 'active')

    if (!sequences || sequences.length === 0) {
      return NextResponse.json({ message: 'Aucune séquence active pour ce déclencheur', enrolled: 0 })
    }

    let enrolled = 0
    for (const seq of sequences) {
      const { data: firstStep } = await supabase
        .from('crm_sequence_steps')
        .select('step_order, delay_days')
        .eq('sequence_id', seq.id)
        .order('step_order', { ascending: true })
        .limit(1)
        .single()

      if (!firstStep) continue

      const nextSendAt = new Date()
      nextSendAt.setDate(nextSendAt.getDate() + firstStep.delay_days)

      const { error } = await supabase
        .from('crm_sequence_enrollments')
        .upsert({
          sequence_id: seq.id,
          contact_email: email,
          contact_first_name: first_name || null,
          current_step: firstStep.step_order,
          next_send_at: nextSendAt.toISOString(),
          status: 'active',
        }, { onConflict: 'sequence_id,contact_email', ignoreDuplicates: true })

      if (!error) enrolled++
    }

    return NextResponse.json({ message: 'OK', enrolled })
  } catch (err) {
    console.error('Sequence enroll error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
