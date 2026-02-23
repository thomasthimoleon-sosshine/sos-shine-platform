import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const { email, firstName, profileKey, profileName } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const { error } = await supabase.from('signature_leads').upsert({
      email: email.toLowerCase().trim(),
      first_name: firstName?.trim() || null,
      profile_key: profileKey || null,
      profile_name: profileName || null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    if (error) {
      console.error('Signature lead insert error:', error)
      if (error.code === '42P01') {
        return NextResponse.json({ message: 'table_missing' }, { status: 200 })
      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ message: 'success' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
