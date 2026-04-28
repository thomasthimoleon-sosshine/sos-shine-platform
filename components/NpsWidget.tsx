'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

/**
 * NPS feedback widget — appears after 7 days on dashboard.
 * Asks "On a scale of 0 to 10, how likely are you to recommend SOS Shine?"
 * then an optional comment. Stored in nps_responses.
 * Dismissal is persisted via localStorage so it doesn't nag.
 */
export default function NpsWidget({ userId, createdAt }: { userId: string | null; createdAt: string | null }) {
  const [visible, setVisible] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!userId || !createdAt) return
    // Only show if user registered > 7 days ago
    const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays < 7) return

    // Respect dismissal
    const key = `nps_dismissed_${userId}`
    const dismissed = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (dismissed) return

    // Check DB: don't show if already answered in last 60 days
    ;(async () => {
      const supabase = createClient()
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('nps_responses')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', sixtyDaysAgo)
        .limit(1)
      if (!data || data.length === 0) {
        setVisible(true)
      }
    })()
  }, [userId, createdAt])

  function dismiss() {
    if (userId) localStorage.setItem(`nps_dismissed_${userId}`, '1')
    setVisible(false)
  }

  async function submit() {
    if (!userId || score === null) return
    setSubmitting(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('nps_responses') as any).insert({
      user_id: userId,
      score,
      comment: comment.trim() || null,
      context: 'dashboard',
    })
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(() => {
      localStorage.setItem(`nps_dismissed_${userId}`, '1')
      setVisible(false)
    }, 2500)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(201,169,97,0.04))',
          border: '1px solid rgba(167,139,250,0.25)',
        }}
      >
        <div className="p-6 relative">
          {!submitted && (
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-3 right-3 text-xs cursor-pointer text-[var(--text-muted)]"
              title="Plus tard"
            >
              ✕
            </button>
          )}

          {submitted ? (
            <div className="text-center py-4">
              <span className="text-3xl">💛</span>
              <p className="font-display text-xl mt-2" style={{ color: '#A78BFA' }}>Merci pour votre retour !</p>
              <p className="text-xs mt-1 text-[var(--text-muted)]">
                Chaque avis nous aide à faire mieux.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#A78BFA' }}>
                    Votre avis compte
                  </p>
                  <h3 className="font-display text-lg sm:text-xl font-semibold mt-1 text-[var(--text-primary)]">
                    Recommanderiez-vous SOS Shine à un proche ?
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-11 gap-1 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setScore(i)}
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer transition-all"
                    style={{
                      background: score === i ? '#A78BFA' : 'rgba(255,255,255,0.04)',
                      color: score === i ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${score === i ? '#A78BFA' : 'var(--border)'}`,
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-[10px] mb-4 text-[var(--text-muted)]">
                <span>Pas du tout</span>
                <span>Absolument</span>
              </div>

              {score !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Dites-nous pourquoi (optionnel)"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y mb-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                    style={{ background: '#A78BFA', color: '#fff' }}
                  >
                    {submitting ? 'Envoi...' : 'Envoyer mon avis'}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
