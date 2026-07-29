import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

// Agrège les événements de parcours (funnel_events) + les tables existantes
// pour répondre à : temps moyen sur le questionnaire, temps par question,
// et taux de décrochage à chaque étape jusqu'à l'abonnement.

interface EventRow {
  session_id: string
  event: string
  step: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export async function GET(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // ── Récupération paginée des événements (Supabase limite à 1000/req) ──
    const rows: EventRow[] = []
    const PAGE = 1000
    const MAX_PAGES = 30 // garde-fou (30 000 événements max)
    let missingTable = false
    for (let p = 0; p < MAX_PAGES; p++) {
      const { data, error } = await supabase
        .from('funnel_events')
        .select('session_id, event, step, metadata, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .range(p * PAGE, p * PAGE + PAGE - 1)
      if (error) {
        // 42P01 = table absente (migration SQL pas encore lancée)
        if ((error as { code?: string }).code === '42P01') missingTable = true
        break
      }
      if (!data || data.length === 0) break
      rows.push(...(data as EventRow[]))
      if (data.length < PAGE) break
    }

    // ── Sessions distinctes par type d'événement ──
    const sessionsByEvent: Record<string, Set<string>> = {}
    // ── Position la plus avancée atteinte dans le questionnaire, par session ──
    const maxQuestionBySession: Record<string, number> = {}
    // ── Temps total du questionnaire (test_completed) ──
    const totalTimes: number[] = []
    // ── Temps par question (metadata.question_ms), regroupé par n° ──
    const questionTimes: Record<number, number[]> = {}

    for (const r of rows) {
      if (!sessionsByEvent[r.event]) sessionsByEvent[r.event] = new Set()
      sessionsByEvent[r.event].add(r.session_id)

      if (r.event === 'question_answered' && typeof r.step === 'number') {
        maxQuestionBySession[r.session_id] = Math.max(maxQuestionBySession[r.session_id] || 0, r.step)
        const qms = Number(r.metadata?.question_ms)
        if (Number.isFinite(qms) && qms > 0 && qms < 1000 * 60 * 10) {
          if (!questionTimes[r.step]) questionTimes[r.step] = []
          questionTimes[r.step].push(qms)
        }
      }

      if (r.event === 'test_completed') {
        const tms = Number(r.metadata?.total_ms)
        if (Number.isFinite(tms) && tms > 0 && tms < 1000 * 60 * 60) totalTimes.push(tms)
      }
    }

    const count = (ev: string) => sessionsByEvent[ev]?.size || 0

    // ── Décrochage par question : combien de sessions ont atteint chaque n° ──
    const totalQuestions = (() => {
      let max = 15
      for (const r of rows) {
        const tq = Number(r.metadata?.total_questions)
        if (Number.isFinite(tq) && tq > max) max = tq
      }
      return max
    })()

    const perQuestion: { question: number; reached: number; avgMs: number; medianMs: number }[] = []
    const startedSessions = count('test_started') || count('question_answered')
    for (let q = 1; q <= totalQuestions; q++) {
      const reached = Object.values(maxQuestionBySession).filter((m) => m >= q).length
      perQuestion.push({
        question: q,
        reached,
        avgMs: avg(questionTimes[q] || []),
        medianMs: median(questionTimes[q] || []),
      })
    }

    // ── Comptes issus des tables existantes (source de vérité) ──
    const [leads, members, onboarded, subsActive, subsTrial] = await Promise.all([
      supabase.from('signature_leads').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('onboarding_responses').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    ])

    const subscribers = (subsActive.count || 0) + (subsTrial.count || 0)

    // ── Le tunnel, étape par étape ──
    const funnel = [
      { key: 'test_started', label: 'Test démarré', value: startedSessions },
      { key: 'test_completed', label: 'Questionnaire terminé', value: count('test_completed') },
      { key: 'email_submitted', label: 'Email fourni', value: count('email_submitted') },
      { key: 'result_viewed', label: 'Résultat consulté', value: count('result_viewed') },
      { key: 'join_clicked', label: 'Clic « Rejoindre »', value: count('join_clicked') },
      { key: 'checkout_started', label: 'Paiement lancé', value: count('checkout_started') },
      { key: 'signup_submitted', label: 'Inscription', value: count('signup_submitted') },
      { key: 'subscribers', label: 'Abonnés actifs', value: subscribers },
    ]

    return NextResponse.json({
      ok: true,
      missingTable,
      days,
      totalEvents: rows.length,
      questionnaire: {
        started: startedSessions,
        completed: count('test_completed'),
        completionRate: startedSessions > 0 ? Math.round((count('test_completed') / startedSessions) * 100) : 0,
        avgTotalMs: avg(totalTimes),
        medianTotalMs: median(totalTimes),
        totalQuestions,
        perQuestion,
      },
      funnel,
      totals: {
        leads: leads.count || 0,
        members: members.count || 0,
        onboarded: onboarded.count || 0,
        subscribers,
        subsActive: subsActive.count || 0,
        subsTrial: subsTrial.count || 0,
      },
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
