'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  SINGLE_PROTOCOL_LINK,
  SINGLE_PROTOCOL_PRICE_EUR,
  buildProtocolRef,
} from '@/lib/stripe/config'

interface Protocol {
  slug: string
  title: string
  subtitle: string
  category: string
  cover_image: string | null
}

// Page « Choisir mon protocole »
// Parcours : inscription obligatoire → choix d'UN protocole disponible.
// Deux options : l'abonnement complet (tout SOS Shine) ou ce protocole seul (33€).
export default function ChoisirProtocolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      // L'inscription est obligatoire avant de choisir/payer un protocole.
      if (!authUser) {
        router.replace('/signup?source=protocole&next=/choisir-mon-protocole')
        return
      }
      setUser({ id: authUser.id, email: authUser.email || '' })

      // Protocoles déjà débloqués par cet utilisateur (pour ne pas les revendre).
      try {
        const { data: unlocks } = await supabase
          .from('protocol_unlocks')
          .select('protocol_slug')
          .eq('user_id', authUser.id)
        if (unlocks) setUnlocked(new Set(unlocks.map((u: { protocol_slug: string }) => u.protocol_slug)))
      } catch { /* table absente : on ignore */ }

      // Déjà abonné ? Alors tout est débloqué, inutile d'acheter à l'unité.
      try {
        const subRes = await fetch(`/api/subscription/features?user_id=${authUser.id}`)
        const subData = await subRes.json()
        if (subData.is_active || subData.is_admin) setIsSubscribed(true)
      } catch { /* non-critique */ }

      // Liste des protocoles disponibles à l'achat.
      try {
        const res = await fetch('/api/protocols/available')
        const data = await res.json()
        setProtocols(data.protocols || [])
      } catch { /* non-critique */ }

      setLoading(false)
    }
    init()
  }, [router])

  function unlockProtocol(slug: string) {
    if (!user) return
    const url = new URL(SINGLE_PROTOCOL_LINK)
    if (user.email) url.searchParams.set('prefilled_email', user.email)
    url.searchParams.set('client_reference_id', buildProtocolRef(user.id, slug))
    window.location.href = url.toString()
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A961', fontFamily: 'Georgia, serif' }}>
        <p>Chargement…</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0A0806', color: '#F5EFE3', fontFamily: "'DM Sans', system-ui, sans-serif", padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* En-tête */}
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A961', marginBottom: 14 }}>
            Choisis ton protocole
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 34, lineHeight: 1.15, margin: '0 0 14px' }}>
            Débloque le protocole qui te correspond
          </h1>
          <p style={{ color: 'rgba(245,239,227,0.7)', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Accède à un protocole complet en une fois, ou débloque toute la plateforme avec l'abonnement.
          </p>
        </header>

        {/* Bandeau abonnement complet */}
        {!isSubscribed && (
          <div style={{ border: '1px solid rgba(201,169,97,0.25)', borderRadius: 18, padding: '22px 24px', marginBottom: 36, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', background: 'rgba(201,169,97,0.05)' }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, margin: '0 0 4px' }}>Tout SOS Shine — 49,90€/mois</p>
              <p style={{ color: 'rgba(245,239,227,0.65)', fontSize: 13.5, margin: 0 }}>Tous les protocoles, Shine TV, Librairie, Audible, communauté, lives et événements.</p>
            </div>
            <Link href="/rejoindre" style={{ flexShrink: 0, background: 'linear-gradient(135deg,#C9A961,#A88248)', color: '#0A0806', padding: '13px 26px', borderRadius: 50, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Voir l'abonnement
            </Link>
          </div>
        )}

        {isSubscribed && (
          <div style={{ border: '1px solid rgba(85,239,196,0.3)', borderRadius: 18, padding: '18px 24px', marginBottom: 36, textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#55EFC4', fontSize: 14 }}>
              Tu es abonné(e) — tous les protocoles sont déjà débloqués.{' '}
              <Link href="/dashboard/encyclopedie" style={{ color: '#55EFC4', textDecoration: 'underline' }}>Accéder à la plateforme →</Link>
            </p>
          </div>
        )}

        {/* Grille des protocoles */}
        {protocols.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(245,239,227,0.55)' }}>
            Aucun protocole disponible pour le moment. Reviens bientôt.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {protocols.map((p) => {
              const isUnlocked = unlocked.has(p.slug) || isSubscribed
              return (
                <div key={p.slug} style={{ border: '1px solid rgba(245,239,227,0.12)', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
                  {p.category && (
                    <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A961', marginBottom: 10 }}>{p.category}</span>
                  )}
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 22, margin: '0 0 8px' }}>{p.title}</h3>
                  {p.subtitle && (
                    <p style={{ color: 'rgba(245,239,227,0.65)', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 18px', flex: 1 }}>{p.subtitle}</p>
                  )}
                  {isUnlocked ? (
                    <Link href={`/dashboard/encyclopedie/${p.slug}`} style={{ textAlign: 'center', border: '1px solid rgba(85,239,196,0.4)', color: '#55EFC4', padding: '12px', borderRadius: 50, fontWeight: 600, fontSize: 13.5, textDecoration: 'none', marginTop: 'auto' }}>
                      ✓ Débloqué — Ouvrir
                    </Link>
                  ) : (
                    <button onClick={() => unlockProtocol(p.slug)} style={{ marginTop: 'auto', background: 'linear-gradient(135deg,#C9A961,#A88248)', color: '#0A0806', padding: '13px', borderRadius: 50, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                      Débloquer ce protocole — {SINGLE_PROTOCOL_PRICE_EUR}€
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(245,239,227,0.4)', fontSize: 12, marginTop: 40 }}>
          Paiement sécurisé via Stripe · Accès unique, sans abonnement
        </p>
      </div>
    </main>
  )
}
