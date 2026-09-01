'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, scoreTest, type Letter } from '@/lib/test5q/data'

const CSS = `
.t5{min-height:100dvh;background:radial-gradient(760px 460px at 72% 4%,rgba(201,169,97,.07),transparent 60%),#0B0906;color:#F5EFE3;font-family:'Jost',system-ui,-apple-system,'Segoe UI',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased}
.t5 .bar{border-bottom:1px solid rgba(201,169,97,.12)}
.t5 .bar .in{max-width:640px;margin:0 auto;padding:22px 24px;display:flex;align-items:center;justify-content:space-between}
.t5 .brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-weight:600;letter-spacing:.18em;color:#F5EFE3}
.t5 .brand small{display:block;font-family:inherit;font-size:9.5px;font-weight:500;letter-spacing:.4em;color:#8C8271;margin-top:5px}
.t5 .step-tag{font-size:12px;letter-spacing:.12em;color:#8C8271}
.t5 .wrap{max-width:640px;margin:0 auto;padding:40px 24px 80px}
.t5 .prog{height:4px;border-radius:99px;background:rgba(245,239,227,.07);overflow:hidden;margin-bottom:44px}
.t5 .prog i{display:block;height:100%;background:linear-gradient(90deg,#C9A961,#E4C888);transition:width .45s ease}
.t5 h2{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(1.7rem,4.5vw,2.4rem);line-height:1.2;margin-bottom:30px;text-wrap:balance}
.t5 .choices{display:flex;flex-direction:column;gap:11px}
.t5 button.choice{width:100%;text-align:left;padding:18px 20px;border-radius:16px;font-family:inherit;font-size:16px;font-weight:300;line-height:1.45;color:#F5EFE3;background:rgba(245,239,227,.035);border:1.5px solid rgba(245,239,227,.08);cursor:pointer;transition:background .15s,border-color .15s,transform .1s}
.t5 button.choice:hover{background:rgba(201,169,97,.10);border-color:rgba(201,169,97,.4)}
.t5 button.choice.sel{background:rgba(201,169,97,.16);border-color:rgba(201,169,97,.6)}
.t5 button.choice:active{transform:scale(.995)}
.t5 .cap label{display:block;font-size:13px;letter-spacing:.04em;color:#C9BEA6;margin:18px 0 8px}
.t5 .cap input[type=text],.t5 .cap input[type=email]{width:100%;padding:15px 17px;border-radius:14px;background:rgba(245,239,227,.04);border:1.5px solid rgba(245,239,227,.1);color:#F5EFE3;font-family:inherit;font-size:16px;outline:none}
.t5 .cap input:focus{border-color:rgba(201,169,97,.6)}
.t5 .cap .rgpd{display:flex;gap:11px;align-items:flex-start;margin-top:22px;font-size:13.5px;color:#C9BEA6;line-height:1.5}
.t5 .cap .rgpd input{margin-top:3px;accent-color:#C9A961;width:17px;height:17px;flex:none}
.t5 .cta{margin-top:28px;width:100%;padding:19px;border-radius:100px;border:none;cursor:pointer;font-family:inherit;font-weight:500;font-size:16.5px;color:#0A0806;background:#C9A961;transition:transform .12s,box-shadow .2s,opacity .2s;box-shadow:0 12px 32px -12px rgba(201,169,97,.6)}
.t5 .cta:hover:not(:disabled){transform:translateY(-1px);background:#E4C888}
.t5 .cta:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.t5 .micro{margin-top:16px;font-size:12.5px;color:#8C8271;text-align:center}
.t5 .lead{color:#C9BEA6;font-size:15px;margin-bottom:26px;line-height:1.55}
`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Test5QClient() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0..4 = questions ; 5 = capture
  const [answers, setAnswers] = useState<Letter[]>([])
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [rgpd, setRgpd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const total = QUESTIONS.length
  const pct = Math.round((Math.min(step, total) / total) * 100)

  function choose(qIndex: number, letter: Letter) {
    const next = [...answers]
    next[qIndex] = letter
    setAnswers(next)
    // avance automatique, une question par écran
    window.setTimeout(() => setStep(qIndex + 1), 240)
  }

  const canSubmit = useMemo(
    () => prenom.trim().length > 0 && EMAIL_RE.test(email.trim()) && rgpd && !submitting,
    [prenom, email, rgpd, submitting],
  )

  async function submit() {
    if (!canSubmit) return
    setSubmitting(true)
    const slug = scoreTest(answers)
    try {
      await fetch('/api/quiz-v2/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: prenom.trim(),
          accepteSuite: true,
          sessionId: null,
          responseId: null,
        }),
      })
    } catch {
      /* la capture ne doit jamais bloquer l'accès au résultat */
    }
    const q = new URLSearchParams({ prenom: prenom.trim() }).toString()
    router.push(`/resultat/${slug}?${q}`)
  }

  return (
    <div className="t5">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bar">
        <div className="in">
          <span className="brand">SOS SHINE<small>Signature</small></span>
          <span className="step-tag">{step < total ? `Question ${step + 1} / ${total}` : 'Presque là'}</span>
        </div>
      </div>

      <div className="wrap">
        <div className="prog"><i style={{ width: `${pct}%` }} /></div>

        {step < total ? (
          <div key={step}>
            <h2>{QUESTIONS[step].prompt}</h2>
            <div className="choices">
              {QUESTIONS[step].choices.map((c) => (
                <button
                  key={c.letter}
                  className={`choice${answers[step] === c.letter ? ' sel' : ''}`}
                  onClick={() => choose(step, c.letter)}
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="cap">
            <h2>Où veux-tu recevoir ta signature ?</h2>
            <p className="lead">On te la montre tout de suite — et on te l’envoie aussi par e-mail, pour la garder.</p>

            <label htmlFor="prenom">Ton prénom</label>
            <input id="prenom" type="text" value={prenom} autoComplete="given-name"
              onChange={(e) => setPrenom(e.target.value)} placeholder="Camille" />

            <label htmlFor="email">Ton e-mail</label>
            <input id="email" type="email" value={email} autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} placeholder="camille@exemple.com" />

            <label className="rgpd">
              <input type="checkbox" checked={rgpd} onChange={(e) => setRgpd(e.target.checked)} />
              <span>J’accepte de recevoir ma signature et les e-mails de suivi. Désinscription en 1 clic.</span>
            </label>

            <button className="cta" disabled={!canSubmit} onClick={submit}>
              {submitting ? 'Un instant…' : 'Voir ma signature →'}
            </button>
            <p className="micro">Gratuit · sans carte bancaire · tes réponses restent confidentielles</p>
          </div>
        )}
      </div>
    </div>
  )
}
