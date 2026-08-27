'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MeetNav from '../MeetNav'

const C = {
  ink: '#0A090B', card: '#151016', velvet: '#120E11', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

type Match = { matchId: string; other: { userId: string; firstName: string; age: number | null; city: string | null; headline: string | null; photoUrl: string | null }; lastMessage: { body: string; fromMe: boolean; at: string } | null }
type Msg = { id: string; body: string; fromMe: boolean; at: string }

export default function MessagesClient() {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'ready'>('loading')
  const [matches, setMatches] = useState<Match[]>([])
  const [active, setActive] = useState<Match | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/sosmeet/matches').then(async (r) => {
      if (r.status === 401) { setPhase('auth'); return }
      const d = await r.json(); setMatches(d.matches || []); setPhase('ready')
    }).catch(() => setPhase('auth'))
  }, [])

  // Charge + rafraîchit la conversation active
  useEffect(() => {
    if (!active) return
    let stop = false
    const load = () => fetch(`/api/sosmeet/messages?matchId=${active.matchId}`).then(async (r) => {
      if (!r.ok) return; const d = await r.json(); if (!stop) setMsgs(d.messages || [])
    }).catch(() => {})
    load()
    const t = setInterval(load, 5000)
    return () => { stop = true; clearInterval(t) }
  }, [active])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const [menu, setMenu] = useState(false)
  async function safety(action: 'block' | 'report') {
    if (!active) return
    if (action === 'block' && !confirm('Bloquer cette personne ? Vous ne verrez plus son profil et votre lien sera coupé.')) return
    let reason: string | undefined
    if (action === 'report') { reason = prompt('Que veux-tu signaler ? (facultatif)') || undefined }
    await fetch('/api/sosmeet/safety', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, userId: active.other.userId, reason }) }).catch(() => {})
    setMenu(false)
    if (action === 'block') { setMatches((ms) => ms.filter((x) => x.matchId !== active.matchId)); setActive(null) }
    else alert('Merci, c’est signalé. Notre équipe regarde.')
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !text.trim()) return
    const body = text.trim(); setText('')
    setMsgs((m) => [...m, { id: 'tmp' + Date.now(), body, fromMe: true, at: new Date().toISOString() }])
    await fetch('/api/sosmeet/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: active.matchId, body }) }).catch(() => {})
  }

  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const shell = 'min-h-screen relative'

  if (phase === 'loading') return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>
  if (phase === 'auth') return (
    <main className={shell} style={bg}><div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi</h1>
      <a href="/login?next=/sos-meet/messages" className="mt-6 px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Me connecter</a>
    </div></main>
  )

  // Conversation ouverte
  if (active) {
    const o = active.other
    return (
      <main className={shell} style={bg}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 min-h-screen flex flex-col">
          <div className="flex items-center gap-3 py-4 border-b" style={{ borderColor: C.line }}>
            <button onClick={() => setActive(null)} className="text-[13px]" style={{ color: C.smoke }}>←</button>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: C.velvet }}>
              {o.photoUrl && <img src={o.photoUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <div style={{ ...serif, fontSize: 16 }}>{o.firstName}{o.age ? `, ${o.age}` : ''}</div>
              {o.city && <div className="text-[11.5px]" style={{ color: C.smoke2 }}>{o.city}</div>}
            </div>
            <div className="relative">
              <button onClick={() => setMenu((v) => !v)} aria-label="Options" className="px-3 py-2 text-[18px]" style={{ color: C.smoke }}>⋯</button>
              {menu && (
                <div className="absolute right-0 top-10 z-10 rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}`, minWidth: 160 }}>
                  <button onClick={() => safety('report')} className="block w-full text-left px-4 py-3 text-[13.5px]" style={{ color: C.alabaster }}>Signaler</button>
                  <button onClick={() => safety('block')} className="block w-full text-left px-4 py-3 text-[13.5px]" style={{ color: C.ember, borderTop: `1px solid ${C.line}` }}>Bloquer</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-2.5">
            <div className="text-center text-[12px] mb-3" style={{ color: C.smoke2 }}>Vous vous êtes trouvés. Le visage s’est dévoilé. À vous d’écrire la suite.</div>
            {msgs.map((m) => (
              <div key={m.id} className="max-w-[78%] px-4 py-2.5 rounded-2xl text-[14.5px]" style={{
                alignSelf: m.fromMe ? 'flex-end' : 'flex-start',
                background: m.fromMe ? `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})` : C.card,
                color: m.fromMe ? '#F7EEE9' : C.alabaster,
                border: m.fromMe ? 'none' : `1px solid ${C.line}`,
              }}>{m.body}</div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 py-4 border-t" style={{ borderColor: C.line }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message…"
              className="flex-1 px-4 py-3 rounded-full text-[15px] outline-none border" style={{ ...sans, background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }} />
            <button type="submit" className="px-5 rounded-full text-[13px] tracking-[0.08em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Envoyer</button>
          </form>
        </div>
      </main>
    )
  }

  // Liste des matchs
  return (
    <main className={shell} style={bg}>
      <MeetNav active="messages" />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
        <h1 className="mb-8" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,5.5vw,3rem)' }}>Vos connexions</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20" style={{ color: C.smoke }}>
            <p className="text-[16px]" style={{ ...serif }}>Pas encore de rencontre.</p>
            <p className="text-[14px] mt-2" style={{ color: C.smoke2 }}>Quand un intérêt devient réciproque, la personne apparaît ici.</p>
            <Link href="/sos-meet/decouverte" className="inline-block mt-6 px-7 py-3 rounded-full text-[13px] tracking-[0.1em] uppercase" style={{ border: `1px solid ${C.line}`, color: C.alabaster }}>Découvrir</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {matches.map((m) => (
              <button key={m.matchId} onClick={() => { setMsgs([]); setActive(m) }} className="flex items-center gap-4 p-3.5 rounded-2xl text-left transition-colors" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ background: C.velvet }}>
                  {m.other.photoUrl && <img src={m.other.photoUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ ...serif, fontSize: 17 }}>{m.other.firstName}{m.other.age ? `, ${m.other.age}` : ''}</div>
                  <div className="text-[13px] truncate" style={{ color: C.smoke }}>
                    {m.lastMessage ? (m.lastMessage.fromMe ? 'Vous : ' : '') + m.lastMessage.body : 'Vous vous êtes trouvés, écrivez le premier mot.'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
