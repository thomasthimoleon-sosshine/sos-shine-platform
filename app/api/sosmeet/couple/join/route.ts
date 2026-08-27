/**
 * SOS Meet Couple — rejoindre un duo par son code.
 * Le code donne accès à un espace intime : la route est limitée en débit,
 * sinon un code de 8 caractères devient énumérable.
 */
import { NextResponse } from 'next/server'
import { currentUser, admin, coupleOf, audit } from '@/lib/sosmeet/couple/store'
import { normalizeInviteCode, isValidShape, isExpired } from '@/lib/sosmeet/couple/invite'

// Limitation de débit en mémoire. Suffisante pour ce volume, et sans
// dépendance : une tentative toutes les 3 secondes, 10 par quart d'heure.
const attempts = new Map<string, number[]>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function rateLimited(key: string): boolean {
  const now = Date.now()
  const hits = (attempts.get(key) || []).filter(t => now - t < WINDOW_MS)
  hits.push(now)
  attempts.set(key, hits)
  if (attempts.size > 5000) attempts.clear()   // garde-fou mémoire
  return hits.length > MAX_ATTEMPTS
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi pour rejoindre votre duo.' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  if (rateLimited(user.id)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans quelques minutes.' }, { status: 429 })
  }

  let body: { code?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const code = normalizeInviteCode(body.code || '')
  if (!isValidShape(code)) return NextResponse.json({ error: 'Ce code n’est pas valide.' }, { status: 400 })

  const already = await coupleOf(user.id)
  if (already) return NextResponse.json({ error: 'Tu as déjà un duo en cours.' }, { status: 409 })

  const { data: couple } = await (db as any).from('sosmeet_couples')
    .select('id, partner_a, partner_b, invite_expires, status')
    .eq('invite_code', code).neq('status', 'ARCHIVE').maybeSingle()

  // Message volontairement identique pour un code inconnu et un code périmé :
  // on ne renseigne pas quelqu'un qui chercherait à deviner des codes.
  if (!couple) return NextResponse.json({ error: 'Ce code ne correspond à aucune invitation active.' }, { status: 404 })
  if (isExpired(couple.invite_expires)) {
    return NextResponse.json({ error: 'Ce code ne correspond à aucune invitation active.' }, { status: 404 })
  }
  if (couple.partner_b) return NextResponse.json({ error: 'Ce duo est déjà complet.' }, { status: 409 })
  if (couple.partner_a === user.id) return NextResponse.json({ error: 'C’est ton propre code d’invitation.' }, { status: 400 })

  const { error } = await (db as any).from('sosmeet_couples').update({
    partner_b: user.id,
    status: 'DUO_FORME',
    updated_at: new Date().toISOString(),
  }).eq('id', couple.id).is('partner_b', null)   // course : le premier arrivé gagne

  if (error) {
    console.error('[couple/join]', error.code, error.message)
    return NextResponse.json({ error: 'Impossible de rejoindre, réessaie.' }, { status: 500 })
  }

  await audit(couple.id, user.id, 'duo_rejoint')
  return NextResponse.json({ coupleId: couple.id })
}
