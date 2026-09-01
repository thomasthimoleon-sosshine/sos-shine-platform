'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useSubscription } from '@/hooks/useSubscription'
import { createClient } from '@/lib/supabase/client'
import { getPaymentLink } from '@/lib/stripe'
import type { PlanId } from '@/lib/stripe/config'

// Features GRATUITES - accessibles à tous les membres inscrits (même sans abonnement)
export const FREE_FEATURES = new Set<string>([
  'communaute',
  'mur',
  'shine_audible',
  'gamification',
  'badges',
  'defis',
  'streaks',
  'xp',
])

// Gratuit (0€) : Communauté + Mur + Shine Audible + Étape 1 protocole
// SOS Shine (49,90€/mois) : tout le reste
const FEATURE_MIN_PLAN: Record<string, { plan: PlanId; label: string }> = {
  chat_douleur: { plan: 'serenite', label: 'SOS Shine' },
  encyclopedie: { plan: 'serenite', label: 'SOS Shine' },
  shine_tv: { plan: 'serenite', label: 'SOS Shine' },
  shine_shorts: { plan: 'serenite', label: 'SOS Shine' },
  shine_librairie: { plan: 'serenite', label: 'SOS Shine' },
  soin_collectif: { plan: 'serenite', label: 'SOS Shine' },
  visio: { plan: 'serenite', label: 'SOS Shine' },
  live_hebdo: { plan: 'serenite', label: 'SOS Shine' },
  evenements_payants: { plan: 'serenite', label: 'SOS Shine' },
}

interface FeatureGateProps {
  children: React.ReactNode
  featureKey: string
  loadingText?: string
}

/**
 * Verifie l'acces a une fonctionnalite selon le plan.
 * - Feature activee → contenu
 * - Abonne mais pas le bon plan → upgrade via modal
 * - Pas abonne → abonnement via modal
 */
export default function FeatureGate({ children, featureKey, loadingText }: FeatureGateProps) {
  const { hasFeature, loading: featLoading } = useFeatureAccess()
  const { loading: subLoading, isActive, plan, userId } = useSubscription()
  const [userEmail, setUserEmail] = useState('')

  const loading = featLoading || subLoading

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
    }
    loadUser()
  }, [])

  // Abonnement : redirection vers le Payment Link Stripe (source unique du prix),
  // email et identifiant pré-remplis pour rattacher le paiement au compte.
  function goToCheckout() {
    const link = getPaymentLink('serenite', 'monthly')
    if (!link) return
    const url = new URL(link)
    if (userEmail) url.searchParams.set('prefilled_email', userEmail)
    if (userId) url.searchParams.set('client_reference_id', userId)
    window.location.href = url.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }}>
            <div className="w-5 h-5 border-2 border-[var(--dark)] border-t-transparent rounded-full animate-spin" />
          </div>
          {loadingText && (
            <p className="text-sm text-[var(--text-muted)]">{loadingText}</p>
          )}
        </div>
      </div>
    )
  }

  // Free features - always accessible to any authenticated user
  if (FREE_FEATURES.has(featureKey)) {
    return <>{children}</>
  }

  if (hasFeature(featureKey)) {
    return <>{children}</>
  }

  const minPlan = FEATURE_MIN_PLAN[featureKey]
  const requiredPlanLabel = minPlan?.label || 'supérieur'

  // Abonne mais pas le bon plan → upgrade
  if (isActive && plan) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-lg w-full text-center relative"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-15 blur-[60px]"
              style={{ background: 'var(--brand)' }}
            />
            <div
              className="relative z-10 rounded-2xl overflow-hidden p-8 sm:p-10"
              style={{
                background: 'linear-gradient(160deg, var(--surface-card) 0%, rgba(201,169,97,0.06) 100%)',
                border: '1px solid rgba(201,169,97,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(201,169,97,0.06)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-semibold mb-3 text-[var(--text-primary)]">
                Disponible avec l&apos;offre {requiredPlanLabel}
              </h2>

              <p className="text-sm sm:text-[15px] leading-relaxed mb-8 text-[var(--text-secondary)]">
                Cette fonctionnalité est incluse à partir de l&apos;offre <strong className="text-[var(--brand)]">{requiredPlanLabel}</strong>.
                Passez à l&apos;offre supérieure pour y accéder.
              </p>

              <button
                onClick={goToCheckout}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(201,169,97,0.3)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                Passer à l&apos;offre {requiredPlanLabel}
              </button>

              <p className="mt-5 text-xs text-[var(--text-muted)]">
                Mise à niveau immédiate avec prorata.
              </p>
            </div>
          </motion.div>
        </div>

      </>
    )
  }

  // Pas abonne → abonnement
  return (
    <>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-lg w-full text-center relative"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-15 blur-[60px]"
            style={{ background: 'var(--brand)' }}
          />
          <div
            className="relative z-10 rounded-2xl overflow-hidden p-8 sm:p-10"
            style={{
              background: 'linear-gradient(160deg, var(--surface-card) 0%, rgba(201,169,97,0.06) 100%)',
              border: '1px solid rgba(201,169,97,0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(201,169,97,0.06)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-3 text-[var(--text-primary)]">
              Contenu réservé aux membres abonnés
            </h2>

            <p className="text-sm sm:text-[15px] leading-relaxed mb-8 text-[var(--text-secondary)]">
              Ce contenu est accessible uniquement avec un abonnement actif.
              Découvrez nos formules et commencez votre transformation dès aujourd&apos;hui.
            </p>

            <button
              onClick={goToCheckout}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                color: '#000000',
                boxShadow: '0 4px 20px rgba(201,169,97,0.3)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Choisir mon abonnement
            </button>

            <p className="mt-5 text-xs text-[var(--text-muted)]">
              Sans engagement. Annulation en un clic.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
