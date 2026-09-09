'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function InscriptionConfirmeePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <InscriptionConfirmeeContent />
    </Suspense>
  )
}

function InscriptionConfirmeeContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'verified' | 'error' | 'idle'>('idle')
  const [emailSent, setEmailSent] = useState(false)

  // Verify the checkout session and trigger email if webhook didn't fire
  useEffect(() => {
    if (!sessionId) return

    setVerificationStatus('verifying')

    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          setVerificationStatus('verified')
          setEmailSent(!!data.email_sent)
        } else {
          setVerificationStatus('error')
        }
      })
      .catch(() => {
        setVerificationStatus('error')
      })
  }, [sessionId])

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--surface)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-lg w-full text-center"
      >
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 bg-[rgba(107,207,160,0.1)] border border-[rgba(107,207,160,0.25)]"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-display text-3xl sm:text-4xl font-light mb-4 text-[var(--brand)]"
        >
          Inscription confirmée !
        </h1>

        {/* Verification status */}
        {verificationStatus === 'verifying' && (
          <p className="text-sm mb-4 text-[var(--text-secondary)]">
            Vérification de votre paiement en cours...
          </p>
        )}

        {verificationStatus === 'verified' && emailSent && (
          <div
            className="flex items-center gap-2 justify-center mb-4 px-4 py-2 rounded-full mx-auto w-fit bg-[rgba(107,207,160,0.08)] border border-[rgba(107,207,160,0.2)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-xs text-[var(--success)]">Email de confirmation envoyé</span>
          </div>
        )}

        {/* Message */}
        <div
          className="bg-[var(--surface-raised)] border border-[var(--border-medium)] rounded-[var(--radius-xl)] p-8 mb-8 text-left"
        >
          <p className="text-base leading-relaxed mb-6 text-[var(--text-secondary)]">
            Votre paiement a été traité avec succès et votre compte <strong className="text-[var(--brand)]">SOS Shine</strong> est en cours de création.
          </p>

          <div
            className="p-5 rounded-xl mb-6 bg-[var(--brand-alpha-weak)] border border-[var(--border-medium)]"
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p className="font-semibold text-sm mb-1 text-[var(--brand)]">
                  Vérifiez votre boîte mail
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Vous allez recevoir un email avec vos <strong>identifiants de connexion</strong> (email + mot de passe temporaire).
                  Pensez à vérifier vos spams si vous ne le voyez pas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-[var(--brand-alpha-medium)] text-[var(--brand)]">1</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Ouvrez l&apos;email de SOS Shine
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-[var(--brand-alpha-medium)] text-[var(--brand)]">2</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Connectez-vous avec votre mot de passe temporaire
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-[var(--brand-alpha-medium)] text-[var(--brand)]">3</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Changez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
          >
            Se connecter
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border)]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Error state */}
        {verificationStatus === 'error' && (
          <div
            className="mt-6 p-5 rounded-xl text-left bg-[rgba(212,106,106,0.06)] border border-[rgba(212,106,106,0.15)]"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="var(--danger)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-semibold text-sm mb-1 text-[var(--danger)]">
                  Impossible de vérifier le paiement
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  Pas d&apos;inquiétude, votre paiement a bien été reçu par Stripe.
                  Vos identifiants vous seront envoyés par email dans les prochaines minutes.
                  Si vous ne recevez rien sous 15 minutes, contactez le support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-8 p-4 rounded-xl text-center bg-[var(--border-subtle)] border border-[var(--border)]">
          <p className="text-xs mb-2 text-[var(--text-muted)]">
            Vous n&apos;avez pas reçu l&apos;email ? Attendez quelques minutes puis vérifiez vos spams.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Toujours rien ?{' '}
            <a href="mailto:hello@sosshine.com" className="text-[var(--brand)] underline">hello@sosshine.com</a>
            {' '}ou essayez de{' '}
            <Link href="/forgot-password" className="text-[var(--brand)] underline">
              créer un mot de passe
            </Link>
            {' '}avec l&apos;email utilisé lors du paiement.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
