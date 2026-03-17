import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer service role key (bypasses RLS), fall back to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
      console.error('Waitlist: Missing SUPABASE_URL or SUPABASE_ANON_KEY')
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name?.trim() || null

    // Try inserting into waitlist table
    const { error: waitlistError } = await supabase
      .from('waitlist')
      .insert({ email: cleanEmail, name: cleanName })

    if (waitlistError) {
      // Duplicate email (unique constraint violation)
      if (waitlistError.code === '23505') {
        return NextResponse.json({ message: 'already_registered' }, { status: 200 })
      }

      // Table might not exist (42P01) - fall back to crm_contacts only
      if (waitlistError.code === '42P01') {
        console.warn('Waitlist table does not exist, using crm_contacts as fallback')
      } else {
        console.error('Waitlist insert error:', waitlistError.code, waitlistError.message)
      }
    }

    // Also add to CRM contacts (this is the main reliable storage)
    try {
      const { error: crmError } = await supabase.from('crm_contacts').upsert({
        email: cleanEmail,
        first_name: cleanName,
        source: 'waitlist',
      }, { onConflict: 'email', ignoreDuplicates: true })

      if (crmError) {
        console.error('CRM contacts upsert error:', crmError.code, crmError.message)
        // If both waitlist AND crm_contacts failed, return error
        if (waitlistError && waitlistError.code !== '23505') {
          return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
        }
      }
    } catch (e) {
      console.error('CRM contacts exception:', e)
      // If waitlist also failed, return error
      if (waitlistError && waitlistError.code !== '23505') {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
      }
    }

    // Enroll in waitlist sequence
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
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
  } catch (e) {
    console.error('Waitlist POST exception:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ count: 0 })
    }

    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      // Table might not exist - try counting from crm_contacts
      const { count: crmCount } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'waitlist')

      return NextResponse.json({ count: crmCount || 0 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
