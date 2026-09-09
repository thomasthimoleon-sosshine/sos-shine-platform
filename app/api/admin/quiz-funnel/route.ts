import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'
import { QUESTIONS } from '@/lib/quiz-v2'

// Lecture seule : agrège les données DÉJÀ collectées par le quiz
// (quiz_v2_responses + quiz_v2_events) pour répondre à :
//  - temps moyen passé sur le questionnaire
//  - temps passé et décrochage question par question
//  - tunnel du démarrage jusqu'à l'abonné
// N'écrit rien et ne modifie aucune table existante.

interface ResponseRow {
  session_id: string
  started_at: string | null
  email_captured_at: string | null
  completed_at: string | null
  current_question: number | null
}

interface EventRow {
  session_id: string
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}
function median(nums: number[]): number {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

async function fetchAll<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  columns: string,
  since: string,
): Promise<{ rows: T[]; missing: boolean }> {
  const rows: T[] = []
  const PAGE = 1000
  const MAX_PAGES = 40
  for (let p = 0; p < MAX_PAGES; p++) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(p * PAGE, p * PAGE + PAGE - 1)
    if (error) {
      if ((error as { code?: string }).code === '42P01') return { rows, missing: true }
      break
    }
    if (!data || data.length === 0) break
    rows.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return { rows, missing: false }
}

export async function GET(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { rows: responses, missing: respMissing } = await fetchAll<ResponseRow>(
      supabase, 'quiz_v2_responses', 'session_id, started_at, email_captured_at, completed_at, current_question, created_at', since,
    )
    const { rows: events } = await fetchAll<EventRow>(
      supabase, 'quiz_v2_events', 'session_id, event_type, event_data, created_at', since,
    )

    if (respMissing) {
      return NextResponse.json({ ok: true, missingTable: true, days })
    }

    // ── Temps total sur le questionnaire (complétés) ──
    const totalTimes: number[] = []
    for (const r of responses) {
      if (r.started_at && r.completed_at) {
        const sec = (new Date(r.completed_at).getTime() - new Date(r.started_at).getTime()) / 1000
        if (sec > 0 && sec < 3600) totalTimes.push(Math.round(sec))
      }
    }

    const started = responses.length
    const emailCaptured = responses.filter((r) => r.email_captured_at).length
    const completed = responses.filter((r) => r.completed_at).length

    // ── Ordre & libellés des questions ──
    const orderedQuestions = [...QUESTIONS].sort((a, b) => a.id - b.id)
    const totalQuestions = orderedQuestions.length
    const idToLabel: Record<number, string> = {}
    orderedQuestions.forEach((q) => { idToLabel[q.id] = q.question })

    // ── Par question : sessions distinctes ayant répondu + temps passé ──
    // Regroupement des events par session pour ordonner chronologiquement.
    const bySession: Record<string, EventRow[]> = {}
    for (const e of events) {
      if (!bySession[e.session_id]) bySession[e.session_id] = []
      bySession[e.session_id].push(e)
    }

    const answeredSessions: Record<number, Set<string>> = {} // questionId -> sessions
    const questionTimes: Record<number, number[]> = {}        // questionId -> durées (s)

    for (const sid of Object.keys(bySession)) {
      const evs = bySession[sid].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      let lastTs: number | null = null
      const startEv = evs.find((e) => e.event_type === 'quiz_started')
      if (startEv) lastTs = new Date(startEv.created_at).getTime()
      for (const e of evs) {
        if (e.event_type !== 'quiz_question_answered') continue
        const qid = Number(e.event_data?.questionId)
        const ts = new Date(e.created_at).getTime()
        if (Number.isFinite(qid)) {
          if (!answeredSessions[qid]) answeredSessions[qid] = new Set()
          answeredSessions[qid].add(sid)
          if (lastTs !== null) {
            const dur = (ts - lastTs) / 1000
            if (dur > 0 && dur < 600) {
              if (!questionTimes[qid]) questionTimes[qid] = []
              questionTimes[qid].push(Math.round(dur))
            }
          }
        }
        lastTs = ts
      }
    }

    const perQuestion = orderedQuestions.map((q, i) => {
      const reached = answeredSessions[q.id]?.size || 0
      return {
        index: i + 1,
        id: q.id,
        label: idToLabel[q.id] || `Question ${q.id}`,
        reached,
        avgSec: avg(questionTimes[q.id] || []),
        medianSec: median(questionTimes[q.id] || []),
      }
    })

    // ── Tunnel : quiz → abonné (fin business depuis les tables existantes) ──
    const [members, subsActive, subsTrial] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    ])
    const subscribers = (subsActive.count || 0) + (subsTrial.count || 0)

    const funnel = [
      { key: 'started', label: 'Quiz démarré', value: started },
      { key: 'completed', label: 'Questionnaire terminé', value: completed },
      { key: 'email', label: 'Email capturé', value: emailCaptured },
      { key: 'subscribers', label: 'Abonnés actifs (total)', value: subscribers },
    ]

    return NextResponse.json({
      ok: true,
      missingTable: false,
      days,
      counts: {
        started,
        completed,
        emailCaptured,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
        emailRate: started > 0 ? Math.round((emailCaptured / started) * 100) : 0,
        events: events.length,
      },
      time: {
        avgSec: avg(totalTimes),
        medianSec: median(totalTimes),
        sampleSize: totalTimes.length,
      },
      totalQuestions,
      perQuestion,
      funnel,
      business: {
        members: members.count || 0,
        subscribers,
        subsTrial: subsTrial.count || 0,
      },
    })
  } catch (err) {
    console.error('quiz-funnel error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
