import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name?.trim() || null

    // Insert into waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: cleanEmail, name: cleanName })

    if (error) {
      // Duplicate email (unique constraint violation)
      if (error.code === '23505') {
        return NextResponse.json({ message: 'already_registered' }, { status: 200 })
      }
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Also add to CRM contacts
    try {
      await supabase.from('crm_contacts').upsert({
        email: cleanEmail,
        first_name: cleanName,
        source: 'waitlist',
      }, { onConflict: 'email', ignoreDuplicates: true })
    } catch {}

    // Enroll in waitlist sequence
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
        || ''
      if (siteUrl) {
        await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger_type: 'waitlist',
            email: cleanEmail,
            first_name: cleanName,
          }),
        })
      }
    } catch {}

    return NextResponse.json({ message: 'success' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ count: 0 })
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
