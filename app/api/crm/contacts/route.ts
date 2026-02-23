import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

export async function GET(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50

    let query = supabase
      .from('crm_contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (source && source !== 'all') {
      query = query.eq('source', source)
    }
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ contacts: data || [], total: count || 0, page, limit })
  } catch (err) {
    console.error('CRM contacts error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { action } = await request.json()

    if (action === 'sync') {
      let synced = 0

      const { data: sigLeads } = await supabase
        .from('signature_leads')
        .select('email, first_name, created_at')

      if (sigLeads) {
        for (const lead of sigLeads) {
          const { error } = await supabase.from('crm_contacts').upsert({
            email: lead.email.toLowerCase().trim(),
            first_name: lead.first_name,
            source: 'signature_test',
            created_at: lead.created_at,
          }, { onConflict: 'email' })
          if (!error) synced++
        }
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, prenom, created_at')
        .not('email', 'is', null)

      if (profiles) {
        for (const p of profiles) {
          if (!p.email) continue
          const { error } = await supabase.from('crm_contacts').upsert({
            email: p.email.toLowerCase().trim(),
            first_name: p.prenom,
            source: 'member',
            created_at: p.created_at,
          }, { onConflict: 'email' })
          if (!error) synced++
        }
      }

      return NextResponse.json({ message: 'sync_complete', synced })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('CRM sync error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
