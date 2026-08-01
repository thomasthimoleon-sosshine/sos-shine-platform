'use client'

// ══════════════════════════════════════════════════════════════
// SOS Shine — Bilan Émotionnel Premium (PROJECTION / prototype)
// Page de test du PROCHAIN questionnaire. Non branchée au scoring
// ni à la base : c'est une maquette interactive pour valider l'UX
// et les textes avant intégration. Tout est data-driven ci-dessous
// (STEPS) pour être modifié facilement.
// ══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'

type Choice = { emoji: string; text: string }
type Question = { kind: 'question'; id: number; phase: 1 | 2 | 3; multiMax?: number; question: string; choices: Choice[] }
type Screen = { kind: 'screen'; key: string; eyebrow?: string; title: string; body: string[]; cta: string }
type Step = Question | Screen

// ── Contenu (modifiable à terme) ─────────────────────────────
const STEPS: Step[] = [
  // 1. Accueil
  {
    kind: 'screen', key: 'accueil',
    eyebrow: 'Bilan émotionnel',
    title: 'Nous allons analyser ton fonctionnement émotionnel.',
    body: [
      'Pas ta personnalité. Pas ton caractère. Ton fonctionnement.',
      'En moins de 5 minutes.',
      'Notre analyse identifie les mécanismes émotionnels qui influencent aujourd\'hui :',
      '✓ tes relations\n✓ ton niveau de stress\n✓ tes décisions\n✓ tes réactions automatiques',
      'Puis nous te montrerons précisément lesquels travaillent actuellement en arrière-plan.',
    ],
    cta: 'Commencer l\'analyse',
  },
  // 2. Crédibilité
  {
    kind: 'screen', key: 'credibilite',
    eyebrow: 'Avant de commencer',
    title: 'Comment fonctionne cette analyse',
    body: [
      'Cette analyse a été conçue à partir de centaines de situations d\'accompagnement.',
      'Elle ne cherche pas à te mettre dans une case. Elle cherche à comprendre les mécanismes qui influencent aujourd\'hui ta façon de fonctionner.',
      'Réponds spontanément. Il n\'existe aucune bonne réponse.',
    ],
    cta: 'Je suis prêt(e)',
  },

  // PHASE 1
  { kind: 'question', id: 1, phase: 1, question: 'Quand tu souffres sans pouvoir le dire, qu\'est-ce que tu fais ?', choices: [
    { emoji: '🧠', text: 'J\'analyse - comprendre aide à tenir' },
    { emoji: '🎭', text: 'Je fais comme si tout allait bien' },
    { emoji: '🌊', text: 'Je m\'effondre - les émotions débordent' },
    { emoji: '🚪', text: 'Je m\'isole pour gérer seul(e)' },
    { emoji: '⚡', text: 'Je me jette dans l\'action' },
  ]},
  { kind: 'question', id: 2, phase: 1, question: 'Ce qui t\'épuise le plus en ce moment ?', choices: [
    { emoji: '⚡', text: 'Gérer les tensions et les conflits autour de moi' },
    { emoji: '👁', text: 'Toujours anticiper - être en alerte permanente' },
    { emoji: '🔄', text: 'Ne pas contrôler ce qui se passe autour de moi' },
    { emoji: '🏋️', text: 'Tout porter seul(e) sans pouvoir demander de l\'aide' },
    { emoji: '😶', text: 'Avoir l\'impression que rien ne changera jamais' },
  ]},
  { kind: 'question', id: 3, phase: 1, multiMax: 2, question: 'Comment tu te retrouves souvent dans tes relations ?', choices: [
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
  { kind: 'question', id: 4, phase: 1, question: 'Tu es en conflit avec quelqu\'un. Comment tu gères ?', choices: [
    { emoji: '🕊', text: 'Je cède pour que ça s\'arrête' },
    { emoji: '🧩', text: 'Je cherche la solution logique qui arrange tout le monde' },
    { emoji: '💥', text: 'Je réagis fort sur le moment, puis je regrette' },
    { emoji: '💨', text: 'Je disparais - mentalement ou physiquement' },
    { emoji: '🫶', text: 'Je prends soin de l\'autre même si c\'est moi qui suis blessé(e)' },
  ]},
  { kind: 'question', id: 5, phase: 1, multiMax: 2, question: 'Qu\'est-ce qui déclenche ton stress ?', choices: [
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

  // PHASE 2
  { kind: 'question', id: 6, phase: 2, question: 'Ce qui te pèse le plus ?', choices: [
    { emoji: '🫧', text: 'Me sentir seul(e) même quand je suis entouré(e)' },
    { emoji: '🔋', text: 'Ne jamais vraiment me détendre - toujours en tension' },
    { emoji: '🌑', text: 'Ne pas être à la hauteur de ce que je pourrais être' },
    { emoji: '⚖️', text: 'Ne jamais savoir si je fais les bons choix' },
    { emoji: '🌊', text: 'Devoir toujours m\'adapter aux attentes des autres' },
  ]},
  { kind: 'question', id: 7, phase: 2, question: 'Ce qui t\'empêche d\'avancer ?', choices: [
    { emoji: '🫀', text: 'La peur de mal faire - je préfère ne pas commencer' },
    { emoji: '🏔', text: 'La conviction que je dois y arriver seul(e)' },
    { emoji: '🌪', text: 'Je m\'épuise en action pour ne pas avoir à ressentir' },
    { emoji: '❄️', text: 'L\'intensité de ce que je ressens me paralyse' },
    { emoji: '👁', text: 'Une peur sous-jacente que je ne sais pas nommer' },
    { emoji: '🪞', text: 'Le regard et le jugement des autres' },
  ]},
  { kind: 'question', id: 8, phase: 2, question: 'Quand tout s\'effondre, tu…', choices: [
    { emoji: '🚪', text: 'Tu t\'isoles et tu gères seul(e) - montrer ta faiblesse est hors de question' },
    { emoji: '🔍', text: 'Tu analyses tout pour comprendre - comme si comprendre pouvait arrêter la douleur' },
    { emoji: '🌩', text: 'Tu imagines le pire - ta tête part dans tous les scénarios catastrophiques' },
    { emoji: '⚙️', text: 'Tu reprends le contrôle - listes, action, organisation' },
    { emoji: '🌊', text: 'Tu lâches tout - les émotions te submergent complètement' },
    { emoji: '🎭', text: 'Tu fais comme si rien n\'était - tu souris pour les autres' },
  ]},
  { kind: 'question', id: 9, phase: 2, question: 'Qu\'est-ce qui te fait te sentir vivant(e) ?', choices: [
    { emoji: '✨', text: 'Comprendre quelque chose en profondeur - une vérité qui clique' },
    { emoji: '🌱', text: 'Être vraiment utile pour quelqu\'un' },
    { emoji: '🗺️', text: 'Avoir tout planifié et maîtrisé' },
    { emoji: '🌸', text: 'Être reconnu(e) et apprécié(e) pour ce que je fais' },
    { emoji: '🏆', text: 'Réussir quelque chose par mes propres moyens' },
    { emoji: '🔥', text: 'Les moments d\'intensité - quand je me sens pleinement présent(e)' },
  ]},
  { kind: 'question', id: 10, phase: 2, question: 'Ce que tu évites le plus ?', choices: [
    { emoji: '🌀', text: 'Perdre le contrôle de toi-même ou d\'une situation' },
    { emoji: '💔', text: 'Décevoir les personnes que tu aimes' },
    { emoji: '🌫', text: 'Ne pas comprendre ce qui se passe vraiment' },
    { emoji: '🛡', text: 'Paraître faible ou dans le besoin aux yeux des autres' },
    { emoji: '⚡', text: 'Rester immobile - tu préfères l\'action même inutile' },
    { emoji: '🪞', text: 'Ne pas être à la hauteur de l\'image que les autres ont de toi' },
  ]},
  { kind: 'screen', key: 'obs3', eyebrow: 'Analyse en cours', title: 'À ce stade…', body: [
    'Nous avons déjà identifié plus de 70 % de ton fonctionnement émotionnel.',
    'Les dernières questions servent à comprendre comment ce mécanisme influence aujourd\'hui tes décisions, tes relations et ton rapport à toi-même.',
  ], cta: 'Terminer l\'analyse' },

  // PHASE 3
  { kind: 'question', id: 11, phase: 3, question: 'Comment tu vis tes émotions ?', choices: [
    { emoji: '🔒', text: 'Je les garde pour moi - les exprimer me rend vulnérable' },
    { emoji: '🧠', text: 'J\'analyse avant de ressentir - ma tête passe avant mon cœur' },
    { emoji: '⚡', text: 'Je les transforme en énergie - je bouge, j\'agis, je fais' },
    { emoji: '🫶', text: 'Les émotions des autres passent avant les miennes' },
    { emoji: '🎯', text: 'Je les contrôle - montrer ses émotions c\'est perdre le contrôle' },
    { emoji: '🌋', text: 'Tout ou rien - jamais dans la nuance' },
  ]},
  { kind: 'question', id: 12, phase: 3, question: 'Ce que tu attends des autres ?', choices: [
    { emoji: '🛡', text: 'Qu\'ils respectent mon espace et mes limites' },
    { emoji: '🤲', text: 'Qu\'ils n\'attendent pas trop de moi' },
    { emoji: '🕊', text: 'Qu\'il n\'y ait pas de conflits ni de tensions' },
    { emoji: '🗝', text: 'Qu\'ils me laissent gérer à ma façon' },
    { emoji: '🌟', text: 'Qu\'ils me voient tel(le) que je suis vraiment' },
    { emoji: '🫶', text: 'Qu\'ils soient là dans les moments qui comptent vraiment' },
  ]},
  { kind: 'question', id: 13, phase: 3, question: 'Comment tu prends tes décisions ?', choices: [
    { emoji: '⏳', text: 'J\'attends d\'être sûr(e) - décider trop vite m\'angoisse' },
    { emoji: '⚡', text: 'Je décide vite et fort même si ça choque' },
    { emoji: '🌐', text: 'Je consulte tout le monde pour ne froisser personne' },
    { emoji: '🔭', text: 'J\'anticipe tous les risques possibles avant de me lancer' },
    { emoji: '🔑', text: 'Je décide seul(e) - les avis des autres me compliquent' },
    { emoji: '🔬', text: 'J\'analyse longtemps pour trouver la solution parfaite' },
  ]},
  { kind: 'question', id: 14, phase: 3, question: 'Ce que tu gardes pour toi ?', choices: [
    { emoji: '🌙', text: 'Tes rêves les plus fous - trop grands pour les partager' },
    { emoji: '🌑', text: 'Tes peurs les plus profondes' },
    { emoji: '🗝', text: 'Tes vraies opinions - tu les gardes pour éviter les conflits' },
    { emoji: '💊', text: 'Tes blessures passées - tu préfères ne pas les rouvrir' },
    { emoji: '🌊', text: 'L\'intensité de ce que tu ressens - personne ne comprendrait' },
    { emoji: '🏋️', text: 'À quel point tu portes les autres - tu n\'en parles jamais' },
  ]},
  { kind: 'question', id: 15, phase: 3, question: 'Ce qui te ressemble le plus ?', choices: [
    { emoji: '🔍', text: 'Comprendre les choses en profondeur - la vérité avant tout' },
    { emoji: '🛡', text: 'Être toujours prêt(e) - anticiper pour ne jamais être pris(e) au dépourvu' },
    { emoji: '🌸', text: 'Prendre soin des autres - même quand tu oublies de prendre soin de toi' },
    { emoji: '⚙️', text: 'Maîtriser ta vie - chaque détail, chaque plan' },
    { emoji: '🌊', text: 'T\'adapter à tout et à tous - être ce dont les autres ont besoin' },
    { emoji: '⚡', text: 'Ressentir fort - les hauts très hauts, les bas très bas' },
  ]},

  // Fin (placeholder — le contenu du résultat premium sera fourni à terme)
  {
    kind: 'screen', key: 'fin',
    eyebrow: 'Analyse terminée',
    title: 'Ton bilan émotionnel est prêt.',
    body: [
      'Nous avons identifié le mécanisme émotionnel qui influence aujourd\'hui tes relations, ton stress et tes décisions.',
      '— Écran de résultat en cours de conception —',
      '(Le contenu détaillé de l\'analyse personnalisée sera intégré ici dans la version finale.)',
    ],
    cta: 'Recommencer',
  },
]

// couleurs charte
const GOLD = '#C9A961'
const IVORY = '#F5EFE3'
const BG = '#0A0806'

export default function QuestionnaireTest() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})

  const current = STEPS[step]
  const questionCount = STEPS.filter(s => s.kind === 'question').length
  const answeredCount = useMemo(
    () => STEPS.slice(0, step).filter(s => s.kind === 'question').length,
    [step]
  )
  const progress = Math.round((answeredCount / questionCount) * 100)

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const restart = () => { setAnswers({}); setStep(0) }

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
      {/* barre de progression */}
      {current.kind === 'question' && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: BG, padding: '18px 20px 10px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ height: 4, background: 'rgba(245,239,227,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${GOLD},#E8C77D)`, transition: 'width .4s ease', boxShadow: `0 0 10px ${GOLD}` }} />
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,239,227,0.45)', marginTop: 8 }}>
              {progress < 40 ? 'Ta signature se dessine' : progress < 75 ? 'À mi-chemin' : 'Presque là'} · {answeredCount}/{questionCount}
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 120px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {current.kind === 'screen' && (
          <div style={{ textAlign: 'center' }}>
            {current.eyebrow && (
              <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>{current.eyebrow}</p>
            )}
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 30, lineHeight: 1.2, margin: '0 0 24px' }}>{current.title}</h1>
            {current.body.map((p, i) => (
              <p key={i} style={{ color: 'rgba(245,239,227,0.72)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-line' }}>{p}</p>
            ))}
            <button
              onClick={current.key === 'fin' ? restart : goNext}
              style={{ marginTop: 20, background: `linear-gradient(135deg,${GOLD},#B8960F)`, color: BG, border: 'none', padding: '15px 34px', borderRadius: 50, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              {current.cta}
            </button>
          </div>
        )}

        {current.kind === 'question' && (
          <QuestionView
            q={current}
            selected={answers[current.id] || []}
            onSingle={(idx) => selectSingle(current.id, idx)}
            onMulti={(idx) => toggleMulti(current.id, idx, current.multiMax || 2)}
            onNext={goNext}
          />
        )}
      </div>
    </main>
  )
}

function QuestionView({ q, selected, onSingle, onMulti, onNext }: {
  q: Question; selected: number[]; onSingle: (i: number) => void; onMulti: (i: number) => void; onNext: () => void
}) {
  const isMulti = !!q.multiMax
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Question {q.id}</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: 26, lineHeight: 1.25, margin: '0 0 8px' }}>{q.question}</h2>
      {isMulti && <p style={{ fontSize: 13, color: 'rgba(245,239,227,0.5)', margin: '0 0 20px' }}>2 choix maximum</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {q.choices.map((c, i) => {
          const on = selected.includes(i)
          return (
            <button
              key={i}
              onClick={() => isMulti ? onMulti(i) : onSingle(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                padding: '15px 18px', borderRadius: 16, cursor: 'pointer',
                background: on ? 'rgba(201,169,97,0.14)' : 'rgba(245,239,227,0.03)',
                border: `1px solid ${on ? GOLD : 'rgba(245,239,227,0.1)'}`,
                color: IVORY, fontSize: 15, lineHeight: 1.4, transition: 'all .18s',
                boxShadow: on ? `0 0 16px -4px ${GOLD}` : 'none',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, width: 26, textAlign: 'center' }}>{c.emoji}</span>
              <span>{c.text}</span>
            </button>
          )
        })}
      </div>
      {isMulti && (
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          style={{
            marginTop: 22, width: '100%', padding: '15px', borderRadius: 50, border: 'none',
            fontWeight: 600, fontSize: 15, cursor: selected.length ? 'pointer' : 'not-allowed',
            background: selected.length ? `linear-gradient(135deg,${GOLD},#B8960F)` : 'rgba(245,239,227,0.06)',
            color: selected.length ? BG : 'rgba(245,239,227,0.4)',
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}
