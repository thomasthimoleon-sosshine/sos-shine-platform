'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CoupleReportView from '@/components/sosmeet/CoupleReportView'
import type { CoupleReport } from '@/lib/sosmeet/couple/report'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

type Reponse =
  | { etat: 'prete'; prenomA: string; prenomB: string; report: CoupleReport }
  | { etat: 'en_attente'; moiPret: boolean; partenairePret: boolean }
  | { etat: 'suspendu' }
  | { etat: 'aucun_duo' }

export default function CarteClient() {
  const [r, setR] = useState<Reponse | null>(null)
  const [auth, setAuth] = useState(true)

  useEffect(() => {
    let vivant = true
    const charger = async () => {
      try {
        const res = await fetch('/api/sosmeet/couple/report')
        if (res.status === 401) { if (vivant) setAuth(false); return }
        const d = await res.json()
        if (vivant) setR(res.status === 404 ? { etat: 'aucun_duo' } : d)
      } catch { if (vivant) setAuth(false) }
    }
    charger()
    // Tant que le/la partenaire n'a pas fini, on regarde de temps en temps.
    const t = setInterval(charger, 20000)
    return () => { vivant = false; clearInterval(t) }
  }, [])

  const shell = 'min-h-screen relative'
  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const centre = 'relative max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center'
  const cta: React.CSSProperties = { background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }

  if (!auth) return (
    <main className={shell} style={bg}><div className={centre}>
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi d’abord</h1>
      <p className="mt-3 mb-7 text-[15px]" style={{ color: C.smoke }}>Votre lecture est rattachée à vos comptes.</p>
      <a href="/login?next=/sos-meet/couple/carte" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Me connecter</a>
    </div></main>
  )

  if (!r) return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>

  if (r.etat === 'prete') return <CoupleReportView report={r.report} prenomA={r.prenomA} prenomB={r.prenomB} />

  if (r.etat === 'suspendu') return (
    <main className={shell} style={bg}>
      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col justify-center">
        <h1 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.8rem,5.5vw,2.3rem)' }}>Votre parcours est en pause</h1>
        <p className="text-[15.5px] leading-relaxed" style={{ color: C.smoke }}>
          Une personne de l’équipe reprend contact avec vous. Si tu es en danger immédiat, appelle le 17.
          Le 3919 est joignable gratuitement et anonymement.
        </p>
      </div>
    </main>
  )

  if (r.etat === 'aucun_duo') return (
    <main className={shell} style={bg}><div className={centre}>
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Il faut d’abord votre duo</h1>
      <p className="mt-3 mb-7 text-[15px] leading-relaxed" style={{ color: C.smoke }}>L’un de vous l’ouvre, l’autre le rejoint.</p>
      <Link href="/sos-meet/couple/duo" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Ouvrir notre duo</Link>
    </div></main>
  )

  return (
    <main className={shell} style={bg}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.12), transparent 55%)' }} />
      <div className={centre}>
        <h1 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,6vw,2.5rem)' }}>
          {r.moiPret ? 'On attend ton/ta partenaire' : 'Ta lecture t’attend'}
        </h1>
        <p className="text-[15.5px] leading-relaxed mb-8" style={{ color: C.smoke }}>
          {r.moiPret
            ? 'Tes réponses sont scellées. Dès que les siennes le seront, votre carte apparaîtra ici. Tu peux fermer cette page.'
            : 'Termine ton questionnaire : votre carte se construit à partir de vos deux lectures, jamais d’une seule.'}
        </p>
        {!r.moiPret && (
          <Link href="/sos-meet/couple/questionnaire" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>
            Reprendre mon questionnaire →
          </Link>
        )}
        <Link href="/sos-meet/couple/duo" className="mt-5 text-[13px] tracking-[0.08em] uppercase" style={{ color: C.smoke2 }}>Voir où vous en êtes</Link>
      </div>
    </main>
  )
}
