/**
 * SOS Meet — mes matchs. Renvoie les personnes avec qui l'intérêt est
 * réciproque. La photo est ICI dévoilée (URL signée) : le match l'autorise.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildIcebreaker } from '@/lib/sosmeet/icebreaker'

function ageFrom(bd?: string | null): number | null {
  if (!bd) return null
  const d = new Date(bd); if (isNaN(d.getTime())) return null
  const n = new Date(); let a = n.getFullYear() - d.getFullYear()
  const m = n.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--
  return a
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const { data: matches } = await (admin as any).from('sosmeet_matches')
    .select('id, user_a, user_b, created_at')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Mes réponses (pour l'amorce de conversation).
  const { data: meRow } = await (admin as any).from('sosmeet_profiles').select('answers').eq('user_id', user.id).maybeSingle()
  const myAnswers = (meRow?.answers as Record<string, number>) || {}

  const out = []
  for (const m of (matches || [])) {
    const other = m.user_a === user.id ? m.user_b : m.user_a
    const { data: p } = await (admin as any).from('sosmeet_profiles')
      .select('first_name, birthdate, city, headline, photo_path, answers').eq('user_id', other).maybeSingle()
    const icebreaker = buildIcebreaker(myAnswers, (p?.answers as Record<string, number>) || {}, m.id)
    let photoUrl: string | null = null
    if (p?.photo_path) {
      const { data: signed } = await (admin as any).storage.from('sosmeet-photos').createSignedUrl(p.photo_path, 3600)
      photoUrl = signed?.signedUrl || null
    }
    // dernier message
    const { data: last } = await (admin as any).from('sosmeet_messages')
      .select('body, sender_id, created_at').eq('match_id', m.id).order('created_at', { ascending: false }).limit(1)
    out.push({
      matchId: m.id,
      other: { userId: other, firstName: p?.first_name || '', age: ageFrom(p?.birthdate), city: p?.city || null, headline: p?.headline || null, photoUrl },
      lastMessage: last && last.length ? { body: last[0].body, fromMe: last[0].sender_id === user.id, at: last[0].created_at } : null,
      icebreaker,
    })
  }
  return NextResponse.json({ matches: out })
}
