import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

export async function GET() {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { data: sequences, error } = await supabase
      .from('crm_sequences')
      .select('*, crm_sequence_steps(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    for (const seq of (sequences || [])) {
      const { count } = await supabase
        .from('crm_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('status', 'active')

      seq.active_enrollments = count || 0

      const { count: completedCount } = await supabase
        .from('crm_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('status', 'completed')

      seq.completed_enrollments = completedCount || 0
    }

    return NextResponse.json({ sequences: sequences || [] })
  } catch (err) {
    console.error('CRM sequences error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { name, trigger_type, steps } = await request.json()

    if (!name || !trigger_type || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Nom, déclencheur et au moins un email sont requis' }, { status: 400 })
    }

    const { data: sequence, error } = await supabase
      .from('crm_sequences')
      .insert({ name, trigger_type, status: 'active' })
      .select()
      .single()

    if (error) throw error

    const stepsToInsert = steps.map((step: { subject: string; html_content: string; delay_days: number }, i: number) => ({
      sequence_id: sequence.id,
      step_order: i,
      delay_days: step.delay_days || 0,
      subject: step.subject,
      html_content: step.html_content,
    }))

    const { error: stepsErr } = await supabase
      .from('crm_sequence_steps')
      .insert(stepsToInsert)

    if (stepsErr) throw stepsErr

    return NextResponse.json({ sequence }, { status: 201 })
  } catch (err) {
    console.error('CRM sequence create error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { id, name, trigger_type, status, steps } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (trigger_type) updates.trigger_type = trigger_type
    if (status) updates.status = status

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('crm_sequences')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    }

    if (steps && Array.isArray(steps)) {
      await supabase
        .from('crm_sequence_steps')
        .delete()
        .eq('sequence_id', id)

      const stepsToInsert = steps.map((step: { subject: string; html_content: string; delay_days: number }, i: number) => ({
        sequence_id: id,
        step_order: i,
        delay_days: step.delay_days || 0,
        subject: step.subject,
        html_content: step.html_content,
      }))

      const { error: stepsErr } = await supabase
        .from('crm_sequence_steps')
        .insert(stepsToInsert)
      if (stepsErr) throw stepsErr
    }

    return NextResponse.json({ message: 'updated' })
  } catch (err) {
    console.error('CRM sequence update error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await supabase.from('crm_sequence_steps').delete().eq('sequence_id', id)
    await supabase.from('crm_sequence_enrollments').delete().eq('sequence_id', id)

    const { error } = await supabase.from('crm_sequences').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ message: 'deleted' })
  } catch (err) {
    console.error('CRM sequence delete error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
