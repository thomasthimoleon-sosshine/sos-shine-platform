'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

type Couple = {
  id: string; status: string; side: 'a' | 'b' | null
  inviteCode: string | null; inviteExpired: boolean; partnerJoined: boolean
  total: number
  me: { answered: number; sealed: boolean }
  partner: { answered: number; sealed: boolean }
}

const cta: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9',
  boxShadow: '0 14px 34px -14px rgba(155,27,46,0.6)',
}
const ghost: React.CSSProperties = { border: `1px solid ${C.line}`, color: C.alabaster }

export default function DuoClient({ initialCode }: { initialCode: string }) {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'ready'>('loading')
  const [couple, setCouple] = useState<Couple | null>(null)
  const [code, setCode] = useState(initialCode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/sosmeet/couple/duo')
      if (r.status === 401) { setPhase('auth'); return }
      const d = await r.json()
      setCouple(d.couple)
      setPhase('ready')
    } catch { setPhase('auth') }
  }, [])

  useEffect(() => { load() }, [load])

  // Tant que le/la partenaire n'a pas rejoint ou scellé, on rafraîchit doucement.
  useEffect(() => {
    if (phase !== 'ready' || !couple) return
    if (couple.partnerJoined && couple.partner.sealed) return
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [phase, couple, load])

  async function create() {
    setBusy(true); setError(null)
    try {
      const r = await fetch('/api/sosmeet/couple/duo', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Création impossible.'); return }
      await load()
    } catch { setError('Connexion impossible.') } finally { setBusy(false) }
  }

  async function join(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const r = await fetch('/api/sosmeet/couple/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Impossible de rejoindre.'); return }
      await load()
    } catch { setError('Connexion impossible.') } finally { setBusy(false) }
  }

  async function copyLink(link: string) {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2200) }
    catch { setError('Copie impossible. Sélectionne le lien à la main.') }
  }

  const shell = 'min-h-screen relative'
  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const halo = <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.14), transparent 55%)' }} />

  if (phase === 'loading') return (
    <main className={shell} style={bg}>
      <div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div>
    </main>
  )

  if (phase === 'auth') return (
    <main className={shell} style={bg}>{halo}
      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,6vw,2.4rem)' }}>Connecte-toi d’abord</h1>
        <p className="mt-3 mb-8 text-[15px] leading-relaxed" style={{ color: C.smoke }}>
          Votre duo est rattaché à vos comptes. Chacun le sien : c’est ce qui garantit que personne ne lit les réponses de l’autre.
        </p>
        <div className="w-full flex flex-col gap-3">
          <a href="/login?next=/sos-meet/couple/duo" className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase text-center" style={cta}>Me connecter</a>
          <a href="/signup?next=/sos-meet/couple/duo" className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase text-center" style={ghost}>Créer mon compte</a>
        </div>
      </div>
    </main>
  )

  // ── Aucun duo : créer ou rejoindre ──────────────────────────────────────
  if (!couple) return (
    <main className={shell} style={bg}>{halo}
      <div className="relative max-w-lg mx-auto px-6 py-24">
        <Link href="/sos-meet/couple" className="text-[12px] tracking-[0.08em] uppercase" style={{ color: C.smoke2 }}>← Se retrouver</Link>
        <h1 className="mt-6 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6.4vw,2.8rem)', lineHeight: 1.1 }}>Votre duo</h1>
        <p className="text-[15.5px] leading-relaxed mb-10" style={{ color: C.smoke }}>
          L’un de vous ouvre le duo et transmet un lien. L’autre le rejoint. Ensuite, chacun répond de son côté.
        </p>

        <div className="rounded-2xl p-7 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: C.smoke2 }}>Je commence</span>
          <h2 className="mt-2 mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.4rem' }}>Ouvrir notre duo</h2>
          <p className="text-[14.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>Tu recevras un lien à lui transmettre. Il reste valable sept jours.</p>
          <button onClick={create} disabled={busy} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase disabled:opacity-50" style={cta}>
            {busy ? 'Un instant…' : 'Ouvrir notre duo'}
          </button>
        </div>

        <div className="rounded-2xl p-7" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: C.smoke2 }}>J’ai reçu un lien</span>
          <h2 className="mt-2 mb-4" style={{ ...serif, fontWeight: 400, fontSize: '1.4rem' }}>Rejoindre</h2>
          <form onSubmit={join} className="flex flex-col gap-3">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Le code reçu" autoComplete="off"
              className="w-full px-4 py-3.5 rounded-xl text-[17px] outline-none border tracking-[0.24em] text-center uppercase"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }} />
            <button type="submit" disabled={busy || !code} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase disabled:opacity-40" style={ghost}>
              Rejoindre notre duo
            </button>
          </form>
        </div>

        {error && <p className="mt-5 text-[13.5px]" style={{ color: C.ember }}>{error}</p>}
      </div>
    </main>
  )

  // ── Duo existant : l'état d'avancement ──────────────────────────────────
  const link = couple.inviteCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sos-meet/couple/duo?code=${couple.inviteCode}`
    : null
  const suspendu = couple.status === 'SUSPENDU_VIGILANCE'

  return (
    <main className={shell} style={bg}>{halo}
      <div className="relative max-w-lg mx-auto px-6 py-24">
        <Link href="/sos-meet/couple" className="text-[12px] tracking-[0.08em] uppercase" style={{ color: C.smoke2 }}>← Se retrouver</Link>
        <h1 className="mt-6 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6.4vw,2.8rem)', lineHeight: 1.1 }}>Votre duo</h1>

        {/* En attente du/de la partenaire */}
        {!couple.partnerJoined && (
          <div className="rounded-2xl p-7 mb-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            {couple.inviteExpired ? (
              <>
                <h2 className="mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>Le lien a expiré</h2>
                <p className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
                  Personne ne l’a utilisé en sept jours. Dissous ce duo et rouvre-en un pour obtenir un lien neuf.
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>Transmets ce lien</h2>
                <p className="text-[14.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>
                  Envoie-le à ton/ta partenaire. Il reste valable sept jours, et ne sert qu’une fois.
                </p>
                <div className="rounded-xl px-4 py-4 mb-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}` }}>
                  <span style={{ ...serif, fontSize: '1.7rem', letterSpacing: '0.22em', color: C.alabaster }}>{couple.inviteCode}</span>
                </div>
                {link && (
                  <button onClick={() => copyLink(link)} className="w-full py-3.5 rounded-full text-[13px] tracking-[0.12em] uppercase" style={ghost}>
                    {copied ? 'Lien copié' : 'Copier le lien'}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Avancement des deux côtés, sans jamais montrer une réponse */}
        {couple.partnerJoined && (
          <div className="rounded-2xl p-7 mb-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <h2 className="mb-5" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>Où vous en êtes</h2>
            <Avancement titre="Toi" answered={couple.me.answered} total={couple.total} sealed={couple.me.sealed} />
            <div className="h-4" />
            <Avancement titre="Ton/ta partenaire" answered={couple.partner.answered} total={couple.total} sealed={couple.partner.sealed} />
            <p className="mt-6 text-[13px] leading-relaxed" style={{ color: C.smoke2 }}>
              Tu vois son avancement, jamais ses réponses. C’est la règle, dans les deux sens.
            </p>
          </div>
        )}

        {suspendu ? (
          <div className="rounded-2xl p-7" style={{ background: 'rgba(155,27,46,0.10)', border: `1px solid ${C.garnet}` }}>
            <h2 className="mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.3rem' }}>On met votre parcours en pause</h2>
            <p className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
              Certaines de tes réponses demandent autre chose qu’un exercice de couple. Une personne de l’équipe va te contacter.
              Si tu es en danger immédiat, appelle le 17. Le 3919 est joignable, gratuitement et anonymement, pour en parler.
            </p>
          </div>
        ) : couple.me.sealed ? (
          couple.partner.sealed ? (
            <div className="rounded-2xl p-7 text-center" style={{ background: 'rgba(155,27,46,0.10)', border: `1px solid ${C.garnet}` }}>
              <div style={{ ...serif, fontSize: 40, color: C.garnet }}>♥</div>
              <h2 className="mt-1 mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.45rem' }}>Votre lecture est prête</h2>
              <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: C.smoke }}>
                Vous avez répondu tous les deux. Voici ce que vos réponses disent de votre lien.
              </p>
              <Link href="/sos-meet/couple/carte" className="inline-block px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>
                Lire notre carte →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl p-7" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <h2 className="mb-2" style={{ ...serif, fontWeight: 400, fontSize: '1.3rem' }}>Tu as terminé</h2>
              <p className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
                On attend maintenant ses réponses. Tu peux fermer cette page, la carte apparaîtra ici dès que vous
                aurez répondu tous les deux.
              </p>
            </div>
          )
        ) : couple.partnerJoined ? (
          <Link href="/sos-meet/couple/questionnaire" className="block w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase text-center" style={cta}>
            {couple.me.answered > 0 ? 'Reprendre mon questionnaire →' : 'Commencer mon questionnaire →'}
          </Link>
        ) : null}

        {couple.partnerJoined && <Naissance />}

        {error && <p className="mt-5 text-[13.5px]" style={{ color: C.ember }}>{error}</p>}
      </div>
    </main>
  )
}

/**
 * Date de naissance, pour la lecture énergétique. Entièrement facultative :
 * sans elle, le couple a quand même sa carte, sans la couche complémentarité.
 */
function Naissance() {
  const [ouvert, setOuvert] = useState(false)
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [lieu, setLieu] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sosmeet/couple/birth').then(r => r.json()).then(d => {
      if (d.naissance?.birth_date) {
        setDate(d.naissance.birth_date); setHeure(d.naissance.birth_time?.slice(0, 5) || '')
        setLieu(d.naissance.birth_place || ''); setOk(true)
      }
    }).catch(() => {})
  }, [])

  async function envoyer(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/sosmeet/couple/birth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, heure: heure || undefined, lieu: lieu || undefined, consent: true }),
      })
      const d = await r.json()
      if (!r.ok) { setErr(d.error || 'Enregistrement impossible.'); return }
      setOk(true); setOuvert(false)
    } catch { setErr('Connexion impossible.') } finally { setBusy(false) }
  }

  const champ = 'w-full px-4 py-3 rounded-xl text-[16px] outline-none border'
  const styleChamp = { background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster } as React.CSSProperties

  return (
    <div className="mt-5 rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 style={{ ...serif, fontWeight: 400, fontSize: '1.2rem' }}>Lecture énergétique</h3>
        <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: ok ? C.ember : C.smoke2 }}>
          {ok ? 'Enregistrée' : 'Facultatif'}
        </span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.smoke }}>
        Ta date de naissance permet d’ajouter à votre carte une lecture de vos complémentarités.
        Sans elle, vous aurez quand même votre carte.
      </p>

      {!ouvert ? (
        <button onClick={() => setOuvert(true)} className="mt-4 text-[13px] tracking-[0.08em] uppercase" style={{ color: C.ember }}>
          {ok ? 'Modifier ma date' : 'Ajouter ma date de naissance →'}
        </button>
      ) : (
        <form onSubmit={envoyer} className="mt-5 flex flex-col gap-3">
          <label className="text-[13px]" style={{ color: C.smoke }}>Date de naissance
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={champ + ' mt-1.5'} style={styleChamp} />
          </label>
          <label className="text-[13px]" style={{ color: C.smoke }}>Heure, si tu la connais
            <input type="time" value={heure} onChange={e => setHeure(e.target.value)} className={champ + ' mt-1.5'} style={styleChamp} />
          </label>
          <label className="text-[13px]" style={{ color: C.smoke }}>Ville de naissance
            <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Toulouse" className={champ + ' mt-1.5'} style={styleChamp} />
          </label>
          <p className="text-[12px] leading-relaxed" style={{ color: C.smoke2 }}>
            En validant, tu acceptes que cette donnée serve uniquement à la lecture énergétique de votre carte.
            Ton/ta partenaire ne la verra pas.
          </p>
          {err && <p className="text-[13px]" style={{ color: C.ember }}>{err}</p>}
          <button type="submit" disabled={busy || !date} className="w-full py-3.5 rounded-full text-[13.5px] tracking-[0.12em] uppercase disabled:opacity-40" style={cta}>
            {busy ? 'Un instant…' : 'Valider'}
          </button>
        </form>
      )}
    </div>
  )
}

function Avancement({ titre, answered, total, sealed }: { titre: string; answered: number; total: number; sealed: boolean }) {
  const pct = sealed ? 100 : Math.min(100, Math.round((answered / Math.max(1, total)) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14.5px]" style={{ color: C.alabaster }}>{titre}</span>
        <span className="text-[12.5px]" style={{ color: sealed ? C.ember : C.smoke2 }}>
          {sealed ? 'Terminé' : answered > 0 ? `${pct}%` : 'Pas commencé'}
        </span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(242,235,228,0.07)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${C.garnet}, ${C.ember})`, transition: 'width .4s' }} />
      </div>
    </div>
  )
}
