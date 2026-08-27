'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const C = { garnet: '#9B1B2E', garnetSoft: '#7d1723', alabaster: '#F2EBE4', smoke: '#A99A96', line: 'rgba(242,235,228,0.14)' }
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }

type State = { authed: boolean; completed: boolean; infosDone: boolean } | null

/** Barre de navigation SOS Meet, consciente de la connexion.
 *  Déconnecté : Me connecter · Créer mon profil.
 *  Connecté : Mon profil · Découvrir · Mes rencontres · Déconnexion. */
export default function MeetNav({ active }: { active?: 'profil' | 'questionnaire' | 'decouverte' | 'messages' }) {
  const [state, setState] = useState<State>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/sosmeet/me')
      .then(async (r) => {
        if (r.status === 401) { setState({ authed: false, completed: false, infosDone: false }); return }
        const d = await r.json()
        setState({ authed: !!d.authenticated, completed: !!d.profile?.completed, infosDone: !!d.infosDone })
      })
      .catch(() => setState({ authed: false, completed: false, infosDone: false }))
  }, [])

  async function logout() {
    try { await createClient().auth.signOut() } catch { /* ignore */ }
    window.location.href = '/sos-meet'
  }

  const linkCls = (on: boolean) => `text-[12.5px] tracking-[0.08em] transition-colors ${on ? '' : 'hover:opacity-100 opacity-70'}`
  const linkStyle = (on: boolean) => ({ color: on ? C.garnet : C.alabaster })

  const authedLinks = (
    <>
      <Link href="/sos-meet/profil" className={linkCls(active === 'profil')} style={linkStyle(active === 'profil')}>Mon profil</Link>
      <Link href="/sos-meet/decouverte" className={linkCls(active === 'decouverte')} style={linkStyle(active === 'decouverte')}>Découvrir</Link>
      <Link href="/sos-meet/messages" className={linkCls(active === 'messages')} style={linkStyle(active === 'messages')}>Mes rencontres</Link>
      <button onClick={logout} className="text-[12.5px] tracking-[0.08em] opacity-70 hover:opacity-100" style={{ color: C.smoke }}>Déconnexion</button>
    </>
  )
  const guestLinks = (
    <>
      <Link href="/login?next=/sos-meet/profil" className="text-[12.5px] tracking-[0.08em] opacity-80 hover:opacity-100" style={{ color: C.alabaster }}>Me connecter</Link>
      <Link href="/sos-meet/profil" className="text-[12px] tracking-[0.16em] uppercase px-5 py-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Créer mon profil</Link>
    </>
  )

  return (
    <header className="relative max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between" style={{ zIndex: 20 }}>
      <Link href="/sos-meet" className="text-[22px]" style={{ ...serif, fontWeight: 500, color: C.alabaster }}>SOS Meet<span style={{ color: C.garnet }}>.</span></Link>

      {/* Desktop */}
      <nav className="hidden sm:flex items-center gap-6">
        {state === null ? <span className="text-[12px] opacity-40" style={{ color: C.smoke }}>…</span> : state.authed ? authedLinks : guestLinks}
      </nav>

      {/* Mobile */}
      <div className="sm:hidden">
        <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="text-[22px] px-2" style={{ color: C.alabaster }}>{open ? '✕' : '☰'}</button>
        {open && (
          <div className="absolute right-4 top-16 flex flex-col items-end gap-3 rounded-2xl p-5" style={{ background: '#151016', border: `1px solid ${C.line}`, minWidth: 200 }}>
            {state?.authed ? authedLinks : guestLinks}
          </div>
        )}
      </div>
    </header>
  )
}
