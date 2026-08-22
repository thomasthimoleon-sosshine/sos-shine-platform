'use client'

// ══════════════════════════════════════════════════════════════
// SOS Shine — Bilan Émotionnel (expérience officielle)
// Accueil → crédibilité → 15 questions (+ observations) → analyse →
// mini-bilan → CAPTURE EMAIL → archétype réel dévoilé section par
// section → protocole recommandé disponible + %.
// Branché au back-office existant (save / track / email-capture /
// complete) : la capture email alimente la séquence des 16 mails.
// Résultat = archétype réel du test Signature (même moteur).
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { QUESTIONS, type AllResponses } from '@/lib/quiz-v2'
import { processQuizResults, calculateMatchScores } from '@/lib/quiz-v2/scoring'
import { createClient } from '@/lib/supabase/client'
import { getArchetype, BLESSURE_COLORS, type Archetype } from '@/lib/quiz-v2/archetypes.legacy'

// ── Back-office (mêmes endpoints que le test Signature) ──
function generateSessionId() {
  return `qv2_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
async function trackEvent(sessionId: string, responseId: string | null, eventType: string, eventData?: Record<string, unknown>) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, quizResponseId: responseId, eventType, eventData }),
    })
  } catch { /* non-critical */ }
}
async function saveResponse(sessionId: string, responseId: string | null, data: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch('/api/quiz-v2/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, responseId, ...data }),
    })
    const json = await res.json()
    return json.id || responseId
  } catch { return responseId }
}
function buildAllResponses(answers: Record<number, number[]>): AllResponses {
  const r: AllResponses = {}
  for (const [qid, idxs] of Object.entries(answers)) r[Number(qid)] = { choiceIndexes: idxs }
  return r
}

// ── Types de contenu ──
type Choice = { emoji: string; text: string }
type Question = { kind: 'question'; id: number; multiMax?: number; question: string; choices: Choice[] }
type ScreenStep = { kind: 'screen'; key: string; eyebrow?: string; title: string; body: string[]; cta: string }
type Step = Question | ScreenStep | { kind: 'calcul' } | { kind: 'mini' } | { kind: 'emailgate' } | { kind: 'profil' } | { kind: 'offre' }

const STEPS: Step[] = [
  { kind: 'screen', key: 'accueil', eyebrow: 'Bilan émotionnel', title: 'Nous allons analyser ton fonctionnement émotionnel.', body: [
    'Pas ta personnalité. Pas ton caractère. Ton fonctionnement.',
    'En moins de 5 minutes.',
    'Notre analyse identifie les mécanismes émotionnels qui influencent aujourd\'hui :',
    '✓ tes relations\n✓ ton niveau de stress\n✓ tes décisions\n✓ tes réactions automatiques',
    'Puis nous te montrerons précisément lesquels travaillent actuellement en arrière-plan.',
  ], cta: 'Commencer l\'analyse' },
  { kind: 'screen', key: 'credibilite', eyebrow: 'Avant de commencer', title: 'Comment fonctionne cette analyse', body: [
    'Cette analyse a été conçue à partir de centaines de situations d\'accompagnement.',
    'Elle ne cherche pas à te mettre dans une case. Elle cherche à comprendre les mécanismes qui influencent aujourd\'hui ta façon de fonctionner.',
    'Réponds spontanément. Il n\'existe aucune bonne réponse.',
  ], cta: 'Je suis prêt(e)' },

  { kind: 'question', id: 1, question: 'Quand tu souffres sans pouvoir le dire, qu\'est-ce que tu fais ?', choices: [
    { emoji: '🧠', text: 'J\'analyse - comprendre aide à tenir' },
    { emoji: '🎭', text: 'Je fais comme si tout allait bien' },
    { emoji: '🌊', text: 'Je m\'effondre - les émotions débordent' },
    { emoji: '🚪', text: 'Je m\'isole pour gérer seul(e)' },
    { emoji: '⚡', text: 'Je me jette dans l\'action' },
  ]},
  { kind: 'question', id: 2, question: 'Ce qui t\'épuise le plus en ce moment ?', choices: [
    { emoji: '⚡', text: 'Gérer les tensions et les conflits autour de moi' },
    { emoji: '👁', text: 'Toujours anticiper - être en alerte permanente' },
    { emoji: '🔄', text: 'Ne pas contrôler ce qui se passe autour de moi' },
    { emoji: '🏋️', text: 'Tout porter seul(e) sans pouvoir demander de l\'aide' },
    { emoji: '😶', text: 'Avoir l\'impression que rien ne changera jamais' },
  ]},
  { kind: 'question', id: 3, multiMax: 2, question: 'Comment tu te retrouves souvent dans tes relations ?', choices: [
    { emoji: '🚪', text: 'À fuir quand c\'est trop intense' },
    { emoji: '🙏', text: 'À éviter les conflits même si j\'ai raison' },
    { emoji: '🔍', text: 'À analyser les autres pour les comprendre vraiment' },
    { emoji: '🌪', text: 'À m\'occuper constamment pour ne pas penser' },
    { emoji: '💫', text: 'À ressentir les émotions des autres comme les miennes' },
    { emoji: '🔥', text: 'À réagir fort sur le moment, puis à regretter' },
    { emoji: '🌿', text: 'À m\'adapter au point de me perdre moi-même' },
  ]},
  { kind: 'screen', key: 'obs1', eyebrow: 'Analyse en cours', title: 'Première observation', body: [
    'Certaines de tes réponses montrent déjà que ton cerveau privilégie certains mécanismes de protection plutôt que d\'autres.',
    'C\'est normal. Nous allons maintenant essayer de comprendre pourquoi.',
  ], cta: 'Continuer l\'analyse' },
  { kind: 'question', id: 4, question: 'Tu es en conflit avec quelqu\'un. Comment tu gères ?', choices: [
    { emoji: '🕊', text: 'Je cède pour que ça s\'arrête' },
    { emoji: '🧩', text: 'Je cherche la solution logique qui arrange tout le monde' },
    { emoji: '💥', text: 'Je réagis fort sur le moment, puis je regrette' },
    { emoji: '💨', text: 'Je disparais - mentalement ou physiquement' },
    { emoji: '🫶', text: 'Je prends soin de l\'autre même si c\'est moi qui suis blessé(e)' },
  ]},
  { kind: 'question', id: 5, multiMax: 2, question: 'Qu\'est-ce qui déclenche ton stress ?', choices: [
    { emoji: '💔', text: 'Sentir que quelqu\'un est déçu de moi' },
    { emoji: '⚡', text: 'Les conflits et les tensions autour de moi' },
    { emoji: '❓', text: 'L\'incertitude - ne pas savoir ce qui va se passer' },
    { emoji: '🚫', text: 'Devoir dire non ou décevoir les autres' },
    { emoji: '🌀', text: 'Perdre le contrôle d\'une situation' },
    { emoji: '👁', text: 'Être jugé(e) ou critiqué(e)' },
  ]},
  { kind: 'screen', key: 'obs2', eyebrow: 'Analyse en cours', title: 'Ce que nous observons', body: [
    'Les réponses précédentes permettent déjà d\'identifier plusieurs tendances.',
    'Mais un mécanisme émotionnel n\'apparaît jamais seul. Nous allons maintenant chercher celui qui influence les autres.',
  ], cta: 'Poursuivre' },
  { kind: 'question', id: 6, question: 'Ce qui te pèse le plus ?', choices: [
    { emoji: '🫧', text: 'Me sentir seul(e) même quand je suis entouré(e)' },
    { emoji: '🔋', text: 'Ne jamais vraiment me détendre - toujours en tension' },
    { emoji: '🌑', text: 'Ne pas être à la hauteur de ce que je pourrais être' },
    { emoji: '⚖️', text: 'Ne jamais savoir si je fais les bons choix' },
    { emoji: '🌊', text: 'Devoir toujours m\'adapter aux attentes des autres' },
  ]},
  { kind: 'question', id: 7, question: 'Ce qui t\'empêche d\'avancer ?', choices: [
    { emoji: '🫀', text: 'La peur de mal faire - je préfère ne pas commencer' },
    { emoji: '🏔', text: 'La conviction que je dois y arriver seul(e)' },
    { emoji: '🌪', text: 'Je m\'épuise en action pour ne pas avoir à ressentir' },
    { emoji: '❄️', text: 'L\'intensité de ce que je ressens me paralyse' },
    { emoji: '👁', text: 'Une peur sous-jacente que je ne sais pas nommer' },
    { emoji: '🪞', text: 'Le regard et le jugement des autres' },
  ]},
  { kind: 'question', id: 8, question: 'Quand tout s\'effondre, tu…', choices: [
    { emoji: '🚪', text: 'Tu t\'isoles et tu gères seul(e)' },
    { emoji: '🔍', text: 'Tu analyses tout pour comprendre' },
    { emoji: '🌩', text: 'Tu imagines le pire - scénarios catastrophes' },
    { emoji: '⚙️', text: 'Tu reprends le contrôle - listes, action, organisation' },
    { emoji: '🌊', text: 'Tu lâches tout - les émotions te submergent' },
    { emoji: '🎭', text: 'Tu fais comme si rien n\'était - tu souris pour les autres' },
  ]},
  { kind: 'question', id: 9, question: 'Qu\'est-ce qui te fait te sentir vivant(e) ?', choices: [
    { emoji: '✨', text: 'Comprendre quelque chose en profondeur' },
    { emoji: '🌱', text: 'Être vraiment utile pour quelqu\'un' },
    { emoji: '🗺️', text: 'Avoir tout planifié et maîtrisé' },
    { emoji: '🌸', text: 'Être reconnu(e) et apprécié(e) pour ce que je fais' },
    { emoji: '🏆', text: 'Réussir quelque chose par mes propres moyens' },
    { emoji: '🔥', text: 'Les moments d\'intensité - être pleinement présent(e)' },
  ]},
  { kind: 'question', id: 10, question: 'Ce que tu évites le plus ?', choices: [
    { emoji: '🌀', text: 'Perdre le contrôle de toi-même ou d\'une situation' },
    { emoji: '💔', text: 'Décevoir les personnes que tu aimes' },
    { emoji: '🌫', text: 'Ne pas comprendre ce qui se passe vraiment' },
    { emoji: '🛡', text: 'Paraître faible ou dans le besoin' },
    { emoji: '⚡', text: 'Rester immobile - tu préfères l\'action même inutile' },
    { emoji: '🪞', text: 'Ne pas être à la hauteur de l\'image que les autres ont de toi' },
  ]},
  { kind: 'screen', key: 'obs3', eyebrow: 'Analyse en cours', title: 'À ce stade…', body: [
    'Nous avons déjà identifié plus de 70 % de ton fonctionnement émotionnel.',
    'Les dernières questions servent à comprendre comment ce mécanisme influence aujourd\'hui tes décisions, tes relations et ton rapport à toi-même.',
  ], cta: 'Terminer l\'analyse' },
  { kind: 'question', id: 11, question: 'Comment tu vis tes émotions ?', choices: [
    { emoji: '🔒', text: 'Je les garde pour moi - les exprimer me rend vulnérable' },
    { emoji: '🧠', text: 'J\'analyse avant de ressentir' },
    { emoji: '⚡', text: 'Je les transforme en énergie - je bouge, j\'agis' },
    { emoji: '🫶', text: 'Les émotions des autres passent avant les miennes' },
    { emoji: '🎯', text: 'Je les contrôle - montrer ses émotions c\'est perdre le contrôle' },
    { emoji: '🌋', text: 'Tout ou rien - jamais dans la nuance' },
  ]},
  { kind: 'question', id: 12, question: 'Ce que tu attends des autres ?', choices: [
    { emoji: '🛡', text: 'Qu\'ils respectent mon espace et mes limites' },
    { emoji: '🤲', text: 'Qu\'ils n\'attendent pas trop de moi' },
    { emoji: '🕊', text: 'Qu\'il n\'y ait pas de conflits ni de tensions' },
    { emoji: '🗝', text: 'Qu\'ils me laissent gérer à ma façon' },
    { emoji: '🌟', text: 'Qu\'ils me voient tel(le) que je suis vraiment' },
    { emoji: '🫶', text: 'Qu\'ils soient là dans les moments qui comptent' },
  ]},
  { kind: 'question', id: 13, question: 'Comment tu prends tes décisions ?', choices: [
    { emoji: '⏳', text: 'J\'attends d\'être sûr(e) - décider trop vite m\'angoisse' },
    { emoji: '⚡', text: 'Je décide vite et fort même si ça choque' },
    { emoji: '🌐', text: 'Je consulte tout le monde pour ne froisser personne' },
    { emoji: '🔭', text: 'J\'anticipe tous les risques avant de me lancer' },
    { emoji: '🔑', text: 'Je décide seul(e) - les avis me compliquent' },
    { emoji: '🔬', text: 'J\'analyse longtemps pour la solution parfaite' },
  ]},
  { kind: 'question', id: 14, question: 'Ce que tu gardes pour toi ?', choices: [
    { emoji: '🌙', text: 'Tes rêves les plus fous' },
    { emoji: '🌑', text: 'Tes peurs les plus profondes' },
    { emoji: '🗝', text: 'Tes vraies opinions - pour éviter les conflits' },
    { emoji: '💊', text: 'Tes blessures passées - tu préfères ne pas les rouvrir' },
    { emoji: '🌊', text: 'L\'intensité de ce que tu ressens' },
    { emoji: '🏋️', text: 'À quel point tu portes les autres' },
  ]},
  { kind: 'question', id: 15, question: 'Ce qui te ressemble le plus ?', choices: [
    { emoji: '🔍', text: 'Comprendre les choses en profondeur - la vérité avant tout' },
    { emoji: '🛡', text: 'Être toujours prêt(e) - anticiper pour ne jamais être pris(e) au dépourvu' },
    { emoji: '🌸', text: 'Prendre soin des autres - même en t\'oubliant' },
    { emoji: '⚙️', text: 'Maîtriser ta vie - chaque détail, chaque plan' },
    { emoji: '🌊', text: 'T\'adapter à tout et à tous' },
    { emoji: '⚡', text: 'Ressentir fort - les hauts très hauts, les bas très bas' },
  ]},

  { kind: 'calcul' },
  { kind: 'mini' },
  { kind: 'emailgate' },
  { kind: 'profil' },
  { kind: 'offre' },
]

const GOLD = '#C9A961'
const IVORY = '#F5EFE3'
const BG = '#0A0806'

export default function BilanExperience() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const sessionIdRef = useRef<string>(generateSessionId())
  const responseIdRef = useRef<string | null>(null)
  const startedRef = useRef(false)
  const completedRef = useRef(false)

  const current = STEPS[step]
  const questions = useMemo(() => STEPS.filter((s): s is Question => s.kind === 'question'), [])
  const answeredCount = STEPS.slice(0, step).filter(s => s.kind === 'question').length
  const progress = Math.round((answeredCount / questions.length) * 100)

  const goNext = useCallback(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), [])
  const restart = () => {
    setAnswers({}); setStep(0); setFirstName(''); setEmail('')
    sessionIdRef.current = generateSessionId(); responseIdRef.current = null
    startedRef.current = false; completedRef.current = false
  }

  // ── Scoring : moteur RÉEL du test Signature (processQuizResults) ──
  const scoring = useMemo(() => {
    const allResp = buildAllResponses(answers)
    const { scores, dominant, secondary } = processQuizResults(allResp)
    const archetype = getArchetype(dominant, secondary)
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
    const share = (scores[dominant] || 0) / total
    const intensity = Math.max(55, Math.min(94, Math.round(share * 100 * 3)))
    return { scores, dominant, secondary, archetype, intensity, allResp }
  }, [answers])

  // ── Démarrage : crée la réponse en base + track (une fois) ──
  useEffect(() => {
    if (step > 0 && !startedRef.current) {
      startedRef.current = true
      ;(async () => {
        const id = await saveResponse(sessionIdRef.current, null, { currentQuestion: 1 })
        responseIdRef.current = id
        trackEvent(sessionIdRef.current, id, 'quiz_started', {})
      })()
    }
  }, [step])

  // ── Complétion : à l'écran d'analyse, on enregistre le résultat ──
  useEffect(() => {
    if (current.kind === 'calcul' && !completedRef.current) {
      completedRef.current = true
      ;(async () => {
        const id = await saveResponse(sessionIdRef.current, responseIdRef.current, {
          responses: scoring.allResp,
          scores: scoring.scores,
          dominantDimension: scoring.dominant,
          secondaryDimension: scoring.secondary,
          completedAt: new Date().toISOString(),
        })
        if (id) responseIdRef.current = id
        trackEvent(sessionIdRef.current, responseIdRef.current, 'quiz_completed', { dominant: scoring.dominant, secondary: scoring.secondary })
      })()
    }
    if (current.kind === 'profil') {
      trackEvent(sessionIdRef.current, responseIdRef.current, 'result_page_viewed', { dominant: scoring.dominant })
    }
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarde d'une question + tracking
  const saveQuestion = useCallback((qid: number, snapshot: Record<number, number[]>) => {
    saveResponse(sessionIdRef.current, responseIdRef.current, { responses: buildAllResponses(snapshot), currentQuestion: qid })
      .then(id => { if (id) responseIdRef.current = id })
    trackEvent(sessionIdRef.current, responseIdRef.current, 'quiz_question_answered', { questionId: qid })
  }, [])

  const selectSingle = (qid: number, idx: number) => {
    const next = { ...answers, [qid]: [idx] }
    setAnswers(next)
    saveQuestion(qid, next)
    setTimeout(goNext, 260)
  }
  const toggleMulti = (qid: number, idx: number, max: number) => {
    setAnswers(a => {
      const cur = a[qid] || []
      if (cur.includes(idx)) return { ...a, [qid]: cur.filter(i => i !== idx) }
      if (cur.length >= max) return a
      return { ...a, [qid]: [...cur, idx] }
    })
  }

  // ── Capture email (après le mini-bilan) → alimente la séquence des 16 mails ──
  const handleEmailSubmit = useCallback(async (name: string, capturedEmail: string) => {
    setEmailLoading(true)
    setFirstName(name)
    setEmail(capturedEmail)
    const sid = sessionIdRef.current
    const rid = responseIdRef.current
    await saveResponse(sid, rid, { email: capturedEmail, firstName: name, emailCapturedAt: new Date().toISOString() })
    trackEvent(sid, rid, 'quiz_email_captured', { email: capturedEmail })
    try {
      await fetch('/api/quiz-v2/email-capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, responseId: rid, email: capturedEmail, firstName: name }),
      })
    } catch { /* non-critical */ }
    try {
      await fetch('/api/quiz-v2/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid, responseId: rid, email: capturedEmail, firstName: name,
          scores: scoring.scores, dominant: scoring.dominant, q15Response: '',
        }),
      })
    } catch { /* non-critical */ }
    setEmailLoading(false)
    goNext()
  }, [goNext, scoring.scores, scoring.dominant])

  return (
    <main style={{ minHeight: '100vh', background: BG, color: IVORY, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {current.kind === 'question' && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: BG, padding: '18px 20px 10px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ height: 4, background: 'rgba(245,239,227,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${GOLD},#E8C77D)`, transition: 'width .4s ease', boxShadow: `0 0 10px ${GOLD}` }} />
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,239,227,0.45)', marginTop: 8 }}>
              {progress < 40 ? 'Analyse en cours' : progress < 75 ? 'À mi-chemin' : 'Dernière phase'} · {answeredCount}/{questions.length}
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 120px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {current.kind === 'screen' && <ScreenView s={current} onNext={goNext} />}
        {current.kind === 'question' && (
          <QuestionView q={current} selected={answers[current.id] || []}
            onSingle={(i) => selectSingle(current.id, i)}
            onMulti={(i) => toggleMulti(current.id, i, current.multiMax || 2)}
            onNext={() => { saveQuestion(current.id, answers); goNext() }} />
        )}
        {current.kind === 'calcul' && <CalculView onDone={goNext} />}
        {current.kind === 'mini' && <MiniView onNext={goNext} />}
        {current.kind === 'emailgate' && <EmailGateView loading={emailLoading} onSubmit={handleEmailSubmit} />}
        {current.kind === 'profil' && <ProfilView archetype={scoring.archetype} intensity={scoring.intensity} onNext={goNext} />}
        {current.kind === 'offre' && <OffreView firstName={firstName} scores={scoring.scores} onRestart={restart} />}
      </div>
    </main>
  )
}

function ScreenView({ s, onNext }: { s: ScreenStep; onNext: () => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {s.eyebrow && <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>{s.eyebrow}</p>}
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 30, lineHeight: 1.2, margin: '0 0 24px' }}>{s.title}</h1>
      {s.body.map((p, i) => (
        <p key={i} style={{ color: 'rgba(245,239,227,0.72)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-line' }}>{p}</p>
      ))}
      <button onClick={onNext} style={btnGold}>{s.cta}</button>
    </div>
  )
}

function QuestionView({ q, selected, onSingle, onMulti, onNext }: {
  q: Question; selected: number[]; onSingle: (i: number) => void; onMulti: (i: number) => void; onNext: () => void
}) {
  const isMulti = !!q.multiMax
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Question {q.id} / 15</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 26, lineHeight: 1.25, margin: '0 0 8px' }}>{q.question}</h2>
      {isMulti && <p style={{ fontSize: 13, color: 'rgba(245,239,227,0.5)', margin: '0 0 20px' }}>2 choix maximum</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {q.choices.map((c, i) => {
          const on = selected.includes(i)
          return (
            <button key={i} onClick={() => isMulti ? onMulti(i) : onSingle(i)} style={{
              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '15px 18px', borderRadius: 16, cursor: 'pointer',
              background: on ? 'rgba(201,169,97,0.14)' : 'rgba(245,239,227,0.03)', border: `1px solid ${on ? GOLD : 'rgba(245,239,227,0.1)'}`,
              color: IVORY, fontSize: 15, lineHeight: 1.4, transition: 'all .18s', boxShadow: on ? `0 0 16px -4px ${GOLD}` : 'none',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 26, textAlign: 'center' }}>{c.emoji}</span>
              <span>{c.text}</span>
            </button>
          )
        })}
      </div>
      {isMulti && (
        <button onClick={onNext} disabled={selected.length === 0} style={{
          ...btnGold, marginTop: 22, width: '100%',
          background: selected.length ? btnGold.background : 'rgba(245,239,227,0.06)',
          color: selected.length ? BG : 'rgba(245,239,227,0.4)', cursor: selected.length ? 'pointer' : 'not-allowed',
        }}>Continuer →</button>
      )}
    </div>
  )
}

function CalculView({ onDone }: { onDone: () => void }) {
  const lines = [
    'Analyse des stratégies émotionnelles…',
    'Identification des mécanismes dominants…',
    'Recherche des mécanismes compensatoires…',
    'Comparaison avec notre base de profils…',
    'Construction de ton bilan personnalisé…',
  ]
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown < lines.length) {
      const t = setTimeout(() => setShown(shown + 1), 1900)
      return () => clearTimeout(t)
    }
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [shown]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Analyse</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 30, margin: '0 0 34px' }}>Analyse en cours…</h1>
      <div style={{ textAlign: 'left', maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i < shown ? 1 : 0.18, transition: 'opacity .5s' }}>
            <span style={{ color: i < shown ? GOLD : 'rgba(245,239,227,0.3)', fontSize: 16 }}>{i < shown ? '✔' : '○'}</span>
            <span style={{ fontSize: 15, color: i < shown ? IVORY : 'rgba(245,239,227,0.4)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniView({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Premier aperçu</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 28, lineHeight: 1.2, margin: '0 0 24px' }}>Ce que nous pouvons déjà affirmer</h1>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 16px' }}>
        Tu fais partie des personnes qui mobilisent énormément d’énergie simplement pour maintenir un équilibre intérieur.
      </p>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 16px' }}>
        Tu sembles avoir développé plusieurs stratégies de protection qui fonctionnent très bien à court terme… mais qui deviennent parfois les raisons pour lesquelles tu te sens bloqué(e).
      </p>
      <p style={{ color: IVORY, fontSize: 16, lineHeight: 1.7, margin: '0 0 28px' }}>
        Dans un instant, nous te montrons précisément lesquelles.
      </p>
      <button onClick={onNext} style={btnGold}>Voir mon bilan complet</button>
    </div>
  )
}

// ── Capture email (porte vers le profil complet) ──
function EmailGateView({ loading, onSubmit }: { loading: boolean; onSubmit: (name: string, email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const valid = /.+@.+\..+/.test(email)
  const submit = () => { if (valid && !loading) onSubmit(name.trim(), email.trim()) }
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Ton bilan est prêt</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 28, lineHeight: 1.2, margin: '0 0 16px' }}>
        Où souhaites-tu recevoir ton bilan complet ?
      </h1>
      <p style={{ color: 'rgba(245,239,227,0.7)', fontSize: 15, lineHeight: 1.6, margin: '0 0 26px' }}>
        Ton prénom et ton email pour débloquer ton profil détaillé et ton protocole recommandé.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380, margin: '0 auto' }}>
        <input type="text" placeholder="Ton prénom" value={name} onChange={e => setName(e.target.value)}
          style={inputStyle} />
        <input type="email" inputMode="email" autoComplete="email" placeholder="ton@email.com" value={email}
          onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit() }}
          style={inputStyle} />
        <button onClick={submit} disabled={!valid || loading}
          style={{ ...btnGold, width: '100%', opacity: valid && !loading ? 1 : 0.4, cursor: valid && !loading ? 'pointer' : 'not-allowed' }}>
          {loading ? 'Un instant…' : 'Découvrir mon bilan complet →'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(245,239,227,0.4)', marginTop: 16 }}>Gratuit · tes données restent confidentielles</p>
    </div>
  )
}

function ProfilView({ archetype, intensity, onNext }: { archetype: Archetype; intensity: number; onNext: () => void }) {
  const parts = [
    { label: 'On te reconnaît', text: archetype.reconnaissance },
    { label: 'La vérité', text: archetype.verite },
    { label: 'Le mécanisme profond', text: archetype.mecanique },
    { label: 'Ce que ça te coûte', text: archetype.consequence },
    { label: 'Le chemin', text: archetype.transition },
  ]
  const [revealed, setRevealed] = useState(1)
  const bc = BLESSURE_COLORS[archetype.blessure]
  const done = revealed >= parts.length
  return (
    <div>
      <p style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 10, textAlign: 'center' }}>
        Ton fonctionnement dominant · Blessure de {archetype.blessure}
      </p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 32, lineHeight: 1.15, textAlign: 'center', margin: '0 0 14px' }}>
        {archetype.name}
      </h1>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        {[archetype.emotion, archetype.mode].map((t, i) => (
          <span key={i} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 50, border: `1px solid ${bc?.border || 'rgba(201,169,97,0.3)'}`, color: bc?.text || GOLD }}>{t}</span>
        ))}
      </div>
      <div style={{ maxWidth: 280, margin: '0 auto 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(245,239,227,0.6)', marginBottom: 6 }}>
          <span>Intensité</span><span style={{ color: GOLD }}>{intensity} %</span>
        </div>
        <div style={{ height: 6, background: 'rgba(245,239,227,0.1)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${intensity}%`, height: '100%', background: `linear-gradient(90deg,${GOLD},#E8C77D)` }} />
        </div>
      </div>
      <div style={{ marginTop: 26 }}>
        {parts.slice(0, revealed).map((p, i) => (
          <div key={i} style={{ marginBottom: 22, animation: 'fadeInUp .5s ease' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>{p.label}</p>
            <p style={{ color: 'rgba(245,239,227,0.85)', fontSize: 15.5, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{p.text}</p>
          </div>
        ))}
      </div>
      <button onClick={() => (done ? onNext() : setRevealed(r => r + 1))} style={{ ...btnGold, width: '100%', marginTop: 10 }}>
        {done ? 'Continuer' : 'Continuer la lecture →'}
      </button>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

type RecoProtocol = { title: string; slug: string; matchScore: number }

function OffreView({ firstName, scores, onRestart }: { firstName: string; scores: Record<string, number>; onRestart: () => void }) {
  const [reco, setReco] = useState<RecoProtocol | null>(null)
  useEffect(() => {
    let cancelled = false
    async function loadReco() {
      try {
        const supabase = createClient()
        const [{ data: protocols }, { data: published }] = await Promise.all([
          supabase.from('protocols').select('*'),
          supabase.from('douleurs').select('slug').eq('is_published', true),
        ])
        if (cancelled || !protocols) return
        const publishedSet = new Set((published || []).map((d: { slug: string }) => d.slug))
        const scored = (protocols as Array<Record<string, unknown>>)
          .map(p => ({
            title: p.title as string, slug: p.slug as string, status: p.status as string,
            matchScore: calculateMatchScores(scores, (p.dimension_weights as Record<string, number>) || {}),
            published: publishedSet.has(p.slug as string),
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
        // Toujours un protocole DISPONIBLE (jamais un « à venir »)
        const best = scored.find(p => p.status === 'available' && p.published) || scored.find(p => p.status === 'available')
        if (best) setReco({ title: best.title, slug: best.slug, matchScore: best.matchScore })
      } catch { /* pas de base : pas de reco */ }
    }
    loadReco()
    return () => { cancelled = true }
  }, [scores])

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Bonne nouvelle</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 30, lineHeight: 1.2, margin: '0 0 22px' }}>
        {firstName ? `${firstName}, ce` : 'Ce'} fonctionnement n’est pas une fatalité.
      </h1>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 14px' }}>
        Il est possible de le faire évoluer. À condition d’avoir un accompagnement adapté à ta Signature exacte.
      </p>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 10px' }}>C’est exactement ce que propose SOS Shine.</p>
      <p style={{ color: 'rgba(245,239,227,0.55)', fontSize: 14, lineHeight: 1.6, margin: '0 0 26px' }}>
        Nous ne te proposons pas une méthode générique. Nous t’accompagnons à partir de ton fonctionnement réel.
      </p>

      {reco && (
        <a href={`/signup?source=bilan&protocol=${encodeURIComponent(reco.slug)}`}
          style={{ display: 'block', textDecoration: 'none', textAlign: 'left', border: `1px solid ${GOLD}`, borderRadius: 16, padding: '18px 20px', margin: '0 0 22px', background: 'rgba(201,169,97,0.06)' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' }}>Ton protocole recommandé</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 21, color: IVORY }}>{reco.title}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: GOLD, whiteSpace: 'nowrap' }}>{reco.matchScore}%</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(245,239,227,0.55)', margin: '4px 0 0' }}>de correspondance avec ton fonctionnement · disponible maintenant</p>
        </a>
      )}

      <a href="/rejoindre" style={{ ...btnGold, display: 'inline-block', textDecoration: 'none' }}>Découvrir l’accompagnement adapté à mon bilan</a>

      <div style={{ marginTop: 24 }}>
        <button onClick={onRestart} style={{ background: 'none', border: 'none', color: 'rgba(245,239,227,0.4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Recommencer l’analyse</button>
      </div>
    </div>
  )
}

const btnGold: React.CSSProperties = { background: `linear-gradient(135deg,${GOLD},#A88248)`, color: BG, border: 'none', padding: '15px 32px', borderRadius: 50, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
const inputStyle: React.CSSProperties = { padding: '13px 16px', borderRadius: 12, background: 'rgba(245,239,227,0.05)', border: '1px solid rgba(245,239,227,0.14)', color: IVORY, fontSize: 15, outline: 'none', textAlign: 'center' }
