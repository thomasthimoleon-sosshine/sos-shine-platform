'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Charte SOS Meet
const C = {
  ink: '#0A090B', velvet: '#120E11', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: "var(--sm-serif), Georgia, serif" }
const sans = { fontFamily: "var(--sm-sans), system-ui, sans-serif" }

const GENDERS = [
  { v: 'femme', l: 'Femme' }, { v: 'homme', l: 'Homme' },
  { v: 'non-binaire', l: 'Non-binaire' }, { v: 'autre', l: 'Autre' },
]
const SEEKING = [
  { v: 'femmes', l: 'Des femmes' }, { v: 'hommes', l: 'Des hommes' }, { v: 'tout', l: 'Tout le monde' },
]

export default function ProfilClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState('')
  const [seeking, setSeeking] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [headline, setHeadline] = useState('')
  const [ageOk, setAgeOk] = useState(false)
  const [sensitive, setSensitive] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sosmeet/me')
      .then(async (r) => {
        if (r.status === 401) { setAuthed(false); setLoading(false); return }
        const d = await r.json()
        setAuthed(true)
        const p = d.profile
        if (p) {
          setFirstName(p.first_name || ''); setBirthdate(p.birthdate || ''); setGender(p.gender || '')
          setSeeking(Array.isArray(p.seeking) ? p.seeking : []); setCity(p.city || ''); setHeadline(p.headline || '')
          setAgeOk(!!p.age_confirmed); setSensitive(!!p.sensitive_consent)
        }
        setLoading(false)
      })
      .catch(() => { setAuthed(false); setLoading(false) })
  }, [])

  function toggleSeeking(v: string) {
    setSeeking((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!ageOk) { setError('Confirme que tu es majeur·e.'); return }
    if (!sensitive) { setError('Le consentement est nécessaire (le profil touche des sujets intimes).'); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/sosmeet/me', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, birthdate, gender, seeking, city, headline, ageConfirmed: ageOk, sensitiveConsent: sensitive }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok) { router.push('/sos-meet/questionnaire'); return }
      setError(d.error || 'Une erreur est survenue.')
      setStatus('idle')
    } catch { setError('Connexion impossible.'); setStatus('idle') }
  }

  const wrap = 'min-h-screen'
  const inputCls = 'w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border'
  const inputStyle: React.CSSProperties = { ...sans, background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }

  if (loading) {
    return <main className={wrap} style={{ ...sans, background: C.ink, color: C.smoke }}>
      <div className="flex items-center justify-center min-h-screen text-[14px]">Un instant…</div>
    </main>
  }

  // ── Gate : pas connecté ──
  if (!authed) {
    return (
      <main className={wrap} style={{ ...sans, background: C.ink, color: C.alabaster }}>
        <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
          <span className="text-[11px] tracking-[0.4em] uppercase" style={{ color: C.ember }}>Créer mon profil</span>
          <h1 className="mt-4 mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,7vw,3rem)', lineHeight: 1.05 }}>
            Un compte, d’abord
          </h1>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: C.smoke }}>
            Ton profil SOS Meet est rattaché à ton compte SOS Shine — c’est ce qui garde tout sûr et sincère. Connecte-toi, ou crée ton compte en une minute.
          </p>
          <div className="w-full flex flex-col gap-3">
            <a href="/login?next=/sos-meet/profil" className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase"
              style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Me connecter</a>
            <a href="/signup?next=/sos-meet/profil" className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase"
              style={{ border: `1px solid ${C.line}`, color: C.alabaster }}>Créer mon compte</a>
          </div>
        </div>
      </main>
    )
  }

  // ── Formulaire « Mes infos » ──
  return (
    <main className={wrap} style={{ ...sans, background: C.ink, color: C.alabaster }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.16), transparent 55%)' }} />
      <div className="relative max-w-lg mx-auto px-6 py-16">
        <span className="text-[11px] tracking-[0.4em] uppercase" style={{ color: C.ember }}>Étape 1 · Mes infos</span>
        <h1 className="mt-4 mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6vw,3rem)', lineHeight: 1.03 }}>
          Faisons connaissance
        </h1>
        <p className="text-[15px] leading-relaxed mb-9" style={{ color: C.smoke }}>
          L’essentiel pour commencer. Juste après, le questionnaire de compatibilité — c’est lui qui débloque tes premières rencontres.
        </p>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="fn" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Prénom</label>
            <input id="fn" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ton prénom" className={inputCls} style={inputStyle} />
          </div>

          <div>
            <label htmlFor="bd" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Date de naissance</label>
            <input id="bd" type="date" required value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={inputCls} style={inputStyle} />
          </div>

          <div>
            <span className="block text-[13px] mb-2.5" style={{ color: C.smoke }}>Je suis…</span>
            <div className="flex flex-wrap gap-2.5">
              {GENDERS.map((g) => (
                <button type="button" key={g.v} onClick={() => setGender(g.v)}
                  className="px-4 py-2.5 rounded-full text-[14px] transition-colors"
                  style={{ border: `1px solid ${gender === g.v ? C.garnet : C.line}`, background: gender === g.v ? 'rgba(155,27,46,0.18)' : 'transparent', color: gender === g.v ? C.alabaster : C.smoke }}>
                  {g.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[13px] mb-2.5" style={{ color: C.smoke }}>Je cherche…</span>
            <div className="flex flex-wrap gap-2.5">
              {SEEKING.map((s) => (
                <button type="button" key={s.v} onClick={() => toggleSeeking(s.v)}
                  className="px-4 py-2.5 rounded-full text-[14px] transition-colors"
                  style={{ border: `1px solid ${seeking.includes(s.v) ? C.garnet : C.line}`, background: seeking.includes(s.v) ? 'rgba(155,27,46,0.18)' : 'transparent', color: seeking.includes(s.v) ? C.alabaster : C.smoke }}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Ville <span style={{ color: C.smoke2 }}>(optionnel)</span></label>
            <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Où vis-tu ?" className={inputCls} style={inputStyle} />
          </div>

          <div>
            <label htmlFor="hl" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Une phrase pour te présenter <span style={{ color: C.smoke2 }}>(optionnel)</span></label>
            <input id="hl" value={headline} maxLength={160} onChange={(e) => setHeadline(e.target.value)} placeholder="Ce qui te définit en une phrase…" className={inputCls} style={inputStyle} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: C.garnet }} />
            <span className="text-[13px] leading-relaxed" style={{ color: C.smoke }}>Je certifie être majeur·e (18 ans ou plus).</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: C.garnet }} />
            <span className="text-[13px] leading-relaxed" style={{ color: C.smoke }}>
              J’accepte que mon profil aborde des sujets intimes (attachement, sexualité, valeurs) pour améliorer la justesse des rencontres. Données hébergées en Europe, effaçables à tout moment.
            </span>
          </label>

          {error && <p className="text-[13px]" style={{ color: C.ember }}>{error}</p>}

          <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9', boxShadow: '0 14px 34px -14px rgba(155,27,46,0.6)' }}>
            {status === 'loading' ? 'Un instant…' : 'Continuer vers le questionnaire →'}
          </button>
        </form>
      </div>
    </main>
  )
}
