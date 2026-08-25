'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resoudreProtocoleActif, CHEMIN_SIGNATURE } from '@/lib/protocole-actif'

function MonCheminContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()

      let memorise: string | null = null
      try { memorise = sessionStorage.getItem('sos_protocol_slug') } catch {}

      // Même résolution que le tableau de bord : les deux entrées mènent
      // forcément au même protocole.
      const actif = await resoudreProtocoleActif(
        supabase,
        searchParams.get('protocol'),
        memorise,
      )

      if (actif.slug) {
        router.replace(`/dashboard/encyclopedie/${actif.slug}`)
        return
      }

      // Rien d'exprimé : on ne tire pas un protocole au hasard, on propose
      // à la personne de passer sa signature émotionnelle.
      router.replace(CHEMIN_SIGNATURE)
    }
    init()
  }, []) // eslint-disable-line

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de ton protocole...</p>
    </main>
  )
}

export default function MonCheminPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
      </main>
    }>
      <MonCheminContent />
    </Suspense>
  )
}
