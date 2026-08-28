/**
 * SOS Meet — découverte des profils compatibles.
 * Renvoie une liste de candidats visibles, filtrés (genre/recherche, blocages,
 * intérêts/matchs déjà exprimés), triés par compatibilité **pondérée par la
 * sincérité**. La photo n'est JAMAIS incluse (révélation au match).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { compatibility, type Profile } from '@/lib/sosmeet/matching'
import { buildPortrait, publicSincerity } from '@/lib/sosmeet/portrait'

function toSeek(gender: string): string | null {
  if (gender === 'femme') return 'femmes'
  if (gender === 'homme') return 'hommes'
  return null // non-binaire / autre : atteints seulement par « tout »
}
function wants(seeking: string[], gender: string): boolean {
  if (!Array.isArray(seeking)) return false
  if (seeking.includes('tout')) return true
  const s = toSeek(gender)
  return s ? seeking.includes(s) : false
}
function ageFrom(birthdate?: string | null): number | null {
  if (!birthdate) return null
  const d = new Date(birthdate); if (isNaN(d.getTime())) return null
  const n = new Date(); let a = n.getFullYear() - d.getFullYear()
  const m = n.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--
  return a
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asProfile(scores: any): Profile {
  return { dimensions: scores?.dimensions || {}, filters: scores?.filters || {}, answered: scores?.answered || 0 }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  // Mon profil
  const { data: me } = await (admin as any).from('sosmeet_profiles')
    .select('user_id, gender, seeking, scores, completed').eq('user_id', user.id).maybeSingle()
  if (!me || !me.completed) return NextResponse.json({ error: 'Termine ton questionnaire pour découvrir.', candidates: [] }, { status: 409 })
  const myProfile = asProfile(me.scores)

  // Exclusions : blocages (2 sens), intérêts déjà envoyés, matchs existants
  const [{ data: blocks }, { data: interests }, { data: matchesA }, { data: matchesB }] = await Promise.all([
    (admin as any).from('sosmeet_blocks').select('blocker_id, blocked_id').or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    (admin as any).from('sosmeet_interests').select('to_user').eq('from_user', user.id),
    (admin as any).from('sosmeet_matches').select('user_b').eq('user_a', user.id),
    (admin as any).from('sosmeet_matches').select('user_a').eq('user_b', user.id),
  ])
  const excluded = new Set<string>([user.id])
  ;(blocks || []).forEach((b: any) => { excluded.add(b.blocker_id); excluded.add(b.blocked_id) })
  ;(interests || []).forEach((i: any) => excluded.add(i.to_user))
  ;(matchesA || []).forEach((m: any) => excluded.add(m.user_b))
  ;(matchesB || []).forEach((m: any) => excluded.add(m.user_a))

  // Candidats visibles
  const { data: rows } = await (admin as any).from('sosmeet_profiles')
    .select('user_id, first_name, birthdate, gender, seeking, city, answers, scores')
    .eq('is_visible', true)
    .limit(300)

  const out = []
  for (const c of (rows || [])) {
    if (excluded.has(c.user_id)) continue
    // Orientation à double sens
    if (!wants(me.seeking, c.gender)) continue
    if (!wants(c.seeking, me.gender)) continue

    const compat = compatibility(myProfile, asProfile(c.scores))
    if (compat.blocked) continue
    const sincerity = c.scores?.sincerity?.score ?? 70
    // Pondération : un profil peu sincère remonte moins.
    const ranked = Math.round(compat.score * (0.6 + 0.4 * (sincerity / 100)))

    // Portrait ENTIÈREMENT généré depuis les réponses (aucune saisie libre) +
    // sincérité affichée en transparence.
    const portrait = buildPortrait((c.answers || {}) as Record<string, number>, c.first_name || '', c.gender)
    const sincPublic = publicSincerity(c.scores?.sincerity)

    out.push({
      userId: c.user_id,
      firstName: c.first_name || '',
      age: ageFrom(c.birthdate),
      city: c.city || null,
      score: compat.score,
      ranked,
      reasons: compat.reasons,
      coherent: !!c.scores?.sincerity?.coherent,
      narrative: portrait.narrative,
      signature: portrait.signature,
      portrait: portrait.sections,
      wants: portrait.wants,
      sincerity: sincPublic,
    })
  }

  out.sort((a, b) => b.ranked - a.ranked)
  return NextResponse.json({ candidates: out.slice(0, 24) })
}
