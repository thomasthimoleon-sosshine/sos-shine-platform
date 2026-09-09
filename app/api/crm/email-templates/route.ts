import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

export async function GET() {
  try {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('category')
      .order('template_key')

    if (error && error.code === '42P01') {
      // Table doesn't exist yet
      return NextResponse.json({ templates: [], categories: [], table_missing: true })
    }
    if (error) throw error

    // Group by category
    const categories = [
      { key: 'waitlist', label: 'Liste d\'attente', icon: '📋' },
      { key: 'quiz', label: 'Quiz Signature Émotionnelle', icon: '🧬' },
      { key: 'subscription', label: 'Abonnements - Confirmation', icon: '💳' },
      { key: 'nurturing', label: 'Nurturing Post-Inscription', icon: '🌱' },
      { key: 'renewal', label: 'Renouvellement', icon: '🔄' },
      { key: 'cancellation', label: 'Résiliation', icon: '🌙' },
      { key: 'affiliate', label: 'Programme Affilié', icon: '🌟' },
      { key: 'events', label: 'Événements', icon: '📅' },
    ]

    return NextResponse.json({ templates: templates || [], categories })
  } catch (err) {
    console.error('Email templates GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { id, subject, html_content, is_active, name } = await request.json()

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (subject !== undefined) updates.subject = subject
    if (html_content !== undefined) updates.html_content = html_content
    if (is_active !== undefined) updates.is_active = is_active
    if (name !== undefined) updates.name = name

    const { error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email templates PUT error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
