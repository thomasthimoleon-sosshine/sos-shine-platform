import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

export async function GET() {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { data, error } = await supabase
      .from('crm_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ campaigns: data || [] })
  } catch (err) {
    console.error('CRM campaigns error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const body = await request.json()
    const { name, subject, html_content, segment } = body

    if (!name || !subject || !html_content) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('crm_campaigns')
      .insert({
        name,
        subject,
        html_content,
        segment: segment || 'all',
        status: 'draft',
        sent_count: 0,
        open_count: 0,
        click_count: 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (err) {
    console.error('CRM campaign create error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const { data, error } = await supabase
      .from('crm_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data })
  } catch (err) {
    console.error('CRM campaign update error:', err)
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

    const { error } = await supabase
      .from('crm_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ message: 'deleted' })
  } catch (err) {
    console.error('CRM campaign delete error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
