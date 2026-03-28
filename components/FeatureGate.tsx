'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useSubscription } from '@/hooks/useSubscription'
import { createClient } from '@/lib/supabase/client'
import SubscriptionModal from './SubscriptionModal'
import type { PlanId } from '@/lib/stripe/config'

// Plan minimum requis pour chaque feature
const FEATURE_MIN_PLAN: Record<string, { plan: PlanId; label: string }> = {
  shine_tv: { plan: 'serenite', label: 'Sérénité' },
  shine_audible: { plan: 'serenite', label: 'Sérénité' },
  shine_librairie: { plan: 'premium', label: 'Premium' },
  chat_douleur: { plan: 'serenite', label: 'Sérénité' },
  visio: { plan: 'serenite', label: 'Sérénité' },
  evenements_payants: { plan: 'serenite', label: 'Sérénité' },
  ateliers_premium: { plan: 'premium', label: 'Premium' },
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
  const { hasFeature, loading: featLoading, refresh: refreshFeatures } = useFeatureAccess()
  const { loading: subLoading, isActive, plan, userId, refresh: refreshSub } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPrenom, setUserPrenom] = useState('')

  const loading = featLoading || subLoading

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const { data: profile } = await supabase.from('profiles').select('prenom').eq('id', user.id).single()
        setUserPrenom(profile?.prenom || user.user_metadata?.prenom || '')
      }
    }
    loadUser()
  }, [])

  function handleSubscribed() {
    refreshSub()
    refreshFeatures()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }}>
            <div className="w-5 h-5 border-2 border-[var(--dark)] border-t-transparent rounded-full animate-spin" />
          </div>
          {loadingText && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{loadingText}</p>
          )}
        </div>
      </div>
    )
  }

  if (hasFeature(featureKey)) {
    return <>{children}</>
  }

  const minPlan = FEATURE_MIN_PLAN[featureKey]
  const requiredPlanLabel = minPlan?.label || 'supérieur'
  const suggestedPlan = minPlan?.plan

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
              style={{ background: 'var(--gold)' }}
            />
            <div
              className="relative z-10 rounded-2xl overflow-hidden p-8 sm:p-10"
              style={{
                background: 'linear-gradient(160deg, var(--dark-card) 0%, rgba(212,175,55,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(212,175,55,0.06)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Disponible avec l&apos;offre {requiredPlanLabel}
              </h2>

              <p className="text-sm sm:text-[15px] leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Cette fonctionnalité est incluse à partir de l&apos;offre <strong style={{ color: 'var(--gold)' }}>{requiredPlanLabel}</strong>.
                Passez à l&apos;offre supérieure pour y accéder.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                  color: '#050505',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                Passer à l&apos;offre {requiredPlanLabel}
              </button>

              <p className="mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                Mise à niveau immédiate avec prorata.
              </p>
            </div>
          </motion.div>
        </div>

        {userId && (
          <SubscriptionModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubscribed={handleSubscribed}
            userId={userId}
            userEmail={userEmail}
            userPrenom={userPrenom}
            suggestedPlan={suggestedPlan}
          />
        )}
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
            style={{ background: 'var(--gold)' }}
          />
          <div
            className="relative z-10 rounded-2xl overflow-hidden p-8 sm:p-10"
            style={{
              background: 'linear-gradient(160deg, var(--dark-card) 0%, rgba(212,175,55,0.06) 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(212,175,55,0.06)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Contenu réservé aux membres abonnés
            </h2>

            <p className="text-sm sm:text-[15px] leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              Ce contenu est accessible uniquement avec un abonnement actif.
              Découvrez nos formules et commencez votre transformation dès aujourd&apos;hui.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                color: '#050505',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Choisir mon abonnement
            </button>

            <p className="mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Sans engagement. Annulation en un clic.
            </p>
          </div>
        </motion.div>
      </div>

      {userId && (
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubscribed={handleSubscribed}
          userId={userId}
          userEmail={userEmail}
          userPrenom={userPrenom}
          suggestedPlan={suggestedPlan}
        />
      )}
    </>
  )
}
