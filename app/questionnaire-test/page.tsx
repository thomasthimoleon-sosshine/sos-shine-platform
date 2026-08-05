'use client'

// ══════════════════════════════════════════════════════════════
// SOS Shine — Bilan Émotionnel Premium (PROJECTION / prototype)
// Page de test du PROCHAIN questionnaire. Expérience complète :
// accueil → crédibilité → 15 questions (+ écrans d'observation)
// → écran de calcul → mini-bilan → profil détaillé (scoring) →
// transition vers l'offre (+ envoi par email).
// Non branchée à la vraie base : scoring 100 % local (localStorage),
// pensée pour valider l'UX et les textes avant intégration.
// Data-driven (STEPS) ; résultat = archétype réel du test Signature.
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react'
import { QUESTIONS } from '@/lib/quiz-v2/questions'
import { getDominantDimensions } from '@/lib/quiz-v2/scoring'
import { getArchetype, BLESSURE_COLORS, type Archetype } from '@/lib/quiz-v2/archetypes.legacy'


// ── Profils émotionnels (6) ──────────────────────────────────
type ProfileId = 'protecteur' | 'analyseur' | 'adaptateur' | 'controleur' | 'empathique' | 'intense'



// ── Types de contenu ─────────────────────────────────────────
type Choice = { emoji: string; text: string; s: ProfileId[] }
type Question = { kind: 'question'; id: number; multiMax?: number; question: string; choices: Choice[] }
type ScreenStep = { kind: 'screen'; key: string; eyebrow?: string; title: string; body: string[]; cta: string }
type Calcul = { kind: 'calcul' }
type Mini = { kind: 'mini' }
type Profil = { kind: 'profil' }
type Offre = { kind: 'offre' }
type Step = Question | ScreenStep | Calcul | Mini | Profil | Offre

// ── L'expérience, écran par écran ────────────────────────────
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
    { emoji: '🧠', text: 'J\'analyse - comprendre aide à tenir', s: ['analyseur'] },
    { emoji: '🎭', text: 'Je fais comme si tout allait bien', s: ['adaptateur'] },
    { emoji: '🌊', text: 'Je m\'effondre - les émotions débordent', s: ['intense'] },
    { emoji: '🚪', text: 'Je m\'isole pour gérer seul(e)', s: ['controleur'] },
    { emoji: '⚡', text: 'Je me jette dans l\'action', s: ['controleur'] },
  ]},
  { kind: 'question', id: 2, question: 'Ce qui t\'épuise le plus en ce moment ?', choices: [
    { emoji: '⚡', text: 'Gérer les tensions et les conflits autour de moi', s: ['adaptateur'] },
    { emoji: '👁', text: 'Toujours anticiper - être en alerte permanente', s: ['controleur'] },
    { emoji: '🔄', text: 'Ne pas contrôler ce qui se passe autour de moi', s: ['controleur'] },
    { emoji: '🏋️', text: 'Tout porter seul(e) sans pouvoir demander de l\'aide', s: ['protecteur'] },
    { emoji: '😶', text: 'Avoir l\'impression que rien ne changera jamais', s: ['intense'] },
  ]},
  { kind: 'question', id: 3, multiMax: 2, question: 'Comment tu te retrouves souvent dans tes relations ?', choices: [
    { emoji: '🚪', text: 'À fuir quand c\'est trop intense', s: ['adaptateur'] },
    { emoji: '🙏', text: 'À éviter les conflits même si j\'ai raison', s: ['adaptateur'] },
    { emoji: '🔍', text: 'À analyser les autres pour les comprendre vraiment', s: ['analyseur'] },
    { emoji: '🌪', text: 'À m\'occuper constamment pour ne pas penser', s: ['controleur'] },
    { emoji: '💫', text: 'À ressentir les émotions des autres comme les miennes', s: ['empathique'] },
    { emoji: '🔥', text: 'À réagir fort sur le moment, puis à regretter', s: ['intense'] },
    { emoji: '🌿', text: 'À m\'adapter au point de me perdre moi-même', s: ['adaptateur'] },
  ]},
  { kind: 'screen', key: 'obs1', eyebrow: 'Analyse en cours', title: 'Première observation', body: [
    'Certaines de tes réponses montrent déjà que ton cerveau privilégie certains mécanismes de protection plutôt que d\'autres.',
    'C\'est normal. Nous allons maintenant essayer de comprendre pourquoi.',
  ], cta: 'Continuer l\'analyse' },
  { kind: 'question', id: 4, question: 'Tu es en conflit avec quelqu\'un. Comment tu gères ?', choices: [
    { emoji: '🕊', text: 'Je cède pour que ça s\'arrête', s: ['adaptateur'] },
    { emoji: '🧩', text: 'Je cherche la solution logique qui arrange tout le monde', s: ['analyseur'] },
    { emoji: '💥', text: 'Je réagis fort sur le moment, puis je regrette', s: ['intense'] },
    { emoji: '💨', text: 'Je disparais - mentalement ou physiquement', s: ['adaptateur'] },
    { emoji: '🫶', text: 'Je prends soin de l\'autre même si c\'est moi qui suis blessé(e)', s: ['protecteur'] },
  ]},
  { kind: 'question', id: 5, multiMax: 2, question: 'Qu\'est-ce qui déclenche ton stress ?', choices: [
    { emoji: '💔', text: 'Sentir que quelqu\'un est déçu de moi', s: ['protecteur'] },
    { emoji: '⚡', text: 'Les conflits et les tensions autour de moi', s: ['adaptateur'] },
    { emoji: '❓', text: 'L\'incertitude - ne pas savoir ce qui va se passer', s: ['controleur'] },
    { emoji: '🚫', text: 'Devoir dire non ou décevoir les autres', s: ['adaptateur'] },
    { emoji: '🌀', text: 'Perdre le contrôle d\'une situation', s: ['controleur'] },
    { emoji: '👁', text: 'Être jugé(e) ou critiqué(e)', s: ['adaptateur'] },
  ]},
  { kind: 'screen', key: 'obs2', eyebrow: 'Analyse en cours', title: 'Ce que nous observons', body: [
    'Les réponses précédentes permettent déjà d\'identifier plusieurs tendances.',
    'Mais un mécanisme émotionnel n\'apparaît jamais seul. Nous allons maintenant chercher celui qui influence les autres.',
  ], cta: 'Poursuivre' },
  { kind: 'question', id: 6, question: 'Ce qui te pèse le plus ?', choices: [
    { emoji: '🫧', text: 'Me sentir seul(e) même quand je suis entouré(e)', s: ['empathique'] },
    { emoji: '🔋', text: 'Ne jamais vraiment me détendre - toujours en tension', s: ['controleur'] },
    { emoji: '🌑', text: 'Ne pas être à la hauteur de ce que je pourrais être', s: ['controleur'] },
    { emoji: '⚖️', text: 'Ne jamais savoir si je fais les bons choix', s: ['analyseur'] },
    { emoji: '🌊', text: 'Devoir toujours m\'adapter aux attentes des autres', s: ['adaptateur'] },
  ]},
  { kind: 'question', id: 7, question: 'Ce qui t\'empêche d\'avancer ?', choices: [
    { emoji: '🫀', text: 'La peur de mal faire - je préfère ne pas commencer', s: ['controleur'] },
    { emoji: '🏔', text: 'La conviction que je dois y arriver seul(e)', s: ['controleur'] },
    { emoji: '🌪', text: 'Je m\'épuise en action pour ne pas avoir à ressentir', s: ['controleur'] },
    { emoji: '❄️', text: 'L\'intensité de ce que je ressens me paralyse', s: ['intense'] },
    { emoji: '👁', text: 'Une peur sous-jacente que je ne sais pas nommer', s: ['intense'] },
    { emoji: '🪞', text: 'Le regard et le jugement des autres', s: ['adaptateur'] },
  ]},
  { kind: 'question', id: 8, question: 'Quand tout s\'effondre, tu…', choices: [
    { emoji: '🚪', text: 'Tu t\'isoles et tu gères seul(e)', s: ['controleur'] },
    { emoji: '🔍', text: 'Tu analyses tout pour comprendre', s: ['analyseur'] },
    { emoji: '🌩', text: 'Tu imagines le pire - scénarios catastrophes', s: ['intense'] },
    { emoji: '⚙️', text: 'Tu reprends le contrôle - listes, action, organisation', s: ['controleur'] },
    { emoji: '🌊', text: 'Tu lâches tout - les émotions te submergent', s: ['intense'] },
    { emoji: '🎭', text: 'Tu fais comme si rien n\'était - tu souris pour les autres', s: ['adaptateur'] },
  ]},
  { kind: 'question', id: 9, question: 'Qu\'est-ce qui te fait te sentir vivant(e) ?', choices: [
    { emoji: '✨', text: 'Comprendre quelque chose en profondeur', s: ['analyseur'] },
    { emoji: '🌱', text: 'Être vraiment utile pour quelqu\'un', s: ['protecteur'] },
    { emoji: '🗺️', text: 'Avoir tout planifié et maîtrisé', s: ['controleur'] },
    { emoji: '🌸', text: 'Être reconnu(e) et apprécié(e) pour ce que je fais', s: ['adaptateur'] },
    { emoji: '🏆', text: 'Réussir quelque chose par mes propres moyens', s: ['controleur'] },
    { emoji: '🔥', text: 'Les moments d\'intensité - être pleinement présent(e)', s: ['intense'] },
  ]},
  { kind: 'question', id: 10, question: 'Ce que tu évites le plus ?', choices: [
    { emoji: '🌀', text: 'Perdre le contrôle de toi-même ou d\'une situation', s: ['controleur'] },
    { emoji: '💔', text: 'Décevoir les personnes que tu aimes', s: ['protecteur'] },
    { emoji: '🌫', text: 'Ne pas comprendre ce qui se passe vraiment', s: ['analyseur'] },
    { emoji: '🛡', text: 'Paraître faible ou dans le besoin', s: ['controleur'] },
    { emoji: '⚡', text: 'Rester immobile - tu préfères l\'action même inutile', s: ['controleur'] },
    { emoji: '🪞', text: 'Ne pas être à la hauteur de l\'image que les autres ont de toi', s: ['adaptateur'] },
  ]},
  { kind: 'screen', key: 'obs3', eyebrow: 'Analyse en cours', title: 'À ce stade…', body: [
    'Nous avons déjà identifié plus de 70 % de ton fonctionnement émotionnel.',
    'Les dernières questions servent à comprendre comment ce mécanisme influence aujourd\'hui tes décisions, tes relations et ton rapport à toi-même.',
  ], cta: 'Terminer l\'analyse' },
  { kind: 'question', id: 11, question: 'Comment tu vis tes émotions ?', choices: [
    { emoji: '🔒', text: 'Je les garde pour moi - les exprimer me rend vulnérable', s: ['controleur'] },
    { emoji: '🧠', text: 'J\'analyse avant de ressentir', s: ['analyseur'] },
    { emoji: '⚡', text: 'Je les transforme en énergie - je bouge, j\'agis', s: ['controleur'] },
    { emoji: '🫶', text: 'Les émotions des autres passent avant les miennes', s: ['empathique'] },
    { emoji: '🎯', text: 'Je les contrôle - montrer ses émotions c\'est perdre le contrôle', s: ['controleur'] },
    { emoji: '🌋', text: 'Tout ou rien - jamais dans la nuance', s: ['intense'] },
  ]},
  { kind: 'question', id: 12, question: 'Ce que tu attends des autres ?', choices: [
    { emoji: '🛡', text: 'Qu\'ils respectent mon espace et mes limites', s: ['controleur'] },
    { emoji: '🤲', text: 'Qu\'ils n\'attendent pas trop de moi', s: ['adaptateur'] },
    { emoji: '🕊', text: 'Qu\'il n\'y ait pas de conflits ni de tensions', s: ['adaptateur'] },
    { emoji: '🗝', text: 'Qu\'ils me laissent gérer à ma façon', s: ['controleur'] },
    { emoji: '🌟', text: 'Qu\'ils me voient tel(le) que je suis vraiment', s: ['empathique'] },
    { emoji: '🫶', text: 'Qu\'ils soient là dans les moments qui comptent', s: ['empathique'] },
  ]},
  { kind: 'question', id: 13, question: 'Comment tu prends tes décisions ?', choices: [
    { emoji: '⏳', text: 'J\'attends d\'être sûr(e) - décider trop vite m\'angoisse', s: ['controleur'] },
    { emoji: '⚡', text: 'Je décide vite et fort même si ça choque', s: ['intense'] },
    { emoji: '🌐', text: 'Je consulte tout le monde pour ne froisser personne', s: ['adaptateur'] },
    { emoji: '🔭', text: 'J\'anticipe tous les risques avant de me lancer', s: ['controleur'] },
    { emoji: '🔑', text: 'Je décide seul(e) - les avis me compliquent', s: ['controleur'] },
    { emoji: '🔬', text: 'J\'analyse longtemps pour la solution parfaite', s: ['analyseur'] },
  ]},
  { kind: 'question', id: 14, question: 'Ce que tu gardes pour toi ?', choices: [
    { emoji: '🌙', text: 'Tes rêves les plus fous', s: ['intense'] },
    { emoji: '🌑', text: 'Tes peurs les plus profondes', s: ['intense'] },
    { emoji: '🗝', text: 'Tes vraies opinions - pour éviter les conflits', s: ['adaptateur'] },
    { emoji: '💊', text: 'Tes blessures passées - tu préfères ne pas les rouvrir', s: ['intense'] },
    { emoji: '🌊', text: 'L\'intensité de ce que tu ressens', s: ['empathique'] },
    { emoji: '🏋️', text: 'À quel point tu portes les autres', s: ['protecteur'] },
  ]},
  { kind: 'question', id: 15, question: 'Ce qui te ressemble le plus ?', choices: [
    { emoji: '🔍', text: 'Comprendre les choses en profondeur - la vérité avant tout', s: ['analyseur'] },
    { emoji: '🛡', text: 'Être toujours prêt(e) - anticiper pour ne jamais être pris(e) au dépourvu', s: ['controleur'] },
    { emoji: '🌸', text: 'Prendre soin des autres - même en t\'oubliant', s: ['protecteur'] },
    { emoji: '⚙️', text: 'Maîtriser ta vie - chaque détail, chaque plan', s: ['controleur'] },
    { emoji: '🌊', text: 'T\'adapter à tout et à tous', s: ['adaptateur'] },
    { emoji: '⚡', text: 'Ressentir fort - les hauts très hauts, les bas très bas', s: ['intense'] },
  ]},

  { kind: 'calcul' },
  { kind: 'mini' },
  { kind: 'profil' },
  { kind: 'offre' },
]

const GOLD = '#C9A961'
const IVORY = '#F5EFE3'
const BG = '#0A0806'
const STORAGE_KEY = 'bilan_emotionnel_test'

export default function QuestionnaireTest() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})

  // Restauration localStorage (prototype)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) { const d = JSON.parse(raw); if (d?.answers) setAnswers(d.answers) }
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step })) } catch {}
  }, [answers, step])

  const current = STEPS[step]
  const questions = STEPS.filter((s): s is Question => s.kind === 'question')
  const answeredCount = STEPS.slice(0, step).filter(s => s.kind === 'question').length
  const progress = Math.round((answeredCount / questions.length) * 100)

  const goNext = useCallback(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), [])
  const restart = () => { setAnswers({}); setStep(0); try { localStorage.removeItem(STORAGE_KEY) } catch {} }

  // ── Scoring : via le VRAI moteur de dimensions du test Signature ──
  const scoring = useMemo(() => {
    // 1. Points par dimension (poids identiques au test Signature officiel)
    const dims: Record<string, number> = {}
    for (const q of questions) {
      const real = QUESTIONS.find(rq => rq.id === q.id)
      const sel = answers[q.id] || []
      for (const idx of sel) {
        const sc = real?.choices?.[idx]?.scores || {}
        for (const [d, v] of Object.entries(sc)) dims[d] = (dims[d] || 0) + (v as number)
      }
    }
    // 2. Dimension dominante + secondaire → archétype RÉEL (moteur Signature)
    const { dominant, secondary } = getDominantDimensions(dims)
    const archetype = getArchetype(dominant, secondary)

    // Intensité "ressentie" : part de la dimension dominante, bornée (55–94 %)
    const total = Object.values(dims).reduce((a, b) => a + b, 0) || 1
    const share = (dims[dominant] || 0) / total
    const intensity = Math.max(55, Math.min(94, Math.round(share * 100 * 3)))

    return { archetype, intensity }
  }, [answers, questions])

  const selectSingle = (qid: number, idx: number) => {
    setAnswers(a => ({ ...a, [qid]: [idx] }))
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
            onNext={goNext} />
        )}
        {current.kind === 'calcul' && <CalculView onDone={goNext} />}
        {current.kind === 'mini' && <MiniView onNext={goNext} />}
        {current.kind === 'profil' && <ProfilView archetype={scoring.archetype} intensity={scoring.intensity} onNext={goNext} />}
        {current.kind === 'offre' && <OffreView onRestart={restart} />}
      </div>
    </main>
  )
}

// ── Écran générique (accueil / crédibilité / observations) ──
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

// ── Question ──
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

// ── Écran de calcul (apparition progressive, ~10s) ──
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

// ── Mini-bilan ──
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
        Dans les prochaines minutes, nous allons te montrer précisément lesquelles.
      </p>
      <button onClick={onNext} style={btnGold}>Voir mon bilan complet</button>
    </div>
  )
}

// ── Profil complet : l'archétype réel, dévoilé section après section ──
function ProfilView({ archetype, intensity, onNext }: { archetype: Archetype; intensity: number; onNext: () => void }) {
  // Les 5 temps du récit (contenu déjà écrit par SOS Shine)
  const parts = [
    { label: 'On te reconnaît', text: archetype.reconnaissance },
    { label: 'La vérité', text: archetype.verite },
    { label: 'Le mécanisme profond', text: archetype.mecanique },
    { label: 'Ce que ça te coûte', text: archetype.consequence },
    { label: 'Le chemin', text: archetype.transition },
  ]
  const [revealed, setRevealed] = useState(1) // nombre de sections affichées
  const bc = BLESSURE_COLORS[archetype.blessure]
  const done = revealed >= parts.length

  return (
    <div>
      {/* En-tête : archétype réel + blessure + intensité */}
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

      {/* Récit dévoilé progressivement */}
      <div style={{ marginTop: 26 }}>
        {parts.slice(0, revealed).map((p, i) => (
          <div key={i} style={{ marginBottom: 22, animation: 'fadeInUp .5s ease' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>{p.label}</p>
            <p style={{ color: 'rgba(245,239,227,0.85)', fontSize: 15.5, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{p.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => (done ? onNext() : setRevealed(r => r + 1))}
        style={{ ...btnGold, width: '100%', marginTop: 10 }}
      >
        {done ? 'Continuer' : 'Continuer la lecture →'}
      </button>

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

// ── Transition vers l'offre + email ──
function OffreView({ onRestart }: { onRestart: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const valid = /.+@.+\..+/.test(email)
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Bonne nouvelle</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 30, lineHeight: 1.2, margin: '0 0 22px' }}>
        Ce fonctionnement n’est pas une fatalité.
      </h1>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 14px' }}>
        Il est possible de le faire évoluer. À condition d’avoir un accompagnement adapté à ta Signature exacte.
      </p>
      <p style={{ color: 'rgba(245,239,227,0.75)', fontSize: 16, lineHeight: 1.7, margin: '0 0 10px' }}>C’est exactement ce que propose SOS Shine.</p>
      <p style={{ color: 'rgba(245,239,227,0.55)', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
        Nous ne te proposons pas une méthode générique. Nous t’accompagnons à partir de ton fonctionnement réel.
      </p>

      <a href="/rejoindre" style={{ ...btnGold, display: 'inline-block', textDecoration: 'none' }}>Découvrir l’accompagnement adapté à mon bilan</a>

      <div style={{ marginTop: 34, paddingTop: 24, borderTop: '1px solid rgba(245,239,227,0.1)' }}>
        {sent ? (
          <p style={{ color: GOLD, fontSize: 14 }}>✔ Ton bilan te sera envoyé (maquette — envoi non branché).</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'rgba(245,239,227,0.55)', marginBottom: 12 }}>Recevoir mon bilan par email</p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto' }}>
              <input type="email" inputMode="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'rgba(245,239,227,0.05)', border: '1px solid rgba(245,239,227,0.12)', color: IVORY, fontSize: 14, outline: 'none' }} />
              <button onClick={() => valid && setSent(true)} disabled={!valid}
                style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${GOLD}`, background: 'transparent', color: GOLD, fontSize: 13, fontWeight: 600, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.4 }}>Envoyer</button>
            </div>
          </>
        )}
      </div>

      <button onClick={onRestart} style={{ marginTop: 30, background: 'none', border: 'none', color: 'rgba(245,239,227,0.4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Recommencer l’analyse</button>
    </div>
  )
}

const btnGold: React.CSSProperties = { background: `linear-gradient(135deg,${GOLD},#B8960F)`, color: BG, border: 'none', padding: '15px 32px', borderRadius: 50, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
