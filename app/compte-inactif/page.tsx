'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function CompteInactifPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPrenom, setUserPrenom] = useState('')
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<{ plan: string; duration: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email || null)
      setUserId(user.id)
      setUserPrenom(user.user_metadata?.prenom || user.user_metadata?.full_name?.split(' ')[0] || '')

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .single()

      if (sub) {
        setSubStatus(sub.status)
        setHasSubscription(true)

        if (sub.status === 'active' || sub.status === 'trialing') {
          router.push('/dashboard')
        }
      }
    }
    loadData()
  }, [router])

  const handleResubscribe = (plan: 'essential' | 'serenite' | 'premium') => {
    setCheckoutPlan({ plan, duration: 'monthly' })
  }

  const fetchClientSecret = useCallback(async () => {
    if (!checkoutPlan || !userEmail) return ''
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
    if (data.error) throw new Error(data.error)
    return data.clientSecret
  }, [checkoutPlan, userEmail, userPrenom, userId])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    past_due: { label: 'Paiement en retard', color: '#E17055' },
    canceled: { label: 'Annulé', color: 'var(--danger)' },
    inactive: { label: 'Inactif', color: 'var(--text-muted)' },
  }

  const statusInfo = subStatus ? statusLabels[subStatus] || statusLabels.inactive : statusLabels.inactive

  // Embedded checkout overlay
  if (checkoutPlan) {
    const planNames: Record<string, string> = { essential: 'Essentielle', serenite: 'Sérénité', premium: 'Premium' }
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => setCheckoutPlan(null)}
            className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors cursor-pointer text-[var(--text-secondary)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour
          </button>

          <div className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--border)]">
            <div className="p-6 text-center border-b border-[var(--border)]">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                {planNames[checkoutPlan.plan] || checkoutPlan.plan}
              </h2>
              <p className="text-sm mt-1 text-[var(--text-secondary)]">
                Paiement sécurisé
              </p>
            </div>
            <div className="p-1">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-[var(--brand-alpha-weak)] border border-[var(--border-medium)]">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-light mb-4 text-[var(--text-primary)]">
          Accès suspendu
        </h1>

        <AnimatePresence>
          {subStatus && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${statusInfo.color}15`, border: `1px solid ${statusInfo.color}30` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: statusInfo.color }} />
              <span className="text-sm font-medium" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-base leading-relaxed mb-8 text-[var(--text-secondary)]">
          {subStatus === 'past_due' ? (
            "Votre dernier paiement n’a pas pu être traité. Veuillez mettre à jour vos informations de paiement pour retrouver l’accès à la plateforme."
          ) : subStatus === 'canceled' ? (
            "Votre abonnement a été annulé. Réabonnez-vous pour retrouver l’accès à tout votre contenu."
          ) : (
            "Votre compte n’a pas d’abonnement actif. Choisissez un plan pour accéder à la plateforme."
          )}
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-8">
          {hasSubscription && subStatus === 'past_due' && (
            <button
              onClick={() => handleResubscribe('serenite')}
              className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
            >
              Mettre à jour le paiement
            </button>
          )}

          <button
            onClick={() => handleResubscribe('essential')}
            className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm bg-[var(--brand-alpha-medium)] text-[var(--brand)] border border-[var(--brand-alpha-strong)]"
          >
            S&apos;abonner Essentielle - 9,90€/mois
          </button>

          <button
            onClick={() => handleResubscribe('serenite')}
            className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm bg-[linear-gradient(135deg,var(--success),#00B894)] text-[var(--text-inverse)]"
          >
            S&apos;abonner Sérénité - 49,90€/mois
          </button>

          <button
            onClick={() => handleResubscribe('premium')}
            className="w-full py-4 rounded-full font-medium tracking-wide transition-all text-sm bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
          >
            S&apos;abonner Premium - 99,90€/mois
          </button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Link href="/" className="text-xs transition-colors text-[var(--text-muted)]">
            Retour à l&apos;accueil
          </Link>
          <button onClick={handleSignOut} className="text-xs transition-colors cursor-pointer text-[var(--text-muted)]">
            Se déconnecter
          </button>
          <Link href="/contact" className="text-xs transition-colors text-[var(--text-muted)]">
            Contacter le support
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
