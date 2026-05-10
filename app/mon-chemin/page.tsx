'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchScores } from '@/lib/quiz-v2/scoring'

function MonCheminContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || null

      // Resolve slug: URL param → sessionStorage → Supabase by user_id → Supabase by email
      let resolvedSlug: string | null = searchParams.get('protocol')

      if (!resolvedSlug) {
        try { resolvedSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      }

      // Verify slug exists in protocols table
      if (resolvedSlug) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('protocols').select('slug').eq('slug', resolvedSlug).maybeSingle()
        if (data?.slug) {
          router.replace(`/dashboard/encyclopedie/${data.slug}`)
          return
        }
        resolvedSlug = null
      }

      // Supabase fallback by user_id
      if (!resolvedSlug && uid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug) {
          router.replace(`/dashboard/encyclopedie/${latest.top_protocol_slug}`)
          return
        } else if (latest?.scores) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: allProtocols } = await (supabase as any).from('protocols').select('slug, dimension_weights, status')
          if (allProtocols?.length > 0) {
            const best = (allProtocols as { slug: string; dimension_weights: Record<string, number>; status: string }[])
              .map(p => ({ slug: p.slug, score: calculateMatchScores(latest.scores, p.dimension_weights) }))
              .sort((a, b) => b.score - a.score)[0]
            if (best?.slug) {
              router.replace(`/dashboard/encyclopedie/${best.slug}`)
              return
            }
          }
        }
      }

      // Fallback by email
      if (!resolvedSlug && user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug) {
          router.replace(`/dashboard/encyclopedie/${latest.top_protocol_slug}`)
          return
        } else if (latest?.scores) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: allProtocols } = await (supabase as any).from('protocols').select('slug, dimension_weights, status')
          if (allProtocols?.length > 0) {
            const best = (allProtocols as { slug: string; dimension_weights: Record<string, number>; status: string }[])
              .map(p => ({ slug: p.slug, score: calculateMatchScores(latest.scores, p.dimension_weights) }))
              .sort((a, b) => b.score - a.score)[0]
            if (best?.slug) {
              router.replace(`/dashboard/encyclopedie/${best.slug}`)
              return
            }
          }
        }
      }

      // No protocol found — if user is authenticated, go to dashboard instead of forcing the quiz again
      router.replace(uid ? '/dashboard' : '/signature-emotionnelle')
    }
    init()
  }, []) // eslint-disable-line

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de ton protocole...</p>
    </main>
  )
}

export default function MonCheminPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
      </main>
    }>
      <MonCheminContent />
    </Suspense>
  )
}
