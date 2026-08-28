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
import { buildPortrait, publicSincerity } from '@/lib/sosmeet/portrait'
import { buildMirror } from '@/lib/sosmeet/mirror'
import { nextPalier, depth } from '@/lib/sosmeet/paliers'

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
    .select('first_name, birthdate, gender, seeking, city, headline, age_confirmed, sensitive_consent, completed, photo_path, answers, scores')
    .eq('user_id', user.id)
    .maybeSingle()

  // Aperçu « ce que les autres voient » : portrait généré + sincérité publique.
  let preview: { prose: string; sincerity: ReturnType<typeof publicSincerity> } | null = null
  let mirror: ReturnType<typeof buildMirror> | null = null
  let deepen: { next: ReturnType<typeof nextPalier>; depth: number } | null = null
  if (data?.completed && data?.answers) {
    const ans = data.answers as Record<string, number>
    const p = buildPortrait(ans, data.first_name || '', data.gender)
    preview = { prose: p.prose, sincerity: publicSincerity(data.scores?.sincerity) }
    mirror = buildMirror(ans)
    deepen = { next: nextPalier(ans), depth: depth(ans) }
  }

  // Photo : URL signée pour l'aperçu par le propriétaire uniquement.
  let photoUrl: string | null = null
  if (data?.photo_path) {
    const { data: signed } = await (admin as any).storage.from('sosmeet-photos').createSignedUrl(data.photo_path, 3600)
    photoUrl = signed?.signedUrl || null
  }

  // Chemin accompli : protocoles SOS Shine terminés (table user_progress → douleurs).
  let protocols: { title: string; completedAt: string | null }[] = []
  try {
    const { data: prog } = await (admin as any)
      .from('user_progress')
      .select('completed_at, douleurs(title)')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
    protocols = (prog || [])
      .map((p: { completed_at: string | null; douleurs?: { title?: string } }) => ({ title: p.douleurs?.title || '', completedAt: p.completed_at }))
      .filter((p: { title: string }) => p.title)
  } catch { /* non-bloquant */ }

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    profile: data ? { ...data, photoUrl } : null,
    protocols,
    preview,
    mirror,
    deepen,
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
