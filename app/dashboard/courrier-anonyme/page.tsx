'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import type { CourrierAnonymeCategory } from '@/types/database'

const CATEGORIES: { value: CourrierAnonymeCategory; label: string; icon: string; desc: string }[] = [
  { value: 'question', label: 'Question', icon: '❓', desc: 'Posez une question que vous aimeriez voir traitée en vidéo ou en podcast' },
  { value: 'recommandation', label: 'Recommandation', icon: '💡', desc: 'Suggérez un sujet, un thème ou un format de contenu' },
  { value: 'temoignage', label: 'Témoignage', icon: '💎', desc: 'Partagez votre vécu de manière anonyme pour inspirer les autres' },
  { value: 'suggestion', label: 'Suggestion', icon: '✨', desc: 'Proposez une amélioration pour la plateforme ou la communauté' },
  { value: 'autre', label: 'Autre', icon: '💬', desc: 'Tout ce qui vous tient à cœur et que vous souhaitez partager' },
]

export default function CourrierAnonymePage() {
  const [category, setCategory] = useState<CourrierAnonymeCategory>('question')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSending(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase.from('courrier_anonyme').insert({
        user_id: user?.id || null,
        category,
        subject: subject.trim() || null,
        content: content.trim(),
      })

      if (insertError) throw insertError

      setSent(true)
      setSubject('')
      setContent('')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
    setSending(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.15)' }}>
            <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">
              Courrier Anonyme
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Votre voix compte, en toute confidentialité
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-8 md:p-12 text-center bg-[var(--surface-card)] border border-[var(--border)]"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: 'rgba(201,169,97,0.1)' }}>
              ✉️
            </div>
            <h2 className="font-display text-2xl font-light mb-3 text-[var(--brand)]">
              Message envoyé avec succès
            </h2>
            <p className="text-sm leading-relaxed max-w-md mx-auto mb-6 text-[var(--text-secondary)]">
              Votre courrier a bien été reçu. L&apos;équipe fondatrice le lira avec attention.
              Si votre message inspire un sujet, il pourra être traité dans un épisode
              de Shine TV ou du podcast — toujours dans le respect de votre anonymat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSent(false)}
                className="px-6 py-3 rounded-full text-sm font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}
              >
                Envoyer un autre message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Explanation card */}
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.1)' }}>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                    100% anonyme et confidentiel
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    Cet espace vous permet d&apos;écrire librement ce que vous avez sur le cœur.
                    Vos messages sont transmis directement à l&apos;équipe fondatrice (Julia, William & Thomas)
                    qui pourront y répondre en vidéo sur Shine TV, en podcast, ou dans un article —
                    toujours sans jamais révéler votre identité.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category selection */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-3 block text-[var(--text-muted)]">
                  Type de message
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className="rounded-xl p-3 text-left transition-all"
                      style={{
                        background: category === cat.value ? 'rgba(201,169,97,0.08)' : 'var(--surface-card)',
                        border: category === cat.value ? '1px solid rgba(201,169,97,0.25)' : '1px solid var(--border)',
                      }}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <p className="text-xs font-medium mt-1" style={{ color: category === cat.value ? 'var(--brand)' : 'var(--text-primary)' }}>
                        {cat.label}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2 text-[var(--text-muted)]">
                  {CATEGORIES.find(c => c.value === category)?.desc}
                </p>
              </div>

              {/* Subject (optional) */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block text-[var(--text-muted)]">
                  Sujet <span className="normal-case tracking-normal font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Comment gérer l'anxiété au quotidien ?"
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block text-[var(--text-muted)]">
                  Votre message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez librement... Votre question, votre histoire, votre recommandation. Tout est bienvenu et restera anonyme."
                  rows={8}
                  maxLength={2000}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none resize-none"
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Votre identité ne sera jamais révélée
                  </p>
                  <p className="text-[11px]" style={{ color: content.length > 1800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {content.length}/2000
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="w-full py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer mon courrier anonyme'
                )}
              </button>
            </form>

            {/* Bottom inspiration */}
            <div className="mt-8 rounded-2xl p-5 bg-[var(--surface-card)] border border-[var(--border)]">
              <p className="text-xs font-medium mb-3 text-[var(--text-muted)]">
                Quelques idées pour vous inspirer :
              </p>
              <div className="space-y-2">
                {[
                  'Comment retrouver confiance en soi après une rupture ?',
                  'J\'aimerais un podcast sur la gestion de la charge mentale',
                  'Pourriez-vous faire une vidéo sur les relations toxiques au travail ?',
                  'Je recommande d\'aborder le thème du pardon et de la libération émotionnelle',
                ].map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setContent(idea); setCategory(i < 2 ? 'question' : i === 2 ? 'recommandation' : 'suggestion') }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg transition-all hover:bg-[rgba(201,169,97,0.05)] text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--brand)]">&#x2726;</span> {idea}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
