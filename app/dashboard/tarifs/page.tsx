'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { PromoCountdown, PROMO } from '@/components/PromoCountdown'
import {
  type PlanId,
  type DurationId,
  PLAN_INFO,
  PLAN_COLORS,
  PRICES,
  TOTAL_PRICES,
  ORIGINAL_PRICES,
  DURATIONS,
  formatPrice,
  getSavingsPercent,
  getPaymentLink,
} from '@/lib/stripe/config'

const PLAN_FEATURES: Record<PlanId, string[]> = {
  essential: [],
  serenite: [
    'Encyclopédie complète (200+ protocoles)',
    'Étapes 2 & 3 de votre protocole recommandé',
    'Shine TV, Shorts, Audible & Librairie',
    'Communauté & Feu de Camp 24/7',
    'Courrier Anonyme',
    'Soins collectifs, lives & événements',
    '7 jours d\'essai gratuit',
  ],
  premium: [],
}

export default function TarifsPage() {
  const searchParams = useSearchParams()
  const { isActive, userId } = useSubscription()
  const [selectedDuration, setSelectedDuration] = useState<DurationId>('monthly')
  const [userEmail, setUserEmail] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setCheckoutSuccess(true)

      const sessionId = searchParams.get('session_id')
      if (sessionId) {
        fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(() => {})
      }
    }
  }, [searchParams])

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
      }
    }
    loadUser()
  }, [])

  function handleSelectPlan(plan: PlanId) {
    const duration: DurationId = selectedDuration
    const paymentLink = getPaymentLink(plan, duration)
    if (paymentLink) {
      const url = new URL(paymentLink)
      if (userEmail) url.searchParams.set('prefilled_email', userEmail)
      if (userId) url.searchParams.set('client_reference_id', userId)
      window.location.href = url.toString()
    }
  }

  // Success screen
  if (checkoutSuccess) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.2)' }}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-[var(--text-primary)]">
            Bienvenue dans la communauté !
          </h1>
          <p className="text-[15px] leading-relaxed mb-8 text-[var(--text-secondary)]">
            Votre abonnement est maintenant actif. Vous avez accès à tout le contenu de la plateforme.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
              color: '#000000',
              boxShadow: '0 4px 20px rgba(201,169,97,0.3)',
            }}
          >
            Explorer la plateforme
          </Link>
        </motion.div>
      </div>
    )
  }

  // Already subscribed
  if (isActive) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.2)' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-3 text-[var(--text-primary)]">
          Vous êtes déjà abonné(e) !
        </h1>
        <p className="text-sm mb-6 text-[var(--text-secondary)]">
          Votre abonnement est actif. Profitez de tout le contenu.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            Retour au dashboard
          </Link>
          <Link href="/dashboard/profil" className="px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)', color: 'var(--brand)' }}>
            Gérer mon abonnement
          </Link>
        </div>
      </div>
    )
  }

  // Pricing cards
  const plans: PlanId[] = ['serenite']

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 text-[var(--text-primary)]"
        >
          Choisissez votre abonnement
        </motion.h1>
        <p className="text-sm sm:text-[15px] text-[var(--text-secondary)]">
          Sans engagement. Annulation en un clic.
        </p>
      </div>

      {/* Sélecteur de durée — masqué : offre mensuelle unique */}
      {DURATIONS.length > 1 && (
      <div className="flex justify-center mb-10">
        <div
          className="inline-flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          {DURATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDuration(d.id)}
              className="relative px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer"
              style={{
                background: selectedDuration === d.id ? 'rgba(201,169,97,0.15)' : 'transparent',
                color: selectedDuration === d.id ? 'var(--brand)' : 'var(--text-secondary)',
                border: selectedDuration === d.id ? '1px solid rgba(201,169,97,0.3)' : '1px solid transparent',
              }}
            >
              {d.label}
              {d.discount && (
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(85,239,196,0.15)', color: 'var(--success)' }}
                >
                  {d.discount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Freemium card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-[var(--text-secondary)]">Gratuit</h3>
              <p className="text-xs mt-0.5 text-[var(--text-muted)]">Découvrir la communauté SOS Shine</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--text-primary)]">0€</span>
                <span className="text-sm text-[var(--text-muted)]">/pour toujours</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['Communauté & Mur', 'Shine Audible (podcasts & méditations)', 'Étape 1 de votre protocole recommandé (gratuit)', 'Quiz Signature Émotionnelle'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-0.5 text-[var(--text-muted)]">◆</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup"
              className="w-full py-3.5 rounded-full text-sm font-semibold text-center transition-all hover:opacity-90 block"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Créer mon compte gratuit
            </Link>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {plans.map((planId, idx) => {
            const info = PLAN_INFO[planId]
            const color = PLAN_COLORS[planId]
            const isHighlight = planId === 'serenite'
            const effectiveDuration: DurationId = selectedDuration
            const monthlyPrice = PRICES[planId][effectiveDuration]
            const totalPrice = TOTAL_PRICES[planId][effectiveDuration]
            const originalPrice = ORIGINAL_PRICES[planId]?.[effectiveDuration]
            const savings = getSavingsPercent(planId, effectiveDuration)
            const durationMonths = DURATIONS.find(d => d.id === effectiveDuration)?.months || 1

            return (
              <motion.div
                key={`${planId}-${effectiveDuration}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: 'var(--surface-card)',
                  border: isHighlight ? `2px solid ${color}` : '1px solid var(--border)',
                  boxShadow: isHighlight ? `0 0 30px rgba(${hexToRgb(color)}, 0.1)` : undefined,
                }}
              >
                {/* Badge */}
                {isHighlight && (
                  <div
                    className="text-center py-1.5 text-[11px] font-semibold tracking-wide uppercase"
                    style={{ background: color, color: '#000000' }}
                  >
                    Le plus choisi
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Plan name */}
                  <div className="mb-4">
                    <h3
                      className="font-display text-lg font-semibold"
                      style={{ color }}
                    >
                      {info.name}
                    </h3>
                    <p className="text-xs mt-0.5 text-[var(--text-muted)]">
                      {info.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {planId === 'serenite' && effectiveDuration === 'monthly' ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                            {PROMO.promoPrice}{PROMO.currency}
                          </span>
                          <span className="text-sm text-[var(--text-muted)]">/mois</span>
                        </div>
                        {info.hasTrial && (
                          <p className="text-xs mt-2 font-medium" style={{ color: 'var(--success)' }}>
                            7 jours d&apos;essai gratuit inclus
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[var(--text-primary)]">
                            {formatPrice(monthlyPrice)}
                          </span>
                          <span className="text-sm text-[var(--text-muted)]">/mois</span>
                        </div>
                        {durationMonths > 1 && (
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-[var(--text-secondary)]">
                              soit {formatPrice(totalPrice)} pour {durationMonths} mois
                            </p>
                            {originalPrice && (
                              <p className="text-xs text-[var(--text-muted)]">
                                <span style={{ textDecoration: 'line-through' }}>{formatPrice(originalPrice)}</span>
                                <span className="ml-1.5 font-semibold" style={{ color: 'var(--success)' }}>
                                  -{savings}%
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                        {info.hasTrial && (
                          <p className="text-xs mt-2 font-medium" style={{ color: 'var(--success)' }}>
                            7 jours gratuits
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {PLAN_FEATURES[planId].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    className="w-full py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{
                      background: isHighlight
                        ? `linear-gradient(135deg, ${color}, ${color}dd)`
                        : 'transparent',
                      color: isHighlight ? '#000000' : color,
                      border: isHighlight ? 'none' : `1px solid ${color}`,
                      boxShadow: isHighlight ? `0 4px 20px rgba(${hexToRgb(color)}, 0.25)` : undefined,
                    }}
                  >
                    {info.hasTrial ? 'Essayer gratuitement - 7 jours' : 'Commencer maintenant'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-10 text-[var(--text-muted)]">
        Si on doit vous retenir par un contrat, c&apos;est qu&apos;on n&apos;a pas fait notre travail.
      </p>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '212,168,67'
  return `${r},${g},${b}`
}
