import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Missing config', url_exists: !!url, key_exists: !!key, url_starts: url?.substring(0, 30) || 'null' })
    }

    const supabase = createClient(url, key)

    const { data: leads, error: e1 } = await supabase.from('signature_leads').select('email, first_name, profile_name, created_at').order('created_at', { ascending: false })
    const { data: contacts, error: e2 } = await supabase.from('crm_contacts').select('email, first_name, source, created_at').order('created_at', { ascending: false })
    const { data: profiles, error: e3 } = await supabase.from('profiles').select('email, prenom').not('email', 'is', null)

    return NextResponse.json({
      signature_leads: e1 ? { error: e1.message } : (leads || []),
      crm_contacts: e2 ? { error: e2.message } : (contacts || []),
      profiles: e3 ? { error: e3.message } : (profiles || []),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) })
  }
}
