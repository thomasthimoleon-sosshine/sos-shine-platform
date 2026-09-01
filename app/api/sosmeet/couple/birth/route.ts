/**
 * SOS Meet Couple — date de naissance, pour la lecture énergétique.
 * Donnée sensible et facultative : sans consentement explicite, rien n'est
 * enregistré et le couple a quand même sa carte.
 * Chacun ne voit et ne modifie que la sienne.
 */
import { NextResponse } from 'next/server'
import { currentUser, admin, coupleOf, sideOf, audit } from '@/lib/sosmeet/couple/store'

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })
  const couple = await coupleOf(user.id)
  if (!couple) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  const { data } = await (db as any).from('sosmeet_couple_birth')
    .select('birth_date, birth_time, birth_place, consent')
    .eq('couple_id', couple.id).eq('user_id', user.id).maybeSingle()
  return NextResponse.json({ naissance: data || null })
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const couple = await coupleOf(user.id)
  if (!couple || !sideOf(couple, user.id)) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  let body: { date?: string; heure?: string; lieu?: string; lat?: number; lon?: number; consent?: boolean }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  if (body.consent !== true) {
    return NextResponse.json({ error: 'Sans ton accord, on n’enregistre rien.' }, { status: 400 })
  }
  const date = String(body.date || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: 'Date de naissance invalide.' }, { status: 400 })
  }
  const heure = body.heure && /^\d{2}:\d{2}$/.test(body.heure) ? body.heure : null

  const fields = {
    couple_id: couple.id, user_id: user.id,
    birth_date: date, birth_time: heure,
    birth_place: body.lieu ? String(body.lieu).trim().slice(0, 120) : null,
    birth_lat: typeof body.lat === 'number' ? body.lat : null,
    birth_lon: typeof body.lon === 'number' ? body.lon : null,
    time_accuracy: heure ? 'exacte' : 'inconnue',
    consent: true,
  }

  const { data: existant } = await (db as any).from('sosmeet_couple_birth')
    .select('id').eq('couple_id', couple.id).eq('user_id', user.id).maybeSingle()

  const { error } = existant
    ? await (db as any).from('sosmeet_couple_birth').update(fields).eq('id', existant.id)
    : await (db as any).from('sosmeet_couple_birth').insert(fields)

  if (error) {
    console.error('[couple/birth]', error.code, error.message)
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 })
  }
  await audit(couple.id, user.id, 'naissance_enregistree')
  return NextResponse.json({ message: 'success' })
}
