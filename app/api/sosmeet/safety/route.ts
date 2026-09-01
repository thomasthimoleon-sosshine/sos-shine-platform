/**
 * SOS Meet — sécurité : bloquer ou signaler une personne.
 * POST { action: 'block' | 'report', userId, reason? }.
 * Bloquer retire aussi le match et les intérêts entre les deux.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi.' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  let body: { action?: string; userId?: string; reason?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const target = String(body.userId || '')
  if (!target || target === user.id) return NextResponse.json({ error: 'Cible invalide.' }, { status: 400 })

  if (body.action === 'report') {
    await (admin as any).from('sosmeet_reports').insert({ reporter_id: user.id, reported_id: target, reason: String(body.reason || '').slice(0, 1000) || null })
    return NextResponse.json({ message: 'reported' })
  }

  if (body.action === 'block') {
    await (admin as any).from('sosmeet_blocks').insert({ blocker_id: user.id, blocked_id: target })
    // Coupe le lien : match + intérêts dans les deux sens.
    const [a, b] = [user.id, target].sort()
    await (admin as any).from('sosmeet_matches').delete().eq('user_a', a).eq('user_b', b)
    await (admin as any).from('sosmeet_interests').delete()
      .or(`and(from_user.eq.${user.id},to_user.eq.${target}),and(from_user.eq.${target},to_user.eq.${user.id})`)
    return NextResponse.json({ message: 'blocked' })
  }

  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
}
