'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PromoCountdown, PROMO } from '@/components/PromoCountdown'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
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
} from '@/lib/stripe/config'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

const PLAN_FEATURES: Record<PlanId, string[]> = {
  essential: [],
  serenite: [
    'Encyclopédie complète (200+ protocoles)',
    'Étapes 2 & 3 de votre protocole recommandé',
    'Shine TV, Shorts, Audible, Librairie',
    'Communauté & Feu de Camp',
    'Courrier Anonyme',
    'Événements, soins collectifs, lives',
    '7 jours d\'essai gratuit',
  ],
  premium: [],
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  /** Callback apres paiement reussi pour rafraichir l'etat */
  onSubscribed: () => void
  /** Info utilisateur connecte */
  userId: string
  userEmail: string
  userPrenom: string
  /** Plan pre-selectionne (optionnel, pour upgrade) */
  suggestedPlan?: PlanId
}

type Step = 'plans' | 'checkout' | 'success'

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSubscribed,
  userId,
  userEmail,
  userPrenom,
  suggestedPlan,
}: SubscriptionModalProps) {
  const [step, setStep] = useState<Step>('plans')
  const [selectedDuration, setSelectedDuration] = useState<DurationId>('monthly')
  const [checkoutPlan, setCheckoutPlan] = useState<{ plan: PlanId; duration: DurationId } | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Reset quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStep('plans')
      setCheckoutPlan(null)
      setCheckoutError(null)
    }
  }, [isOpen])

  const fetchClientSecret = useCallback(async () => {
    if (!checkoutPlan) return ''
    try {
      const res = await fetch('/api/stripe/create-embedded-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: checkoutPlan.plan,
          duration: checkoutPlan.duration,
          email: userEmail,
          prenom: userPrenom,
          userId,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setCheckoutError(data.error)
        throw new Error(data.error)
      }
      return data.clientSecret
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      if (!checkoutError) setCheckoutError(msg)
      throw err
    }
  }, [checkoutPlan, userEmail, userPrenom, userId, checkoutError])

  function handleSelectPlan(plan: PlanId) {
    const duration = selectedDuration
    setCheckoutPlan({ plan, duration })
    setCheckoutError(null)
    setStep('checkout')
  }

  // Ecouter le retour Stripe (checkout complete)
  useEffect(() => {
    if (step !== 'checkout' || !checkoutPlan) return

    // Poll pour detecter le succes du checkout (via l'URL de retour)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'checkout.session.completed' || event.data === 'checkout-complete') {
        setStep('success')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [step, checkoutPlan])

  // Quand le checkout retourne en succes (URL de retour avec session_id)
  // On detecte via un MutationObserver ou en ecoutant l'iframe
  useEffect(() => {
    if (step !== 'checkout') return
    // Verifier periodiquement si le checkout a ete complete
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/subscription/features?user_id=${userId}`)
        const data = await res.json()
        if (data.is_active) {
          clearInterval(interval)
          setStep('success')
          onSubscribed()
        }
      } catch {
        // ignore
      }
    }, 3000) // check toutes les 3 secondes
    return () => clearInterval(interval)
  }, [step, userId, onSubscribed])

  function handleSuccess() {
    onSubscribed()
    onClose()
  }

  if (!isOpen) return null

  const plans: PlanId[] = ['serenite']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget && step === 'plans') onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full overflow-y-auto rounded-2xl"
          style={{
            maxWidth: step === 'plans' ? '900px' : '640px',
            maxHeight: '90vh',
            background: 'var(--dark-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
            style={{ background: 'var(--dark-bg)', borderBottom: '1px solid var(--border)' }}>
            <div>
              {step === 'checkout' && (
                <button
                  onClick={() => { setStep('plans'); setCheckoutPlan(null); setCheckoutError(null) }}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer text-[var(--text-secondary)]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Retour
                </button>
              )}
              {step === 'plans' && (
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  Choisissez votre abonnement
                </h2>
              )}
              {step === 'success' && (
                <h2 className="font-display text-lg font-semibold text-[var(--success)]">
                  Bienvenue !
                </h2>
              )}
            </div>
            <button
              onClick={step === 'success' ? handleSuccess : onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* ── ETAPE 1 : Choix du plan ── */}
            {step === 'plans' && (
              <>
                <p className="text-sm text-center mb-6 text-[var(--text-secondary)]">
                  Sans engagement. Annulation en un clic.
                </p>

                {/* Duration selector */}
                <div className="flex justify-center mb-6">
                  <div
                    className="inline-flex rounded-xl p-1 gap-1"
                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
                  >
                    {DURATIONS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDuration(d.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: selectedDuration === d.id ? 'rgba(201,169,97,0.15)' : 'transparent',
                          color: selectedDuration === d.id ? 'var(--brand)' : 'var(--text-secondary)',
                          border: selectedDuration === d.id ? '1px solid rgba(201,169,97,0.3)' : '1px solid transparent',
                        }}
                      >
                        {d.label}
                        {d.discount && (
                          <span
                            className="ml-1 text-[10px] px-1 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(85,239,196,0.15)', color: 'var(--success)' }}
                          >
                            {d.discount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan cards */}
                <div className="grid gap-4 max-w-md mx-auto w-full">
                  {plans.map((planId) => {
                    const info = PLAN_INFO[planId]
                    const color = PLAN_COLORS[planId]
                    const isHighlight = planId === 'serenite'
                    const isSuggested = planId === suggestedPlan
                    const effectiveDuration: DurationId = selectedDuration
                    const monthlyPrice = PRICES[planId][effectiveDuration]
                    const totalPrice = TOTAL_PRICES[planId][effectiveDuration]
                    const originalPrice = ORIGINAL_PRICES[planId]?.[effectiveDuration]
                    const savings = getSavingsPercent(planId, effectiveDuration)
                    const durationMonths = DURATIONS.find(d => d.id === effectiveDuration)?.months || 1

                    return (
                      <div
                        key={planId}
                        className="relative rounded-xl overflow-hidden flex flex-col"
                        style={{
                          background: 'var(--surface-card)',
                          border: (isHighlight || isSuggested) ? `2px solid ${color}` : '1px solid var(--border)',
                        }}
                      >
                        {(isHighlight || isSuggested) && (
                          <div
                            className="text-center py-1 text-[10px] font-semibold tracking-wide uppercase"
                            style={{ background: color, color: '#000000' }}
                          >
                            {isSuggested ? 'Recommandé' : 'Le plus choisi'}
                          </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-display text-base font-semibold" style={{ color }}>
                            {info.name}
                          </h3>
                          <p className="text-[11px] mt-0.5 mb-3 text-[var(--text-muted)]">
                            {info.tagline}
                          </p>

                          {/* Price */}
                          <div className="mb-4">
                            {planId === 'serenite' && effectiveDuration === 'monthly' ? (
                              <>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base line-through text-[var(--text-muted)]">
                                    {PROMO.originalPrice}{PROMO.currency}
                                  </span>
                                  <span className="text-2xl font-bold text-[var(--success)]">
                                    {PROMO.promoPrice}{PROMO.currency}
                                  </span>
                                  <span className="text-xs text-[var(--text-muted)]">/mois</span>
                                </div>
                                <p className="text-[11px] mt-1 font-medium text-[var(--success)]">
                                  code {PROMO.code} · + 7 jours gratuits
                                </p>
                                <div className="mt-1.5">
                                  <PromoCountdown className="text-xs" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                                    {formatPrice(monthlyPrice)}
                                  </span>
                                  <span className="text-xs text-[var(--text-muted)]">/mois</span>
                                </div>
                                {durationMonths > 1 && (
                                  <p className="text-[11px] mt-0.5 text-[var(--text-secondary)]">
                                    {formatPrice(totalPrice)} pour {durationMonths} mois
                                    {originalPrice && (
                                      <span className="ml-1 font-semibold text-[var(--success)]">-{savings}%</span>
                                    )}
                                  </p>
                                )}
                                {info.hasTrial && (
                                  <p className="text-[11px] mt-1 font-medium text-[var(--success)]">
                                    7 jours gratuits
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="space-y-1.5 mb-4 flex-1">
                            {PLAN_FEATURES[planId].map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>

                          {/* CTA */}
                          <button
                            onClick={() => handleSelectPlan(planId)}
                            className="w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            style={{
                              background: (isHighlight || isSuggested)
                                ? `linear-gradient(135deg, ${color}, ${color}dd)`
                                : 'transparent',
                              color: (isHighlight || isSuggested) ? '#000000' : color,
                              border: (isHighlight || isSuggested) ? 'none' : `1px solid ${color}`,
                            }}
                          >
                            {info.hasTrial ? 'Essayer 7 jours' : 'Choisir'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="text-center text-[11px] mt-4 text-[var(--text-muted)]">
                  Si on doit vous retenir par un contrat, c&apos;est qu&apos;on n&apos;a pas fait notre travail.
                </p>
              </>
            )}

            {/* ── ETAPE 2 : Paiement Stripe ── */}
            {step === 'checkout' && checkoutPlan && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {PLAN_INFO[checkoutPlan.plan].name} - {DURATIONS.find(d => d.id === checkoutPlan.duration)?.label}
                  </p>
                  <p className="text-xs mt-0.5 text-[var(--text-secondary)]">
                    {formatPrice(PRICES[checkoutPlan.plan][checkoutPlan.duration])}/mois
                  </p>
                </div>

                {checkoutError ? (
                  <div className="text-center py-8">
                    <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{checkoutError}</p>
                    <button
                      onClick={() => { setCheckoutError(null); setStep('plans'); setCheckoutPlan(null) }}
                      className="px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer"
                      style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.25)' }}
                    >
                      Retour aux plans
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                )}
              </>
            )}

            {/* ── ETAPE 3 : Succes ── */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.2)' }}
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Bienvenue dans la communauté !
                </h3>
                <p className="text-sm mb-6 text-[var(--text-secondary)]">
                  Votre abonnement est actif. Le contenu est maintenant débloqué.
                </p>
                <button
                  onClick={handleSuccess}
                  className="px-8 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                    color: '#000000',
                    boxShadow: '0 4px 20px rgba(201,169,97,0.3)',
                  }}
                >
                  C&apos;est parti !
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
