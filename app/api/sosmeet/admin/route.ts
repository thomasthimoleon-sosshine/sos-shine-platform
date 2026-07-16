import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAccess } from '@/lib/crm/auth'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !url.startsWith('http')) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  // Réservé aux admins
  const ok = await verifyAdminAccess()
  if (!ok) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ waitlist: [], profiles: {} })

  const { data: waitlist } = await supabase
    .from('sosmeet_waitlist')
    .select('email, first_name, city, stage, consent, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const { data: profiles } = await supabase
    .from('sosmeet_profiles')
    .select('email, scores, completed, updated_at')
    .limit(2000)

  // Indexer les profils par email
  const profMap: Record<string, { completed: boolean; scores: Record<string, number>; updated_at: string }> = {}
  for (const p of profiles || []) {
    profMap[(p as { email: string }).email] = {
      completed: (p as { completed: boolean }).completed,
      scores: ((p as { scores: Record<string, number> }).scores) || {},
      updated_at: (p as { updated_at: string }).updated_at,
    }
  }

  return NextResponse.json({
    waitlist: waitlist || [],
    profiles: profMap,
    counts: {
      waitlist: (waitlist || []).length,
      profilesCompleted: (profiles || []).filter((p) => (p as { completed: boolean }).completed).length,
    },
  })
}
