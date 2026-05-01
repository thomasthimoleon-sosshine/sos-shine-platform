'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import MagneticButton from './MagneticButton'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const PLANS = {
  essentielle: {
    name: 'Essentielle',
    price: '9,90',
    period: '/mois',
    badge: null,
    features: [
      'Encyclopédie complète — 200+ protocoles',
      'Shine TV — Vidéos guidées par Julia',
      'Shine Librairie — eBooks & guides',
      'Événements live hebdomadaires',
      'Communauté & Feu de Camp',
      'Shine Audible — Méditations',
    ],
    cta: 'Choisir Essentielle',
    href: '/rejoindre',
  },
  serenite: {
    name: 'Sérénité',
    price: '29,90',
    originalPrice: '49,90',
    period: '/mois',
    badge: '7 JOURS GRATUIT',
    features: [
      'Tout Essentielle inclus',
      'Accès prioritaire nouveaux protocoles',
      'Sessions de groupe avec Julia',
      'Soins collectifs mensuels',
      'Parcours personnalisé Signature',
      'Support prioritaire',
    ],
    cta: 'Essayer 7 jours gratuit',
    href: '/rejoindre',
  },
}

type PlanKey = keyof typeof PLANS

export default function PricingMorph() {
  const [selected, setSelected] = useState<PlanKey>('serenite')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const plan = PLANS[selected]

  return (
    <section ref={ref} className="py-32 md:py-44">
      <div className="max-w-3xl mx-auto px-6 md:px-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/30 mb-6 text-center">
            Le choix
          </p>
          <h2 className="font-display text-[2rem] sm:text-[2.8rem] md:text-[3.5rem] font-light leading-[1.06] tracking-[-0.03em] text-center text-[#FAFAF7] mb-16">
            Ta d&eacute;cision n&apos;est pas un achat.<br />
            <span className="italic text-[#FAFAF7]/40">C&apos;est un serment envers toi-m&ecirc;me.</span>
          </h2>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="flex justify-center mb-12"
        >
          <div className="flex p-1 rounded-full bg-[#FAFAF7]/[0.04] border border-[#FAFAF7]/[0.06]">
            {(['essentielle', 'serenite'] as PlanKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`relative px-6 py-2.5 rounded-full text-[13px] font-medium transition-all duration-500 cursor-pointer ${selected === key ? 'text-[#0A0A0F]' : 'text-[#FAFAF7]/40 hover:text-[#FAFAF7]/60'}`}
              >
                {selected === key && (
                  <motion.div
                    layoutId="pricing-pill"
                    className="absolute inset-0 bg-[#FAFAF7] rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{PLANS[key].name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="relative rounded-[32px] overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(250,250,247,0.04) 0%, rgba(250,250,247,0.01) 100%)',
            border: '1px solid rgba(250,250,247,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FAFAF7]/10 to-transparent" />

          <div className="p-8 sm:p-10 md:p-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="flex justify-center mb-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#D4AF7F]/10 text-[#D4AF7F] border border-[#D4AF7F]/15">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-3">
                    {'originalPrice' in plan && plan.originalPrice && (
                      <span className="text-[18px] text-[#FAFAF7]/20 line-through">{plan.originalPrice}&euro;</span>
                    )}
                    <span className="font-display text-[4rem] sm:text-[5rem] font-light text-[#FAFAF7] tracking-[-0.03em]">{plan.price}</span>
                    <span className="text-[16px] text-[#FAFAF7]/30 font-light">&euro;{plan.period}</span>
                  </div>
                  {'originalPrice' in plan && (
                    <p className="text-[12px] text-[#D4AF7F] mt-2">code SHINE2026</p>
                  )}
                </div>

                {/* Features */}
                <div className="max-w-sm mx-auto mb-10">
                  <ul className="space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px] text-[#FAFAF7]/50 font-light leading-relaxed">
                        <span className="text-[#D4AF7F] mt-0.5 shrink-0 text-[12px]">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="flex justify-center">
                  <MagneticButton href={plan.href}>
                    {plan.cta}
                  </MagneticButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-[12px] text-[#FAFAF7]/20 mt-8 font-light">
          Sans engagement &middot; Annulable en 1 clic &middot; Paiement s&eacute;curis&eacute; Stripe
        </p>
      </div>
    </section>
  )
}
