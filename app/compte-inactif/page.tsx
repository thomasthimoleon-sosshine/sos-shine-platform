'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function CompteInactifPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPrenom, setUserPrenom] = useState('')
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)

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
    const paymentLinks: Record<string, string> = {
      serenite: 'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r',
      essential: 'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e',
    }
    const link = paymentLinks[plan]
    if (link) {
      const url = new URL(link)
      if (userEmail) url.searchParams.set('prefilled_email', userEmail)
      if (userId) url.searchParams.set('client_reference_id', userId)
      window.location.href = url.toString()
    }
  }

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
            onClick={() => handleResubscribe('serenite')}
            className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
          >
            S&apos;abonner SOS Shine - 49,90€/mois
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
