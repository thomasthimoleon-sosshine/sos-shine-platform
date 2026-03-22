import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'
import { EMAIL_TEMPLATE_SEEDS } from '@/lib/email-templates/seeds'

export async function POST() {
  try {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    // Check if table exists
    const { error: tableCheck } = await supabase
      .from('email_templates')
      .select('id')
      .limit(1)

    if (tableCheck?.code === '42P01') {
      return NextResponse.json({
        error: 'La table email_templates n\'existe pas. Lancez la migration 20260322_email_templates_and_fixes.sql dans Supabase SQL Editor.',
        migration_needed: true,
      }, { status: 500 })
    }

    let inserted = 0
    let updated = 0

    for (const template of EMAIL_TEMPLATE_SEEDS) {
      const { data: existing } = await supabase
        .from('email_templates')
        .select('id')
        .eq('template_key', template.template_key)
        .maybeSingle()

      if (existing) {
        updated++
      } else {
        const { error } = await supabase.from('email_templates').insert(template)
        if (error) {
          console.error(`Failed to seed ${template.template_key}:`, error)
        } else {
          inserted++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${inserted} templates créés, ${updated} déjà existants`,
      total: EMAIL_TEMPLATE_SEEDS.length,
    })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
