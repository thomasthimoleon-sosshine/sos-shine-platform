'use client'

// Page utilitaire de DÉMO (projection) — à retirer avant l'ouverture publique.
// Permet de peupler / vider des faux profils en un clic sur le site déployé.

import { useEffect, useState } from 'react'
import MeetNav from '../MeetNav'

const C = { ink: '#0A090B', card: '#151016', garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F', alabaster: '#F2EBE4', smoke: '#A99A96', line: 'rgba(242,235,228,0.14)' }
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }
const TOKEN = 'SEED_MEET_2026'

export default function DemoPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sosmeet/me').then(async (r) => { if (r.ok) { const d = await r.json(); setEmail(d.email || null) } }).catch(() => {})
  }, [])

  async function run(method: 'POST' | 'DELETE') {
    setBusy(true); setMsg(null)
    try {
      const res = await fetch(`/api/sosmeet/dev-seed?token=${TOKEN}`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ likeEmail: email }) : undefined,
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setMsg(`Erreur : ${d.error || res.status}`); return }
      if (method === 'POST') setMsg(`✓ ${d.count} profils de démo créés${d.likedBy?.length ? ` · ${d.likedBy.length} t'ont déjà remarqué·e` : ''}. Va sur Découvrir.`)
      else setMsg(`✓ ${d.removed} profils de démo supprimés.`)
    } catch { setMsg('Connexion impossible.') } finally { setBusy(false) }
  }

  const btn = 'w-full py-4 rounded-full text-[14px] tracking-[0.1em] uppercase disabled:opacity-60'

  return (
    <main style={{ ...sans, background: C.ink, color: C.alabaster }} className="min-h-screen">
      <MeetNav />
      <div className="max-w-md mx-auto px-6 py-10">
        <span className="text-[11px] tracking-[0.34em] uppercase" style={{ color: C.ember }}>Démo · projection</span>
        <h1 className="mt-3 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,5vw,2.6rem)' }}>Peupler la démo</h1>
        <p className="text-[14.5px] leading-relaxed mb-8" style={{ color: C.smoke }}>
          Crée une dizaine de faux profils (scores réels via nos moteurs) pour voir ce que donne la Découverte.
          {email ? <> Deux d’entre eux « te remarqueront » pour tester un match instantané ({email}).</> : <> <b style={{ color: C.ember }}>Connecte-toi d’abord</b> pour tester aussi un match instantané.</>}
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => run('POST')} disabled={busy} className={btn} style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
            {busy ? 'Un instant…' : 'Créer les profils de démo'}
          </button>
          <button onClick={() => run('DELETE')} disabled={busy} className={btn} style={{ border: `1px solid ${C.line}`, color: C.smoke }}>
            Vider la démo
          </button>
        </div>
        {msg && <p className="mt-6 text-[14px] p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.alabaster }}>{msg}</p>}
        <p className="mt-8 text-[12px]" style={{ color: C.smoke }}>⚠️ Page technique — à retirer avant l’ouverture publique.</p>
      </div>
    </main>
  )
}
