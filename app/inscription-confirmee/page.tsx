'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function InscriptionConfirmeePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
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
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--dark)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-lg w-full text-center"
      >
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.25)' }}
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-display text-3xl sm:text-4xl font-light mb-4"
          style={{ color: '#D4AF37' }}
        >
          Inscription confirmée !
        </h1>

        {/* Verification status */}
        {verificationStatus === 'verifying' && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Vérification de votre paiement en cours...
          </p>
        )}

        {verificationStatus === 'verified' && emailSent && (
          <div
            className="flex items-center gap-2 justify-center mb-4 px-4 py-2 rounded-full mx-auto"
            style={{ background: 'rgba(85,239,196,0.08)', border: '1px solid rgba(85,239,196,0.2)', width: 'fit-content' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-xs" style={{ color: '#55EFC4' }}>Email de confirmation envoyé</span>
          </div>
        )}

        {/* Message */}
        <div
          className="glass p-8 mb-8 text-left"
          style={{ borderColor: 'rgba(212,175,55,0.15)' }}
        >
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Votre paiement a été traité avec succès et votre compte <strong style={{ color: '#D4AF37' }}>SOS Shine</strong> est en cours de création.
          </p>

          <div
            className="p-5 rounded-xl mb-6"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: '#D4AF37' }}>
                  Vérifiez votre boîte mail
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Vous allez recevoir un email avec vos <strong>identifiants de connexion</strong> (email + mot de passe temporaire).
                  Pensez à vérifier vos spams si vous ne le voyez pas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>1</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Ouvrez l&apos;email de SOS Shine
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>2</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Connectez-vous avec votre mot de passe temporaire
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>3</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Changez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
          >
            Se connecter
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Error state */}
        {verificationStatus === 'error' && (
          <div
            className="mt-6 p-5 rounded-xl text-left"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: '#f87171' }}>
                  Impossible de vérifier le paiement
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Pas d&apos;inquiétude, votre paiement a bien été reçu par Stripe.
                  Vos identifiants vous seront envoyés par email dans les prochaines minutes.
                  Si vous ne recevez rien sous 15 minutes, contactez le support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-8 p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            Vous n&apos;avez pas reçu l&apos;email ? Attendez quelques minutes puis vérifiez vos spams.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Toujours rien ?{' '}
            <a href="mailto:hello@sosshine.com" style={{ color: '#D4AF37', textDecoration: 'underline' }}>hello@sosshine.com</a>
            {' '}ou essayez de{' '}
            <Link href="/forgot-password" style={{ color: '#D4AF37', textDecoration: 'underline' }}>
              créer un mot de passe
            </Link>
            {' '}avec l&apos;email utilisé lors du paiement.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
