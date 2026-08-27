'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

const ETAPES = [
  { n: '01', t: 'Chacun répond', b: 'Vous remplissez, séparément, un profil profond et honnête. Sans se relire, sans s’arranger.' },
  { n: '02', t: 'On lit votre lien', b: 'Nous croisons vos deux mondes : ce qui vous unit, ce qui s’est tendu, les malentendus qui s’étaient installés.' },
  { n: '03', t: 'Vous vous retrouvez', b: 'Une carte de votre relation et des rituels de re-rencontre, pour raviver ce qui existe encore, pour de vrai.' },
]

export default function CoupleClient() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'already'>('idle')
  const [error, setError] = useState<string | null>(null)
  const hpRef = useRef<HTMLInputElement>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setStatus('loading')
    try {
      const res = await fetch('/api/sosmeet/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, stage: 'En couple, on veut se retrouver', consent: true, hp: hpRef.current?.value || '' }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok && d.message === 'already_registered') { setStatus('already'); return }
      if (res.ok) { setStatus('done'); return }
      setError(d.error || 'Une erreur est survenue.'); setStatus('idle')
    } catch { setError('Connexion impossible.'); setStatus('idle') }
  }

  const done = status === 'done' || status === 'already'
  const inputCls = 'w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border'
  const inputStyle: React.CSSProperties = { ...sans, background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }

  return (
    <main style={{ ...sans, background: C.ink, color: C.alabaster }} className="min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/sosmeet/couple.png" alt="" className="w-full h-full object-cover object-center opacity-60" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 50% 40%, transparent, rgba(10,9,11,0.72) 78%), linear-gradient(180deg, rgba(10,9,11,0.5), rgba(10,9,11,0.2) 30%, rgba(10,9,11,0.9))' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 min-h-[86vh] flex flex-col items-center justify-center text-center">
          <Link href="/sos-meet" className="absolute top-6 left-5 sm:left-8 text-[12px] tracking-[0.12em] uppercase" style={{ color: C.smoke }}>← SOS Meet</Link>
          <span className="text-[11px] tracking-[0.42em] uppercase" style={{ color: C.ember }}>À deux</span>
          <h1 className="mt-4 mb-5" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2.6rem,8vw,5rem)', lineHeight: 1 }}>
            Se <em style={{ color: C.garnet, fontStyle: 'italic' }}>retrouver</em>.
          </h1>
          <p className="mx-auto max-w-lg text-[17px] leading-relaxed" style={{ color: C.smoke, fontWeight: 300 }}>
            Vous vous êtes aimés. Quelque chose s’est endormi. Avant de tout défaire, et si vous vous re-rencontriez vraiment ?
          </p>
          <Link href="/sos-meet/couple/duo" className="inline-flex items-center gap-2 mt-9 text-[14px] tracking-[0.14em] uppercase px-9 py-4 rounded-full transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9', boxShadow: '0 14px 44px -12px rgba(155,27,46,0.6)' }}>
            Ouvrir notre duo <span aria-hidden>→</span>
          </Link>
          <span className="block mt-4 text-[12.5px]" style={{ color: C.smoke2 }}>Gratuit. Une vingtaine de minutes chacun, séparément.</span>
          <Link href="/sos-meet/couple/apercu" className="block mt-3 text-[13px] tracking-[0.06em]" style={{ color: C.ember }}>
            Voir un exemple de lecture
          </Link>
        </div>
      </section>

      {/* COMMENT */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[11px] tracking-[0.34em] uppercase mb-3" style={{ color: C.smoke2 }}>Comment ça se passe</p>
          <h2 style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,5vw,3rem)' }}>Trois temps pour se re-rencontrer</h2>
        </div>
        <div className="grid sm:grid-cols-3" style={{ gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 6, overflow: 'hidden' }}>
          {ETAPES.map((s) => (
            <div key={s.n} className="h-full p-10" style={{ background: '#120E11' }}>
              <div style={{ ...serif, fontStyle: 'italic', fontSize: 34, color: C.garnet }}>{s.n}</div>
              <h3 className="mt-4 mb-2.5 text-[22px]" style={{ ...serif, fontWeight: 500 }}>{s.t}</h3>
              <p className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REJOINDRE */}
      <section id="rejoindre" className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-24 scroll-mt-8">
        <div className="rounded-3xl p-7 sm:p-10" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: '0 50px 100px -60px rgba(155,27,46,0.5)' }}>
          {!done ? (
            <>
              <h2 className="text-center mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.7rem,4.4vw,2.3rem)' }}>Commencer, à deux</h2>
              <p className="text-center text-[15px] leading-relaxed mb-7" style={{ color: C.smoke }}>
                L’un de vous ouvre le duo et transmet un lien. L’autre le rejoint. Ensuite chacun répond
                de son côté, sans se relire. Votre lecture est préparée par l’équipe, nous vous écrivons
                dès qu’elle est prête.
              </p>
              <Link href="/sos-meet/couple/duo" className="block w-full text-center py-4 rounded-full text-[14px] tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
                Ouvrir notre duo →
              </Link>
              <Link href="/sos-meet/couple/duo" className="block w-full text-center mt-3 py-3.5 rounded-full text-[13.5px] tracking-[0.1em] uppercase"
                style={{ border: `1px solid ${C.line}`, color: C.alabaster }}>
                J’ai reçu un lien
              </Link>

              <div className="my-9 flex items-center gap-4" aria-hidden>
                <span className="flex-1 h-px" style={{ background: C.line }} />
                <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: C.smoke2 }}>ou</span>
                <span className="flex-1 h-px" style={{ background: C.line }} />
              </div>

              <h3 className="text-center mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.3rem' }}>Pas encore le moment</h3>
              <p className="text-center text-[14.5px] leading-relaxed mb-7" style={{ color: C.smoke }}>
                Laissez-nous un e-mail. On vous écrira quand vous serez prêts, sans insister.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                <div>
                  <label htmlFor="cf" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Prénom</label>
                  <input id="cf" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="ce" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>E-mail</label>
                  <input id="ce" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" className={inputCls} style={inputStyle} />
                </div>
                {error && <p className="text-[13px]" style={{ color: C.ember }}>{error}</p>}
                <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
                  {status === 'loading' ? 'Un instant…' : 'Me prévenir'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div style={{ ...serif, fontSize: 44, color: C.garnet }}>♥</div>
              <h2 className="mt-2 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.6rem,4.2vw,2.1rem)' }}>
                {status === 'already' ? 'Vous êtes déjà des nôtres' : 'C’est noté.'}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: C.smoke }}>
                On vous écrit bientôt. Le parcours à deux vous attend quand vous le voudrez.
              </p>
              <Link href="/sos-meet/couple/duo" className="inline-block mt-6 text-[13px] tracking-[0.08em] uppercase" style={{ color: C.ember }}>Ouvrir notre duo maintenant →</Link>
            </div>
          )}
        </div>
        <p className="text-center mt-6 text-[12.5px]" style={{ color: C.smoke2 }}>Se retrouver coûte bien moins qu’une rupture.</p>
      </section>
    </main>
  )
}
