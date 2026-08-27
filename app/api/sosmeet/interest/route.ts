/**
 * SOS Meet — marquer un intérêt (« se connecter en conscience »).
 * POST { toUser } : enregistre l'intérêt ; si l'autre a déjà marqué le sien,
 * crée un match réciproque (paire ordonnée) → la révélation peut avoir lieu.
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

  let body: { toUser?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const toUser = String(body.toUser || '')
  if (!toUser || toUser === user.id) return NextResponse.json({ error: 'Destinataire invalide.' }, { status: 400 })

  // Bloqué dans un sens ou l'autre ? → refus silencieux
  const { data: blocked } = await (admin as any).from('sosmeet_blocks').select('id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${toUser}),and(blocker_id.eq.${toUser},blocked_id.eq.${user.id})`).limit(1)
  if (blocked && blocked.length) return NextResponse.json({ message: 'ok', matched: false })

  // Enregistre l'intérêt (idempotent)
  await (admin as any).from('sosmeet_interests').insert({ from_user: user.id, to_user: toUser })

  // Réciprocité ?
  const { data: back } = await (admin as any).from('sosmeet_interests').select('id')
    .eq('from_user', toUser).eq('to_user', user.id).limit(1)

  if (back && back.length) {
    const [a, b] = [user.id, toUser].sort()
    await (admin as any).from('sosmeet_matches').insert({ user_a: a, user_b: b })
    return NextResponse.json({ message: 'ok', matched: true })
  }
  return NextResponse.json({ message: 'ok', matched: false })
}
