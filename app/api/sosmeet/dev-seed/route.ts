/**
 * SOS Meet — SEED DE DÉMO (dev/projection uniquement).
 * Crée des faux profils réalistes (scores calculés par les vrais moteurs) pour
 * peupler la Découverte et permettre de se projeter. Idempotent.
 *
 * ⚠️ À RETIRER avant la vraie ouverture publique. Protégé par un token.
 * Appel : POST /api/sosmeet/dev-seed?token=SEED_MEET_2026
 *   body optionnel { likeEmail?: string }  → 2 faux profils « t'ont déjà remarqué »
 *   (match instantané quand tu cliques « Se connecter »).
 * Nettoyage : DELETE /api/sosmeet/dev-seed?token=SEED_MEET_2026
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeProfile, type Answers } from '@/lib/sosmeet/matching'
import { computeSincerity } from '@/lib/sosmeet/coherence'

const TOKEN = 'SEED_MEET_2026'
const DEMO_DOMAIN = 'demo.sosmeet.test'

// Base cohérente (profil « sécure, prêt, monogame »), puis variations par persona.
const BASE: Answers = { q1: 32, q131: 0, q134: 0, q127: 0, q140: 4, q148: 0, q133: 0, q83: 0, q80: 1, q87: 3, q88: 2, q95: 3, q96: 1, q105: 0, q104: 0, q166: 0, q168: 1, q149: 0, q144: 0, q16: 1, q21: 1, q23: 1, q32: 1, q116: 2, q120: 0, q125: 0 }

type Persona = {
  slug: string; first_name: string; gender: string; seeking: string[]
  city: string; birthYear: number; headline: string; a: Answers
}

const PERSONAS: Persona[] = [
  { slug: 'lea', first_name: 'Léa', gender: 'femme', seeking: ['hommes'], city: 'Paris', birthYear: 1993, headline: 'Je cherche du vrai, pas du bruit.', a: { ...BASE, q1: 31, q87: 3, q88: 3, q149: 0, q144: 0 } },
  { slug: 'chloe', first_name: 'Chloé', gender: 'femme', seeking: ['tout'], city: 'Lyon', birthYear: 1990, headline: 'Douce le jour, intense la nuit.', a: { ...BASE, q1: 34, q95: 4, q96: 2, q116: 3, q120: 1 } },
  { slug: 'ines', first_name: 'Inès', gender: 'femme', seeking: ['hommes'], city: 'Bordeaux', birthYear: 1996, headline: 'Le silence à deux, c’est déjà beaucoup.', a: { ...BASE, q1: 28, q83: 1, q168: 2, q127: 1, q140: 3 } },
  { slug: 'marie', first_name: 'Marie', gender: 'femme', seeking: ['femmes', 'hommes'], city: 'Paris', birthYear: 1988, headline: 'J’ai fait le travail. Je suis prête.', a: { ...BASE, q1: 37, q140: 4, q144: 0, q149: 0, q88: 3 } },
  { slug: 'sarah', first_name: 'Sarah', gender: 'femme', seeking: ['hommes'], city: 'Autre', birthYear: 1994, headline: 'Curieuse de tout, exigeante sur l’essentiel.', a: { ...BASE, q1: 30, q116: 3, q125: 1, q166: 1, q168: 2 } },
  { slug: 'thomas-d', first_name: 'Thomas', gender: 'homme', seeking: ['femmes'], city: 'Paris', birthYear: 1989, headline: 'Présent, entier, sans jeu.', a: { ...BASE, q1: 36, q87: 3, q88: 2, q83: 0, q140: 4 } },
  { slug: 'julien', first_name: 'Julien', gender: 'homme', seeking: ['femmes'], city: 'Lyon', birthYear: 1992, headline: 'La tendresse est un courage.', a: { ...BASE, q1: 33, q95: 3, q96: 1, q149: 0, q144: 0 } },
  { slug: 'adam', first_name: 'Adam', gender: 'homme', seeking: ['tout'], city: 'Bordeaux', birthYear: 1995, headline: 'On construit ou on ne commence pas.', a: { ...BASE, q1: 29, q131: 0, q140: 4, q168: 1, q127: 0 } },
  { slug: 'nathan', first_name: 'Nathan', gender: 'homme', seeking: ['femmes'], city: 'Paris', birthYear: 1987, headline: 'Libre, mais fidèle à ce qui compte.', a: { ...BASE, q1: 38, q133: 1, q105: 1, q116: 2, q120: 1 } },
  { slug: 'gabriel', first_name: 'Gabriel', gender: 'homme', seeking: ['hommes'], city: 'Autre', birthYear: 1991, headline: 'Deux présences valent mille promesses.', a: { ...BASE, q1: 35, q87: 2, q88: 3, q149: 0, q168: 1 } },
]

function birthdate(year: number): string { return `${year}-06-15` }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildScores(a: Answers): any {
  const p = computeProfile(a)
  const s = computeSincerity(a)
  return { dimensions: p.dimensions, filters: p.filters, answered: p.answered, sincerity: s }
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('token') !== TOKEN) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const admin = createAdminClient()

  let likeEmail: string | undefined
  try { likeEmail = (await request.json())?.likeEmail } catch { /* pas de body */ }

  const created: string[] = []
  const idBySlug: Record<string, string> = {}

  for (const p of PERSONAS) {
    const email = `${p.slug}@${DEMO_DOMAIN}`
    // Idempotence : profil déjà présent ?
    const { data: existing } = await (admin as any).from('sosmeet_profiles').select('user_id').eq('email', email).maybeSingle()
    let userId = existing?.user_id as string | undefined

    if (!userId) {
      // Crée l'utilisateur auth (ou récupère s'il existe déjà)
      const { data: cu, error: ce } = await admin.auth.admin.createUser({ email, email_confirm: true, password: `Demo!${p.slug}2026` })
      if (ce && !/already/i.test(ce.message)) return NextResponse.json({ error: `auth: ${ce.message}` }, { status: 500 })
      userId = cu?.user?.id
      if (!userId) {
        // déjà existant → le retrouver par pagination
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        userId = list?.users?.find((u) => u.email === email)?.id
      }
    }
    if (!userId) continue

    // FK ancienne contrainte : garantir une ligne waitlist pour cet email.
    await (admin as any).from('sosmeet_waitlist').upsert({ email, first_name: p.first_name, city: p.city, consent: true }, { onConflict: 'email' })

    await (admin as any).from('sosmeet_profiles').upsert({
      email, user_id: userId, first_name: p.first_name, birthdate: birthdate(p.birthYear),
      gender: p.gender, seeking: p.seeking, city: p.city, headline: p.headline,
      answers: p.a, scores: buildScores(p.a),
      age_confirmed: true, is_visible: true, completed: true, sensitive_consent: true,
    }, { onConflict: 'email' })

    idBySlug[p.slug] = userId
    created.push(p.first_name)
  }

  // Option : 2 profils qui « t'ont déjà remarqué » → match instantané.
  let likedBy: string[] = []
  if (likeEmail) {
    const { data: meRow } = await (admin as any).from('sosmeet_profiles').select('user_id').eq('email', likeEmail).maybeSingle()
    const meId = meRow?.user_id
    if (meId) {
      for (const slug of ['lea', 'marie']) {
        const from = idBySlug[slug]
        if (from) { await (admin as any).from('sosmeet_interests').upsert({ from_user: from, to_user: meId }, { onConflict: 'from_user,to_user' }); likedBy.push(slug) }
      }
    }
  }

  return NextResponse.json({ message: 'seeded', created, count: created.length, likedBy })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('token') !== TOKEN) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const admin = createAdminClient()

  const { data: rows } = await (admin as any).from('sosmeet_profiles').select('user_id, email').like('email', `%@${DEMO_DOMAIN}`)
  const ids = (rows || []).map((r: any) => r.user_id).filter(Boolean)
  for (const id of ids) { try { await admin.auth.admin.deleteUser(id) } catch { /* ignore */ } }
  // Les profils/waitlist/interests tombent en cascade via FK sur auth.users ; on nettoie le reste par sécurité.
  await (admin as any).from('sosmeet_profiles').delete().like('email', `%@${DEMO_DOMAIN}`)
  await (admin as any).from('sosmeet_waitlist').delete().like('email', `%@${DEMO_DOMAIN}`)
  return NextResponse.json({ message: 'cleared', removed: ids.length })
}
