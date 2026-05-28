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

      // Load published douleurs + available protocols once — used everywhere below
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [{ data: publishedDouleurs }, { data: availableProtocols }] = await Promise.all([
        (supabase as any).from('douleurs').select('slug').eq('is_published', true),
        (supabase as any).from('protocols').select('slug, dimension_weights').eq('status', 'available'),
      ])
      const publishedSet = new Set((publishedDouleurs || []).map((d: { slug: string }) => d.slug))

      function isAccessible(slug: string) {
        return publishedSet.has(slug)
      }

      function bestScoredSlug(scores: Record<string, number>): string | null {
        if (!availableProtocols?.length) return null
        const best = (availableProtocols as { slug: string; dimension_weights: Record<string, number> }[])
          .filter(p => isAccessible(p.slug))
          .map(p => ({ slug: p.slug, score: calculateMatchScores(scores, p.dimension_weights) }))
          .sort((a, b) => b.score - a.score)[0]
        return best?.slug || null
      }

      function fallbackSlug(): string | null {
        const best = (availableProtocols || []).find((p: { slug: string }) => isAccessible(p.slug))
        return best?.slug || (publishedDouleurs?.[0]?.slug ?? null)
      }

      // 1. URL param
      let slug: string | null = searchParams.get('protocol')

      // 2. sessionStorage
      if (!slug) {
        try { slug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      }

      // Verify URL/sessionStorage slug is accessible
      if (slug) {
        if (isAccessible(slug)) {
          router.replace(`/dashboard/encyclopedie/${slug}`)
          return
        }
        slug = null
      }

      // 3. Supabase by user_id
      if (!slug && uid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug && isAccessible(latest.top_protocol_slug)) {
          router.replace(`/dashboard/encyclopedie/${latest.top_protocol_slug}`)
          return
        } else if (latest?.scores) {
          const best = bestScoredSlug(latest.scores)
          if (best) { router.replace(`/dashboard/encyclopedie/${best}`); return }
        }
      }

      // 4. Supabase by email
      if (!slug && user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug && isAccessible(latest.top_protocol_slug)) {
          router.replace(`/dashboard/encyclopedie/${latest.top_protocol_slug}`)
          return
        } else if (latest?.scores) {
          const best = bestScoredSlug(latest.scores)
          if (best) { router.replace(`/dashboard/encyclopedie/${best}`); return }
        }
      }

      // 5. Fallback: first available + published protocol
      const fb = fallbackSlug()
      router.replace(fb ? `/dashboard/encyclopedie/${fb}` : (uid ? '/dashboard' : '/signature-emotionnelle'))
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
