/**
 * SOS Meet — profil du compte connecté (« Mes infos »).
 * Relie le profil SOS Meet au compte SOS Shine (auth.users).
 * GET  : renvoie les infos de base du profil de l'utilisateur connecté.
 * POST : enregistre / met à jour ces infos (identité + consentements).
 *
 * Écriture via le client admin (RLS fermée sur les tables SOS Meet).
 * Upsert manuel (par user_id) pour rester robuste quel que soit l'état du schéma.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const GENDERS = ['femme', 'homme', 'non-binaire', 'autre']
const SEEKING = ['femmes', 'hommes', 'tout']

function ageFrom(birthdate: string): number | null {
  const d = new Date(birthdate)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const { data } = await (admin as any)
    .from('sosmeet_profiles')
    .select('first_name, birthdate, gender, seeking, city, headline, age_confirmed, sensitive_consent, completed')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    profile: data || null,
    infosDone: !!(data && data.first_name && data.birthdate && data.gender && data.age_confirmed),
  })
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi pour créer ton profil.' }, { status: 401 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const firstName = String(body.firstName || '').trim().slice(0, 80)
  const birthdate = String(body.birthdate || '').slice(0, 10)
  const gender = String(body.gender || '')
  const seeking = Array.isArray(body.seeking) ? (body.seeking as string[]).filter(s => SEEKING.includes(s)) : []
  const city = String(body.city || '').trim().slice(0, 80)
  const headline = String(body.headline || '').trim().slice(0, 160)
  const ageConfirmed = body.ageConfirmed === true
  const sensitiveConsent = body.sensitiveConsent === true

  if (!firstName) return NextResponse.json({ error: 'Ton prénom est requis.' }, { status: 400 })
  if (!GENDERS.includes(gender)) return NextResponse.json({ error: 'Merci d’indiquer ton genre.' }, { status: 400 })
  if (seeking.length === 0) return NextResponse.json({ error: 'Indique qui tu cherches.' }, { status: 400 })
  const age = ageFrom(birthdate)
  if (age == null) return NextResponse.json({ error: 'Date de naissance invalide.' }, { status: 400 })
  if (age < 18 || !ageConfirmed) return NextResponse.json({ error: 'SOS Meet est réservé aux personnes majeures.' }, { status: 400 })

  const email = (user.email || '').toLowerCase()

  // Compat FK historique (email → waitlist) : on garantit une ligne waitlist.
  try {
    await (admin as any).from('sosmeet_waitlist').insert({ email, first_name: firstName, consent: true })
  } catch { /* déjà présent : ignoré */ }

  const fields = {
    user_id: user.id,
    email,
    first_name: firstName,
    birthdate,
    gender,
    seeking,
    city: city || null,
    headline: headline || null,
    age_confirmed: true,
    sensitive_consent: sensitiveConsent,
    updated_at: new Date().toISOString(),
  }

  // Upsert manuel par user_id (robuste sans index unique).
  const { data: existing } = await (admin as any).from('sosmeet_profiles').select('id').eq('user_id', user.id).maybeSingle()

  let error
  if (existing) {
    ;({ error } = await (admin as any).from('sosmeet_profiles').update(fields).eq('id', existing.id))
  } else {
    // Récupère une éventuelle ligne créée par l'ancien flux (par email) pour ne pas dupliquer.
    const { data: byEmail } = await (admin as any).from('sosmeet_profiles').select('id').eq('email', email).maybeSingle()
    if (byEmail) {
      ;({ error } = await (admin as any).from('sosmeet_profiles').update(fields).eq('id', byEmail.id))
    } else {
      ;({ error } = await (admin as any).from('sosmeet_profiles').insert(fields))
    }
  }

  if (error) {
    console.error('[sosmeet/me] save error:', error.code, error.message)
    return NextResponse.json({ error: 'Enregistrement impossible, réessaie.' }, { status: 500 })
  }
  return NextResponse.json({ message: 'success' })
}
