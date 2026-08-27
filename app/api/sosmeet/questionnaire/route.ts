/**
 * SOS Meet — questionnaire de compatibilité (palier Essentiel).
 * POST : enregistre les réponses + le temps de réponse, calcule le profil
 *        scoré (dimensions/filtres) et l'indice de sincérité, marque le profil
 *        complété & visible en découverte.
 * GET  : renvoie les réponses déjà enregistrées (reprise).
 *
 * Tout est stocké dans les colonnes jsonb existantes (answers, scores) —
 * aucune migration requise.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeProfile, type Answers } from '@/lib/sosmeet/matching'
import { computeSincerity, type Timings } from '@/lib/sosmeet/coherence'
import { ESSENTIEL_COUNT } from '@/lib/sosmeet/essentiel'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })
  const { data } = await (admin as any).from('sosmeet_profiles').select('answers, completed').eq('user_id', user.id).maybeSingle()
  return NextResponse.json({ answers: (data?.answers as Answers) || {}, completed: !!data?.completed })
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi pour continuer.' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  let body: { answers?: Answers; timings?: Timings }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const answers: Answers = body.answers && typeof body.answers === 'object' ? body.answers : {}
  const timings: Timings = body.timings && typeof body.timings === 'object' ? body.timings : {}

  // Le profil d'infos doit exister (étape 1 faite).
  const { data: profile } = await (admin as any).from('sosmeet_profiles').select('id').eq('user_id', user.id).maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Complète d’abord tes infos.' }, { status: 409 })

  const scored = computeProfile(answers)
  const sincerity = computeSincerity(answers, timings)
  const completed = scored.answered >= Math.ceil(ESSENTIEL_COUNT * 0.7)

  const { error } = await (admin as any).from('sosmeet_profiles').update({
    answers,
    scores: {
      dimensions: scored.dimensions,
      filters: scored.filters,
      answered: scored.answered,
      sincerity: { score: sincerity.score, band: sincerity.band, coherent: sincerity.coherent, flags: sincerity.flags },
    },
    completed,
    is_visible: completed,
    updated_at: new Date().toISOString(),
  }).eq('id', profile.id)

  if (error) {
    console.error('[sosmeet/questionnaire] save error:', error.code, error.message)
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 })
  }
  return NextResponse.json({
    message: 'success',
    completed,
    sincerity: { score: sincerity.score, band: sincerity.band, coherent: sincerity.coherent },
  })
}
