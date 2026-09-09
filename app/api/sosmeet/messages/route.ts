/**
 * SOS Meet — messagerie (uniquement entre profils matchés).
 * GET  ?matchId= : messages de la conversation (si l'utilisateur en fait partie).
 * POST { matchId, body } : envoie un message.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function ctx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  return { user, admin }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function isMember(admin: any, matchId: string, userId: string) {
  const { data } = await admin.from('sosmeet_matches').select('user_a, user_b').eq('id', matchId).maybeSingle()
  return data && (data.user_a === userId || data.user_b === userId)
}

export async function GET(request: Request) {
  const { user, admin } = await ctx()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })
  const matchId = new URL(request.url).searchParams.get('matchId') || ''
  if (!matchId || !(await isMember(admin, matchId, user.id))) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { data } = await (admin as any).from('sosmeet_messages')
    .select('id, sender_id, body, created_at').eq('match_id', matchId).order('created_at', { ascending: true }).limit(500)
  const messages = (data || []).map((m: { id: string; sender_id: string; body: string; created_at: string }) => ({
    id: m.id, body: m.body, fromMe: m.sender_id === user.id, at: m.created_at,
  }))
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const { user, admin } = await ctx()
  if (!user) return NextResponse.json({ error: 'Connecte-toi.' }, { status: 401 })
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })
  let body: { matchId?: string; body?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const matchId = String(body.matchId || '')
  const text = String(body.body || '').trim().slice(0, 4000)
  if (!text) return NextResponse.json({ error: 'Message vide.' }, { status: 400 })
  if (!matchId || !(await isMember(admin, matchId, user.id))) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { error } = await (admin as any).from('sosmeet_messages').insert({ match_id: matchId, sender_id: user.id, body: text })
  if (error) return NextResponse.json({ error: 'Envoi impossible.' }, { status: 500 })
  return NextResponse.json({ message: 'success' })
}
