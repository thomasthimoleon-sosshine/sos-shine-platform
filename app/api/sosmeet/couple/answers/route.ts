/**
 * SOS Meet Couple — les réponses d'un partenaire.
 * GET   : mes réponses, pour reprendre où j'en étais. JAMAIS celles de l'autre.
 * PATCH : sauvegarde automatique, tant que le questionnaire n'est pas scellé.
 * POST  : scelle le questionnaire. Irréversible (invariant I2).
 *
 * Invariant I1 : aucune de ces routes ne renvoie jamais les réponses d'un
 * autre user_id. Le texte libre ne quitte jamais la base vers un partenaire.
 */
import { NextResponse } from 'next/server'
import { currentUser, admin, coupleOf, sideOf, advanceStatus, audit, progressOf } from '@/lib/sosmeet/couple/store'
import { QUESTIONS_BY_ID, COUPLE_QUESTIONS, COUPLE_QUESTION_COUNT } from '@/lib/sosmeet/couple/questionnaire'
import { assessSafety } from '@/lib/sosmeet/couple/safety'
import type { CoupleStatus } from '@/lib/sosmeet/couple/types'

const OPEN_MAX = 4000

/** Ne garde que ce qui correspond réellement à une question de la banque. */
function sanitize(answers: unknown, open: unknown) {
  const clean: Record<string, number> = {}
  const cleanOpen: Record<string, string> = {}
  if (answers && typeof answers === 'object') {
    for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
      const q = QUESTIONS_BY_ID[k]
      if (!q || q.type === 'text') continue
      const n = Number(v)
      if (!Number.isInteger(n) || n < 0) continue
      if (q.choices && n >= q.choices.length) continue
      clean[k] = n
    }
  }
  if (open && typeof open === 'object') {
    for (const [k, v] of Object.entries(open as Record<string, unknown>)) {
      const q = QUESTIONS_BY_ID[k]
      if (!q || q.type !== 'text') continue
      cleanOpen[k] = String(v ?? '').slice(0, OPEN_MAX)
    }
  }
  return { clean, cleanOpen }
}

async function myRow(coupleId: string, userId: string) {
  const db = admin()
  if (!db) return null
  const { data } = await (db as any).from('sosmeet_couple_answers')
    .select('id, answers, open_answers, sealed_at')
    .eq('couple_id', coupleId).eq('user_id', userId).maybeSingle()
  return data as { id: string; answers: Record<string, number>; open_answers: Record<string, string>; sealed_at: string | null } | null
}

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const couple = await coupleOf(user.id)
  if (!couple) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  const row = await myRow(couple.id, user.id)
  return NextResponse.json({
    answers: row?.answers || {},
    openAnswers: row?.open_answers || {},
    sealed: !!row?.sealed_at,
    total: COUPLE_QUESTION_COUNT,
    status: couple.status,
  })
}

export async function PATCH(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const couple = await coupleOf(user.id)
  if (!couple || !sideOf(couple, user.id)) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  let body: { answers?: unknown; openAnswers?: unknown; timings?: unknown }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const existing = await myRow(couple.id, user.id)
  if (existing?.sealed_at) {
    return NextResponse.json({ error: 'Ton questionnaire est déjà scellé.' }, { status: 409 })
  }

  const { clean, cleanOpen } = sanitize(body.answers, body.openAnswers)
  const timings = body.timings && typeof body.timings === 'object' ? body.timings : {}

  const fields = {
    couple_id: couple.id, user_id: user.id,
    answers: clean, open_answers: cleanOpen, timings,
    updated_at: new Date().toISOString(),
  }

  const { error } = existing
    ? await (db as any).from('sosmeet_couple_answers').update(fields).eq('id', existing.id)
    : await (db as any).from('sosmeet_couple_answers').insert(fields)

  if (error) {
    console.error('[couple/answers] save:', error.code, error.message)
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 })
  }

  if (couple.status === 'DUO_FORME') await advanceStatus(couple.id, couple.status, 'EN_COURS')
  return NextResponse.json({ saved: Object.keys(clean).length })
}

export async function POST() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const couple = await coupleOf(user.id)
  if (!couple) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  const row = await myRow(couple.id, user.id)
  if (!row) return NextResponse.json({ error: 'Commence d’abord ton questionnaire.' }, { status: 409 })
  if (row.sealed_at) return NextResponse.json({ message: 'success', alreadySealed: true })

  // On exige que l'essentiel soit répondu, sans imposer les questions ouvertes.
  const obligatoires = COUPLE_QUESTIONS.filter(q => q.type !== 'text')
  const repondues = obligatoires.filter(q => row.answers?.[q.id] != null).length
  if (repondues < Math.ceil(obligatoires.length * 0.9)) {
    return NextResponse.json({ error: 'Il reste des questions sans réponse.', repondues, total: obligatoires.length }, { status: 400 })
  }

  // Vigilance, évaluée au scellement. Le résultat ne quitte jamais l'équipe.
  const safety = assessSafety(row.answers || {})

  const { error } = await (db as any).from('sosmeet_couple_answers')
    .update({ sealed_at: new Date().toISOString(), scores: { safety } })
    .eq('id', row.id)
  if (error) {
    console.error('[couple/answers] seal:', error.code, error.message)
    return NextResponse.json({ error: 'Impossible de valider.' }, { status: 500 })
  }

  // Un seul signal grave, chez un seul des deux, suspend le parcours.
  if (safety.level === 'suspendu') {
    await (db as any).from('sosmeet_couples')
      .update({ status: 'SUSPENDU_VIGILANCE', safety_flag: 'suspendu', updated_at: new Date().toISOString() })
      .eq('id', couple.id)
    await audit(couple.id, null, 'vigilance_suspension', user.id, { signals: safety.signals.length })
    return NextResponse.json({ message: 'success', sealed: true, support: true })
  }
  if (safety.level === 'a_verifier') {
    await (db as any).from('sosmeet_couples').update({ safety_flag: 'a_verifier' }).eq('id', couple.id)
  }

  // Les deux ont-ils scellé ?
  const progress = await progressOf(couple.id)
  const tous = progress.length === 2 && progress.every(p => p.sealed)
  const suivant: CoupleStatus = tous ? 'QUESTIONNAIRES_COMPLETS' : 'ATTENTE_PARTENAIRE'
  await advanceStatus(couple.id, couple.status, suivant)
  await audit(couple.id, user.id, 'questionnaire_scelle')

  return NextResponse.json({ message: 'success', sealed: true, bothDone: tous })
}
