'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { PRICES, TOTAL_PRICES, ORIGINAL_PRICES, DURATIONS, PLAN_INFO, formatPrice, getPaymentLink } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'

const PRELAUNCH_END = new Date('2026-03-22T00:00:00+02:00')

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── PRELAUNCH SECTION ─── */
function getTimeLeft(launchDate: Date) {
  const now = new Date()
  const diff = launchDate.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    launched: false,
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[60px] h-[72px] sm:w-[72px] sm:h-[88px] flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(212,175,55,0.12)',
          boxShadow: '0 0 40px rgba(212,175,55,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-4xl font-light tabular-nums"
            style={{ color: '#D4AF37' }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-light" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

function PrelaunchContent() {
  const [time, setTime] = useState(() => getTimeLeft(PRELAUNCH_END))
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')
  const [waitlistCount, setWaitlistCount] = useState(34)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(PRELAUNCH_END)), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => setWaitlistCount(Math.max(34, d.count || 0)))
      .catch(() => {})
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (data.message === 'already_registered') setStatus('already')
      else if (res.ok) { setStatus('success'); setWaitlistCount((c) => c + 1) }
      else setStatus('error')
    } catch { setStatus('error') }
  }, [email, name, status])

  return (
    <>
      {/* Countdown */}
      <Reveal delay={0.3}>
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.35em] uppercase mb-6 font-light" style={{ color: 'var(--text-muted)' }}>
            Ouverture le 22 mars 2026 &agrave; minuit
          </p>
          {!time.launched ? (
            <div className="flex items-center gap-2 sm:gap-4 justify-center">
              <CountdownUnit value={time.days} label="Jours" />
              <span className="font-display text-xl font-light mt-[-24px]" style={{ color: 'rgba(212,175,55,0.25)' }}>:</span>
              <CountdownUnit value={time.hours} label="Heures" />
              <span className="font-display text-xl font-light mt-[-24px]" style={{ color: 'rgba(212,175,55,0.25)' }}>:</span>
              <CountdownUnit value={time.minutes} label="Minutes" />
              <span className="font-display text-xl font-light mt-[-24px]" style={{ color: 'rgba(212,175,55,0.25)' }}>:</span>
              <CountdownUnit value={time.seconds} label="Secondes" />
            </div>
          ) : (
            <span className="font-display text-2xl font-light text-shimmer">Les portes sont ouvertes</span>
          )}
        </div>
      </Reveal>

      {/* Pricing preview — 3 tiers */}
      <Reveal delay={0.4}>
        <div className="glass p-8 sm:p-10 text-center mb-10" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          <p className="text-[11px] tracking-[0.35em] uppercase mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            D&eacute;couvrez nos 3 offres
          </p>
          <p className="text-sm mb-6 font-light" style={{ color: 'var(--text-secondary)' }}>
            Rejoignez avant le 22 mars et b&eacute;n&eacute;ficiez d&apos;un tarif pr&eacute;f&eacute;rentiel &agrave; vie.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            {/* Essentielle */}
            <div className="text-center">
              <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#F0A68C' }}>Essentielle</p>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#F0A68C' }}>9,90&euro;</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Acc&egrave;s imm&eacute;diat, sans essai gratuit
              </p>
            </div>
            {/* Sérénité */}
            <div className="text-center">
              <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#55EFC4' }}>S&eacute;r&eacute;nit&eacute;</p>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#55EFC4' }}>49,90&euro;</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#55EFC4' }}>
                7 jours d&apos;essai gratuit &mdash; CB requise
              </p>
            </div>
            {/* Premium */}
            <div className="text-center">
              <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#A78BFA' }}>Premium</p>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#A78BFA' }}>99,90&euro;</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#A78BFA' }}>
                7 jours d&apos;essai gratuit &mdash; CB requise
              </p>
            </div>
          </div>

          <p className="text-xs mb-2 font-light" style={{ color: 'var(--text-secondary)' }}>
            R&eacute;ductions jusqu&apos;&agrave; <span style={{ color: '#D4AF37' }}>-30%</span> sur les engagements 3 mois, 6 mois et 1 an
          </p>
          <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
            Sans engagement &mdash; Annulable &agrave; tout instant
          </p>
        </div>
      </Reveal>

      {/* Waitlist Form */}
      <Reveal delay={0.5}>
        <div className="max-w-lg mx-auto mb-10">
          {status === 'success' ? (
            <motion.div className="glass p-8 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="font-display text-2xl font-light mb-3" style={{ color: '#D4AF37' }}>
                Bienvenue parmi les fondateurs
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Votre place est r&eacute;serv&eacute;e. Vous recevrez un email le jour de l&apos;ouverture avec votre acc&egrave;s prioritaire.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Votre pr&eacute;nom (optionnel)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl text-sm font-light outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <input
                  type="email"
                  required
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-[1.5] px-5 py-4 rounded-xl text-sm font-light outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="magnetic-btn pulse-ring w-full py-4 rounded-full text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                    Inscription...
                  </span>
                ) : (
                  "Rejoindre la liste d\u2019attente"
                )}
              </button>
              {status === 'already' && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light" style={{ color: '#D4AF37' }}>
                  Vous &ecirc;tes d&eacute;j&agrave; inscrit(e). Nous vous contacterons le 22 mars.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light" style={{ color: '#ef4444' }}>
                  Une erreur est survenue. Veuillez r&eacute;essayer.
                </motion.p>
              )}
            </form>
          )}
          {waitlistCount > 0 && (
            <motion.p className="text-center mt-4 text-xs font-light" style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <span style={{ color: '#D4AF37' }}>{waitlistCount}</span> personne{waitlistCount > 1 ? 's' : ''} sur la liste d&apos;attente
            </motion.p>
          )}
        </div>
      </Reveal>
    </>
  )
}

/* ─── DURATION SELECTOR ─── */
function DurationSelector({ selected, onChange }: { selected: DurationId; onChange: (d: DurationId) => void }) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 rounded-full mb-8 mx-auto max-w-fit"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {DURATIONS.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          className="relative px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer"
          style={{
            background: selected === d.id ? 'linear-gradient(135deg, #D4AF37, #B8960F)' : 'transparent',
            color: selected === d.id ? '#050505' : 'var(--text-muted)',
          }}
        >
          {d.label}
          {d.discount && (
            <span className="absolute -top-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#55EFC4', color: '#050505' }}>
              {d.discount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ─── EMAIL COLLECTION MODAL ─── */
function EmailModal({ plan, duration, onClose }: { plan: PlanId; duration: DurationId; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    setError('')

    try {
      const effectiveDuration = plan === 'essential' ? 'monthly' : duration
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, duration: effectiveDuration, email: email.trim(), prenom: prenom.trim() || undefined }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Fallback to direct Stripe Payment Link if checkout API fails
        const paymentLink = getPaymentLink(plan, effectiveDuration)
        if (paymentLink) {
          const separator = paymentLink.includes('?') ? '&' : '?'
          window.location.href = `${paymentLink}${separator}prefilled_email=${encodeURIComponent(email.trim())}`
        } else {
          setError(data.error || 'Une erreur est survenue')
          setLoading(false)
        }
      }
    } catch {
      // Network error — fallback to direct Stripe Payment Link
      const effectiveDuration = plan === 'essential' ? 'monthly' : duration
      const paymentLink = getPaymentLink(plan, effectiveDuration)
      if (paymentLink) {
        const separator = paymentLink.includes('?') ? '&' : '?'
        window.location.href = `${paymentLink}${separator}prefilled_email=${encodeURIComponent(email.trim())}`
      } else {
        setError('Erreur de connexion. Veuillez réessayer.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass w-full max-w-md p-8 relative"
        style={{ borderColor: 'rgba(212,175,55,0.2)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-display text-xl font-light mb-2" style={{ color: '#D4AF37' }}>
          Finalisez votre inscription
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Entrez votre email pour cr&eacute;er votre compte et proc&eacute;der au paiement.
          Vous recevrez vos identifiants de connexion par email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Votre pr&eacute;nom (optionnel)"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-sm font-light outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>
          <div>
            <input
              type="email"
              required
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-sm font-light outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-center" style={{ color: '#ef4444' }}>
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-medium tracking-wide transition-all text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                Redirection vers le paiement...
              </span>
            ) : (
              'Continuer vers le paiement'
            )}
          </button>

          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Paiement s&eacute;curis&eacute; par Stripe
          </p>
        </form>
      </motion.div>
    </div>
  )
}

/* ─── POST-LAUNCH PAYMENT SECTION ─── */
function PaymentContent() {
  const { t } = useTranslation()
  const [selectedDuration, setSelectedDuration] = useState<DurationId>('monthly')
  const [checkoutModal, setCheckoutModal] = useState<{ plan: PlanId } | null>(null)

  const handleCheckout = (plan: PlanId) => {
    // Essential only has monthly pricing — force monthly regardless of selected duration
    if (plan === 'essential') {
      setSelectedDuration('monthly')
    }
    setCheckoutModal({ plan })
  }

  const durationInfo = DURATIONS.find(d => d.id === selectedDuration)!
  const showTotalPrice = selectedDuration !== 'monthly'

  return (
    <>
      {/* Email collection modal */}
      <AnimatePresence>
        {checkoutModal && (
          <EmailModal
            plan={checkoutModal.plan}
            duration={selectedDuration}
            onClose={() => setCheckoutModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Duration selector */}
      <Reveal delay={0.3}>
        <div className="text-center mb-2">
          <p className="text-[11px] tracking-[0.35em] uppercase mb-4 font-medium" style={{ color: 'var(--text-muted)' }}>
            Choisissez votre dur&eacute;e d&apos;engagement
          </p>
          <DurationSelector selected={selectedDuration} onChange={setSelectedDuration} />
        </div>
      </Reveal>

      {/* 3 Pricing cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        {/* Essentielle */}
        <Reveal delay={0.4}>
          <div className="glass p-6 sm:p-8 text-center h-full flex flex-col" style={{ borderColor: 'rgba(240,166,140,0.18)' }}>
            <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: '#F0A68C' }}>
              {PLAN_INFO.essential.name}
            </p>
            <div className="flex items-baseline justify-center gap-1.5 mb-1">
              <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#F0A68C' }}>
                {formatPrice(PRICES.essential.monthly)}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
            </div>
            <p className="text-xs mb-1 font-medium" style={{ color: '#E17055' }}>
              Sans essai gratuit
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {t('join.no_commitment')}
            </p>

            <div className="space-y-2.5 text-left mb-6 flex-1">
              {[
                'Encyclop\u00e9die compl\u00e8te (acc\u00e8s illimit\u00e9)',
                'Tchats communautaires',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#F0A68C' }}>&#9670;</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('essential')}
              className="cta-glow w-full py-3.5 rounded-full font-medium tracking-wide transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #F0A68C, #D4825E)', color: '#050505' }}
            >
              {`Choisir l'Essentielle \u2014 ${formatPrice(PRICES.essential.monthly)}/mois`}
            </button>
          </div>
        </Reveal>

        {/* S\u00e9r\u00e9nit\u00e9 */}
        <Reveal delay={0.5}>
          <div className="glass p-6 sm:p-8 text-center h-full flex flex-col relative overflow-hidden" style={{ borderColor: 'rgba(85,239,196,0.25)', boxShadow: '0 0 30px rgba(85,239,196,0.06)' }}>
            <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)' }}>
              Populaire
            </div>
            <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: '#55EFC4' }}>
              {PLAN_INFO.serenite.name}
            </p>
            {showTotalPrice ? (
              <>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#55EFC4' }}>
                    {formatPrice(TOTAL_PRICES.serenite[selectedDuration])}
                  </span>
                </div>
                <p className="text-[10px] mb-2 line-through" style={{ color: 'var(--text-muted)' }}>
                  au lieu de {formatPrice(ORIGINAL_PRICES.serenite[selectedDuration as 'quarterly' | 'semiannual' | 'annual'])}
                </p>
                <p className="text-xs mb-1 font-medium" style={{ color: '#55EFC4' }}>
                  {durationInfo.months} mois &mdash; <span>{durationInfo.discount}</span>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#55EFC4' }}>
                    {formatPrice(PRICES.serenite.monthly)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
                </div>
                <p className="text-xs mb-1 font-medium" style={{ color: '#55EFC4' }}>
                  7 jours d&apos;essai gratuit &mdash; CB requise
                </p>
              </>
            )}
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {t('join.no_commitment')}
            </p>

            <div className="space-y-2.5 text-left mb-6 flex-1">
              {[
                'Tout le contenu de l\'Essentielle',
                'Soin collectif mensuel',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#55EFC4' }}>&#9670;</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('serenite')}
              className="cta-glow w-full py-3.5 rounded-full font-medium tracking-wide transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #55EFC4, #00B894)', color: '#050505' }}
            >
              {showTotalPrice
                ? `S\u00e9r\u00e9nit\u00e9 ${durationInfo.months} mois \u2014 ${formatPrice(TOTAL_PRICES.serenite[selectedDuration])}`
                : 'Essayer S\u00e9r\u00e9nit\u00e9 \u2014 7 jours gratuits (CB requise)'
              }
            </button>
          </div>
        </Reveal>

        {/* Premium */}
        <Reveal delay={0.6}>
          <div className="glass p-6 sm:p-8 text-center h-full flex flex-col relative overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.3)', boxShadow: '0 0 40px rgba(167,139,250,0.08)' }}>
            <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-semibold"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', color: '#fff' }}>
              VIP
            </div>
            <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: '#A78BFA' }}>
              {PLAN_INFO.premium.name}
            </p>
            {showTotalPrice ? (
              <>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#A78BFA' }}>
                    {formatPrice(TOTAL_PRICES.premium[selectedDuration])}
                  </span>
                </div>
                <p className="text-[10px] mb-2 line-through" style={{ color: 'var(--text-muted)' }}>
                  au lieu de {formatPrice(ORIGINAL_PRICES.premium[selectedDuration as 'quarterly' | 'semiannual' | 'annual'])}
                </p>
                <p className="text-xs mb-1 font-medium" style={{ color: '#A78BFA' }}>
                  {durationInfo.months} mois &mdash; <span>{durationInfo.discount}</span>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="font-display text-3xl sm:text-4xl font-light" style={{ color: '#A78BFA' }}>
                    {formatPrice(PRICES.premium.monthly)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
                </div>
                <p className="text-xs mb-1 font-medium" style={{ color: '#A78BFA' }}>
                  7 jours d&apos;essai gratuit &mdash; CB requise
                </p>
              </>
            )}
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {t('join.no_commitment')}
            </p>

            <div className="space-y-2.5 text-left mb-6 flex-1">
              {[
                'Tout le contenu de la S\u00e9r\u00e9nit\u00e9',
                'Live th\u00e9matique hebdomadaire',
                'Canal priv\u00e9 Telegram',
                'Acc\u00e8s aux \u00e9v\u00e9nements',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#A78BFA' }}>&#9670;</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('premium')}
              className="cta-glow w-full py-3.5 rounded-full font-medium tracking-wide transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', color: '#fff' }}
            >
              {showTotalPrice
                ? `Premium ${durationInfo.months} mois \u2014 ${formatPrice(TOTAL_PRICES.premium[selectedDuration])}`
                : 'Essayer Premium \u2014 7 jours gratuits (CB requise)'
              }
            </button>
          </div>
        </Reveal>
      </div>

      {/* Savings highlight for non-monthly */}
      {selectedDuration !== 'monthly' && (
        <Reveal delay={0.7}>
          <div className="glass p-4 text-center mb-6" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.03)' }}>
            <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
              Vous &eacute;conomisez jusqu&apos;&agrave; {DURATIONS.find(d => d.id === selectedDuration)?.discount} avec l&apos;engagement {durationInfo.label}
            </p>
          </div>
        </Reveal>
      )}
    </>
  )
}

/* ─── FEATURES GRID (shared) ─── */
function FeaturesGrid() {
  const { t } = useTranslation()

  const features = [
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>, title: t('join.feature_encyclopedia'), description: t('join.feature_encyclopedia_desc'), color: '#D4AF37' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>, title: t('join.feature_coaching'), description: t('join.feature_coaching_desc'), color: '#55EFC4' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>, title: t('join.feature_energy'), description: t('join.feature_energy_desc'), color: '#74C0FC' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>, title: t('join.feature_meditation'), description: t('join.feature_meditation_desc'), color: '#E17055' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>, title: t('join.feature_community'), description: t('join.feature_community_desc'), color: '#A29BFE' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>, title: t('join.feature_events'), description: t('join.feature_events_desc'), color: '#FD79A8' },
  ]

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-16">
      {features.map((feature, i) => (
        <Reveal key={feature.title} delay={0.1 + i * 0.07}>
          <div className="glass p-6 h-full" style={{ borderColor: `${feature.color}15` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${feature.color}12`, color: feature.color }}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-[15px] mb-1.5">{feature.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function RejoindrePage() {
  const { t } = useTranslation()
  const [isPrelaunch, setIsPrelaunch] = useState(true)

  useEffect(() => {
    setIsPrelaunch(new Date() < PRELAUNCH_END)
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--dark)' }}>
      {/* Header */}
      <header className="px-6 md:px-20 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: 'var(--dark)' }}>
            S
          </div>
          <span className="font-display text-lg font-medium" style={{ color: 'var(--gold)' }}>SOS Shine</span>
        </Link>
        <Link href="/encyclopedie" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {t('join.see_encyclopedia')}
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        {/* Hero */}
        <Reveal>
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light leading-tight mb-4">
              {isPrelaunch ? (
                <>Quelque chose de <span className="text-shimmer">puissant</span> arrive.</>
              ) : (
                <>{t('join.title')}<br />{t('join.title_br')}</>
              )}
            </h1>
            <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {isPrelaunch ? (
                "L\u2019encyclop\u00e9die compl\u00e8te des challenges \u00e9motionnels. Un espace pour comprendre, apaiser et ne plus jamais \u00eatre seul."
              ) : (
                t('join.subtitle')
              )}
            </p>
          </div>
        </Reveal>

        {/* Features grid */}
        <FeaturesGrid />

        {/* Conditional: Prelaunch OR Payment */}
        {isPrelaunch ? <PrelaunchContent /> : <PaymentContent />}

        {/* Links & secure badge */}
        <Reveal delay={0.65}>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6">
              <Link href="/login" className="text-xs gold-underline" style={{ color: 'var(--text-secondary)' }}>
                {t('join.already_member')}
              </Link>
              <Link href="/encyclopedie" className="text-xs gold-underline" style={{ color: 'var(--text-secondary)' }}>
                {t('join.continue_explore')}
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('join.secure_payment')}</span>
            </div>
          </div>
        </Reveal>

        {/* Quote */}
        <Reveal delay={0.6}>
          <p className="text-center text-sm italic mt-10 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            &laquo; {t('join.quote')} &raquo;
          </p>
        </Reveal>

        {/* Back link */}
        <Reveal delay={0.7}>
          <div className="text-center mt-10">
            <Link href="/encyclopedie" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              &larr; {t('join.back_encyclopedia')}
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
