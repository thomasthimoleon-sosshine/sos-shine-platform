import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EMAIL_TEMPLATE_SEEDS } from '@/lib/email-templates/seeds'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Config manquante' }, { status: 500 })

  let inserted = 0
  let updated = 0
  const errors: string[] = []

  for (const template of EMAIL_TEMPLATE_SEEDS) {
    const { error } = await supabase
      .from('email_templates')
      .upsert(template, { onConflict: 'template_key' })

    if (error) {
      errors.push(`${template.template_key}: ${error.message}`)
    } else {
      // Check if it was an insert or update
      inserted++
    }
  }

  return NextResponse.json({
    ok: true,
    total: EMAIL_TEMPLATE_SEEDS.length,
    processed: inserted,
    errors: errors.length > 0 ? errors : undefined,
  })
}
