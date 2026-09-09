'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { discoveryDaysLeft, discoveryTimeLeftLabel } from '@/lib/discovery-access'

/**
 * Bandeau d'accès découverte.
 *
 * Visible uniquement pendant les 30 jours offerts à l'achat d'un protocole seul
 * (33€). Il rappelle ce que la personne est en train de vivre et ce qu'elle perd
 * à l'échéance : tout sauf le protocole acheté, qui lui reste acquis.
 * Un abonné ne le voit jamais.
 */
export default function DiscoveryBanner() {
  const { loading, accessSource, discoveryUntil } = useSubscription()

  if (loading || accessSource !== 'discovery' || !discoveryUntil) return null

  const days = discoveryDaysLeft(discoveryUntil)
  const urgent = days <= 7

  return (
    <div
      className="mb-6 rounded-2xl px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        background: urgent ? 'rgba(255,107,107,0.06)' : 'rgba(201,169,97,0.06)',
        border: `1px solid ${urgent ? 'rgba(255,107,107,0.22)' : 'rgba(201,169,97,0.2)'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1"
          style={{ color: urgent ? '#FF6B6B' : 'var(--brand)' }}
        >
          Accès découverte
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Toute la plateforme vous est ouverte pendant encore{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{discoveryTimeLeftLabel(discoveryUntil)}</strong>.
          Ensuite, vous ne gardez que le protocole que vous avez acheté.
        </p>
      </div>
      <Link
        href="/dashboard/tarifs"
        className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold text-center transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #A88248))', color: '#000000' }}
      >
        Garder tout l&apos;accès
      </Link>
    </div>
  )
}
