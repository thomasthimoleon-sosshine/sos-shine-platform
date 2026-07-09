'use client'

/**
 * Refonte proposée — direction "lumière / refuge".
 * Tout est scopé sous #lpc pour ne pas impacter le reste du site.
 * Contenu réel : 10 Signatures, méthode 3 étapes, le Refuge (communauté),
 * l'écosystème, la trinité, témoignages, tarifs, FAQ.
 */

import { useEffect, useState } from 'react'

const QUIZ_URL = '/signature-emotionnelle?start=1'

const CSS = `
#lpc{--paper:#F5F1E9;--card:#FCFAF5;--ink:#1F1D26;--gold:#C2A15B;--gold-d:#A9863F;--sage:#8FA99B;--muted:#847C6E;--line:rgba(31,29,38,.1);--night:#181922;--night-2:#20222E;--serif:Georgia,'Times New Roman',serif;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
#lpc *{box-sizing:border-box;margin:0;padding:0}
#lpc canvas#lpcbg{position:fixed;inset:0;z-index:0;pointer-events:none}
#lpc .serif{font-family:var(--serif);font-weight:400}
#lpc .eyebrow{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);font-weight:600}
#lpc .muted{color:var(--muted)}
#lpc a{color:inherit;text-decoration:none}
#lpc .wrap{max-width:1080px;margin:0 auto;padding:0 28px}
#lpc section{position:relative;z-index:1;padding:clamp(80px,12vh,140px) 0}
#lpc .bar{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px 24px;backdrop-filter:blur(12px);background:rgba(245,241,233,.72);border-bottom:1px solid var(--line)}
#lpc .bar .brand{font-family:var(--serif);font-size:19px}
#lpc .bar .brand b{color:var(--gold)}
#lpc .bar .actions{display:flex;align-items:center;gap:14px}
#lpc .bar .ghost{font-size:13px;color:var(--muted)}
#lpc .btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer;border:0;background:linear-gradient(135deg,var(--gold),#D8BE82);color:#2a2318;box-shadow:0 8px 28px -10px rgba(194,161,91,.6);transition:transform .3s}
#lpc .btn:hover{transform:scale(1.04)}
#lpc .btn.big{padding:16px 34px;font-size:15px}
#lpc .btn.ghost2{background:transparent;border:1px solid var(--line);color:var(--ink);box-shadow:none}
#lpc .btn.pulse{animation:lpcpulse 3.6s ease-in-out infinite}
@keyframes lpcpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
#lpc.anim .rv{opacity:0;transform:translateY(22px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)}
#lpc.anim .rv.in{opacity:1;transform:none}
#lpc .hero{min-height:100vh;display:flex;align-items:center;padding-top:120px}
#lpc .hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center;width:100%}
@media(max-width:820px){#lpc .hero-grid{grid-template-columns:1fr;gap:40px}#lpc .portrait{order:-1}}
#lpc h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.1rem,5.2vw,4rem);line-height:1.08;letter-spacing:-.01em}
#lpc h1 .w{display:inline-block;overflow:hidden;vertical-align:bottom}
#lpc.anim h1 .w span{display:inline-block;transform:translateY(105%);opacity:0}
#lpc.anim h1.play .w span{transform:none;opacity:1;transition:all 1s cubic-bezier(.16,1,.3,1)}
#lpc .sub{font-size:clamp(1rem,1.7vw,1.25rem);color:var(--muted);max-width:38ch;margin:26px 0 34px;font-weight:300;line-height:1.65}
#lpc .hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
#lpc .microproof{font-size:12.5px;color:var(--muted);margin-top:16px}
#lpc .portrait{position:relative;width:min(80vw,340px);aspect-ratio:3/4;border-radius:26px;overflow:hidden;margin:0 auto;border:1px solid rgba(194,161,91,.3);box-shadow:0 40px 110px -46px rgba(120,95,45,.55);animation:lpcfloat 8s ease-in-out infinite}
#lpc .portrait img{width:100%;height:100%;object-fit:cover}
@keyframes lpcfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
#lpc .ident{text-align:center}
#lpc .ident .stage{min-height:34vh;display:flex;align-items:center;justify-content:center}
#lpc .ident .phrase{font-family:var(--serif);font-size:clamp(1.7rem,5vw,3.4rem);font-weight:400;line-height:1.2}
#lpc .dots{display:flex;gap:7px;justify-content:center;margin-top:36px}
#lpc .dots i{height:3px;width:8px;border-radius:2px;background:var(--gold);opacity:.35;transition:all .5s}
#lpc .dots i.on{width:24px;opacity:1}
#lpc .shead{max-width:640px;margin-bottom:52px}
#lpc .shead h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,4vw,2.8rem);line-height:1.15;margin:14px 0 0;letter-spacing:-.01em}
#lpc .shead p{color:var(--muted);font-weight:300;margin-top:16px;font-size:1.05rem;line-height:1.6}
#lpc .center{text-align:center;margin-left:auto;margin-right:auto}
#lpc .siggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
#lpc .sig{position:relative;overflow:hidden;border-radius:18px;padding:22px;background:var(--card);border:1px solid var(--line);min-height:150px;transition:transform .4s}
#lpc .sig:hover{transform:translateY(-5px)}
#lpc .sig .ic{width:42px;height:42px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:19px;background:#fff;border:1px solid;margin-bottom:14px}
#lpc .sig h3{font-family:var(--serif);font-weight:400;font-size:1.12rem}
#lpc .sig p{font-size:.8rem;color:var(--muted);margin-top:3px}
#lpc .sig .sweep{position:absolute;inset:0;transform:translateX(-120%);pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)}
#lpc .sig:hover .sweep{animation:lpcsweep 1.1s cubic-bezier(.16,1,.3,1)}
@keyframes lpcsweep{to{transform:translateX(120%)}}
#lpc .reading{margin:40px auto 0;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,4vw,44px);max-width:760px}
#lpc .reading .tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--gold);border:1px solid rgba(194,161,91,.3);border-radius:999px;padding:5px 12px;margin-bottom:20px}
#lpc .reading h3{font-family:var(--serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;margin-bottom:8px}
#lpc .reading .lo{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px}
@media(max-width:640px){#lpc .reading .lo{grid-template-columns:1fr}}
#lpc .reading .lo .k{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;font-weight:600}
#lpc .reading .lo .v{font-size:.92rem;color:var(--muted);line-height:1.6}
#lpc .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:760px){#lpc .steps{grid-template-columns:1fr}}
#lpc .step{border-top:2px solid var(--gold);padding-top:22px}
#lpc .step .n{font-family:var(--serif);font-size:2.4rem;color:var(--gold);line-height:1}
#lpc .step h3{font-family:var(--serif);font-size:1.4rem;font-weight:400;margin:10px 0 8px}
#lpc .step p{color:var(--muted);font-size:.92rem;line-height:1.6}
#lpc .step .free{display:inline-block;margin-top:12px;font-size:11px;font-weight:600;color:var(--sage);border:1px solid rgba(143,169,155,.4);border-radius:999px;padding:3px 10px}
#lpc .refuge{background:var(--night);color:#EDE9DF;overflow:hidden}
#lpc .refuge canvas{position:absolute;inset:0;z-index:0;opacity:.5}
#lpc .refuge .wrap{position:relative;z-index:1}
#lpc .refuge .eyebrow{color:var(--sage)}
#lpc .refuge h2{color:#F3EFE5}
#lpc .refuge .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:44px}
#lpc .refuge .rc{background:var(--night-2);border:1px solid rgba(237,233,223,.08);border-radius:18px;padding:24px}
#lpc .refuge .rc .ic{font-size:24px}
#lpc .refuge .rc h3{font-family:var(--serif);font-weight:400;font-size:1.25rem;margin:14px 0 8px;color:#F3EFE5}
#lpc .refuge .rc p{font-size:.9rem;color:rgba(237,233,223,.55);line-height:1.6}
#lpc .refuge .quote{font-family:var(--serif);font-style:italic;font-size:clamp(1.3rem,3vw,2rem);color:var(--sage);max-width:22ch;line-height:1.3}
#lpc .ugrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
#lpc .u{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;transition:transform .3s}
#lpc .u:hover{transform:translateY(-4px)}
#lpc .u .ic{font-size:22px}
#lpc .u h3{font-size:.95rem;font-weight:600;margin:12px 0 4px}
#lpc .u p{font-size:.8rem;color:var(--muted);line-height:1.5}
#lpc .trin{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
@media(max-width:760px){#lpc .trin{grid-template-columns:1fr}}
#lpc .tp{text-align:center}
#lpc .tp .av{width:74px;height:74px;border-radius:999px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.6rem;color:#fff;overflow:hidden}
#lpc .tp .av img{width:100%;height:100%;object-fit:cover}
#lpc .tp h3{font-family:var(--serif);font-size:1.4rem;font-weight:400}
#lpc .tp .role{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin:4px 0 12px}
#lpc .tp p{font-size:.9rem;color:var(--muted);line-height:1.6;max-width:30ch;margin:0 auto}
#lpc .tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
#lpc .tc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:0 20px 50px -34px rgba(120,95,45,.3);display:flex;flex-direction:column;gap:16px}
#lpc .tc .txt{font-style:italic;font-size:.98rem;line-height:1.6}
#lpc .tc .who{display:flex;align-items:center;gap:11px;margin-top:auto}
#lpc .tc .av{width:34px;height:34px;border-radius:999px;background:#F0E7D3;color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600}
#lpc .tc .who span{font-size:13px;color:var(--muted)}
#lpc .price{display:grid;grid-template-columns:1fr 1.15fr;gap:20px;max-width:820px;margin:0 auto}
@media(max-width:680px){#lpc .price{grid-template-columns:1fr}}
#lpc .pc{border-radius:24px;padding:32px;border:1px solid var(--line);background:var(--card)}
#lpc .pc.feat{border:1.5px solid var(--gold);background:linear-gradient(160deg,#FBF4E4,var(--card));position:relative}
#lpc .pc .pl{font-family:var(--serif);font-size:1.3rem}
#lpc .pc .amt{font-family:var(--serif);font-size:2.6rem;margin:8px 0}
#lpc .pc .amt small{font-size:1rem;color:var(--muted)}
#lpc .pc ul{list-style:none;margin:18px 0 24px;display:flex;flex-direction:column;gap:10px}
#lpc .pc li{font-size:.9rem;color:var(--muted);padding-left:22px;position:relative}
#lpc .pc li::before{content:"\\2726";position:absolute;left:0;color:var(--gold)}
#lpc .pc .badge{position:absolute;top:-11px;right:24px;background:var(--gold);color:#2a2318;font-size:10px;font-weight:700;letter-spacing:.1em;padding:4px 12px;border-radius:999px}
#lpc .oneshot{text-align:center;margin-top:22px;font-size:.86rem;color:var(--muted)}
#lpc .faqbox{max-width:680px;margin:0 auto}
#lpc .qi{border-bottom:1px solid var(--line)}
#lpc .qi button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;background:none;border:0;cursor:pointer;padding:22px 0;text-align:left;font-family:var(--serif);font-size:clamp(1.02rem,2vw,1.25rem);color:var(--ink)}
#lpc .qi .pl{color:var(--gold);font-size:22px;transition:transform .4s cubic-bezier(.16,1,.3,1)}
#lpc .qi.open .pl{transform:rotate(45deg)}
#lpc .qi .ans{max-height:0;overflow:hidden;transition:max-height .55s cubic-bezier(.16,1,.3,1)}
#lpc .qi.open .ans{max-height:300px}
#lpc .qi .ans p{padding:0 0 22px;color:var(--muted);font-weight:300;line-height:1.65;font-size:.96rem}
#lpc .final{background:#FDFBF6;text-align:center}
#lpc .final h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.8rem,4.4vw,3rem);line-height:1.18;max-width:20ch;margin:0 auto 14px}
#lpc .final .disc{font-family:var(--serif);font-style:italic;color:var(--gold);font-size:clamp(1.3rem,3vw,2rem);margin-bottom:38px}
#lpc footer{text-align:center;padding:44px;color:var(--muted);font-size:12px;position:relative;z-index:1}
@media(prefers-reduced-motion:reduce){#lpc *{animation:none!important}#lpc.anim .rv{transition:none;opacity:1;transform:none}}
`

const SIG = [
  ["L'Analyste", "L'Architecture Mentale", '🧠', '#74C0FC'],
  ["L'Électron Libre", 'En Mouvement', '⚡', '#FF8C42'],
  ['Le Pilier', 'Symbiotique', '💗', '#E879A8'],
  ['La Citadelle', 'Citadelle', '🏰', '#8B9DC3'],
  ['Le Gardien du Cadre', 'Du Contrôle', '🛡️', '#A3BE8C'],
  ['Le Caméléon', 'Adaptative', '🦎', '#C4A0E8'],
  ['La Vigie', "D'Anticipation", '🔭', '#E5B93D'],
  ["L'Idéaliste", 'Des Profondeurs', '✨', '#FF6B9D'],
  ['Le Diplomate', "De l'Harmonie", '🕊️', '#88D8B0'],
  ['Le Catalyseur', "De l'Intensité", '🔥', '#FF5E5B'],
]
const REF = [
  ['🔥', 'Le Feu de Camp', "Une communauté vivante, 24h/24. Des membres qui comprennent vraiment — parce qu'ils traversent la même chose."],
  ['✉️', 'Le Courrier Anonyme', 'Écris ce que tu ne peux dire à personne. Reçois une réponse humaine et bienveillante.'],
  ['🤝', 'Les Rayons', "Des connexions choisies entre membres. Tu n'avances plus seule."],
  ['🆘', 'Bouton crise', 'Un accès immédiat quand tout vacille. Toujours à portée.'],
]
const UNI = [
  ['📚', 'Encyclopédie', '200+ protocoles, chaque expérience décodée'],
  ['🎬', 'Shine TV', 'Vidéos & soins guidés par Julia'],
  ['🎧', 'Shine Audible', 'Méditations & podcasts à emporter'],
  ['📖', 'Shine Librairie', 'eBooks, guides & rituels'],
  ['📱', 'Shine Shorts', 'Capsules bien-être express'],
  ['✍️', 'Blog', 'Articles pour comprendre en profondeur'],
  ['📅', 'Événements live', 'Rendez-vous collectifs & retraites'],
  ['🌙', 'Météo énergétique', 'Ton climat intérieur, chaque jour'],
]
const TRIN = [
  ['Julia', 'Le Pilier Énergétique', 'Autrice du livre fondateur. Elle reconnecte chacun à sa vibration authentique.', '#C2A15B', '/images/julia.jpeg'],
  ['William', 'Le Pilier Corporel', 'Hypnothérapeute, médecine chinoise. Il déconstruit les blocages ancrés dans le corps.', '#8FA99B', null],
  ['Thomas', 'Le Pilier Pratique', "Protocoles d'action concrets. Il transforme la prise de conscience en résultats.", '#8B9DC3', null],
]
const ST = [
  ['Camille', '41 ans · Lyon', "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais."],
  ['Sophie', '34 ans · Paris', "10 ans en thérapie. Et en 3 minutes, j'ai compris un truc que personne n'avait réussi à me dire."],
  ['Nadia', '29 ans · Marseille', "Mon couple a changé. Parce que j'ai arrêté de rejouer le même film."],
  ['Marc', '45 ans · Bordeaux', 'Ma femme et moi avons fait le test séparément. On a compris 12 ans de conflit en 10 minutes.'],
  ['Marie', '38 ans · Bordeaux', 'Je recommençais tout, tout le temps. Maintenant je le vois venir.'],
  ['Léa', '26 ans · Nantes', "Le Courrier Anonyme m'a sauvée un dimanche soir à 23h."],
]
const FAQ = [
  ["C'est vraiment gratuit ?", 'Oui. 100% gratuit. Aucune carte bancaire pour faire le test et recevoir ta Signature.'],
  ['Combien de temps ça prend ?', 'Entre 3 et 5 minutes. Résultat immédiat.'],
  ["C'est de la psychologie sérieuse ?", "C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Un outil de prise de conscience, pas un test clinique validé."],
  ["Et si je ne suis pas prête pour un abonnement ?", 'Tu restes en gratuit aussi longtemps que tu veux. Ou tu débloques un seul protocole complet pour 33€.'],
  ['Que se passe-t-il après le test ?', 'Tu reçois ta Signature personnalisée et ton protocole recommandé, adapté à ton profil.'],
]
const IDENT = [
  'Tu donnes toujours plus que les autres.',
  'Tu culpabilises facilement.',
  'Tu cherches à sauver tout le monde.',
  'Tu veux être parfaite.',
  "Tu fais semblant d'aller bien.",
  'Tu comprends tout… mais rien ne change.',
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'qi rv' + (open ? ' open' : '')}>
      <button onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span className="pl">+</span>
      </button>
      <div className="ans"><p>{a}</p></div>
    </div>
  )
}

export default function LandingClaude() {
  useEffect(() => {
    const root = document.getElementById('lpc')
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cleanups: Array<() => void> = []

    const revealAll = () => root.querySelectorAll('.rv').forEach((e) => e.classList.add('in'))
    if (!reduce) root.classList.add('anim')
    const safety = setTimeout(revealAll, 4000)
    cleanups.push(() => clearTimeout(safety))

    // Canvas waves
    function wave(cv: HTMLCanvasElement | null, deep: boolean) {
      if (!cv) return
      try {
        const ctx = cv.getContext('2d')
        if (!ctx) return
        let raf = 0, w = 0, h = 0
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
        const rs = () => {
          const r = cv.getBoundingClientRect()
          w = r.width || window.innerWidth; h = r.height || window.innerHeight
          cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        const d = (t: number) => {
          ctx.clearRect(0, 0, w, h)
          m.x += (m.tx - m.x) * 0.04; m.y += (m.ty - m.y) * 0.04
          const time = t * 0.00015, L = deep ? 4 : 6
          for (let i = 0; i < L; i++) {
            const p = i / (L - 1), yB = h * (0.2 + p * 0.62) + (m.y - 0.5) * 26 * (p - 0.5)
            const amp = (22 + i * 9) * (0.7 + m.y * 0.5), fr = 0.0015 + i * 0.00035
            const ph = time * (1 + i * 0.24) + i * 0.9 + m.x * 1.2
            const rgb = deep ? (i % 2 ? '143,169,155' : '194,161,91') : (i % 3 === 2 ? '143,169,155' : '194,161,91')
            const a = deep ? 0.16 : 0.075
            ctx.beginPath()
            for (let x = -20; x <= w + 20; x += 14) {
              const y = yB + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 0.5 + ph * 1.7) * amp * 0.35
              if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y)
            }
            const g = ctx.createLinearGradient(0, 0, w, 0)
            g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.5, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`)
            ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke()
          }
          raf = requestAnimationFrame(d)
        }
        const onMove = (e: MouseEvent) => { m.tx = e.clientX / window.innerWidth; m.ty = e.clientY / window.innerHeight }
        window.addEventListener('resize', rs); window.addEventListener('mousemove', onMove)
        rs(); if (reduce) d(0); else raf = requestAnimationFrame(d)
        cleanups.push(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', rs); window.removeEventListener('mousemove', onMove) })
      } catch { /* noop */ }
    }
    wave(root.querySelector<HTMLCanvasElement>('#lpcbg'), false)
    wave(root.querySelector<HTMLCanvasElement>('#lpcrefuge'), true)

    // Hero letter reveal
    const title = root.querySelector<HTMLElement>('#lpctitle')
    if (title) {
      const cs = Array.from(title.textContent || '')
      title.innerHTML = cs.map((c) => `<span class="w"><span>${c === ' ' ? '&nbsp;' : c}</span></span>`).join('')
      const to = setTimeout(() => {
        title.classList.add('play')
        title.querySelectorAll<HTMLElement>('.w span').forEach((s, i) => {
          s.style.transitionDelay = (0.25 + i * 0.028 + Math.sin((i / cs.length) * Math.PI) * 0.12) + 's'
        })
      }, 80)
      cleanups.push(() => clearTimeout(to))
    }

    // Reveals
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.2 })
    root.querySelectorAll('.rv').forEach((e) => io.observe(e))
    cleanups.push(() => io.disconnect())

    // Identification cycler (letter morph)
    const el = root.querySelector<HTMLElement>('#lpcident')
    const dots = root.querySelector<HTMLElement>('#lpcidentDots')
    if (el && dots) {
      IDENT.forEach((_, i) => { const dd = document.createElement('i'); if (!i) dd.className = 'on'; dots.appendChild(dd) })
      const render = (txt: string) => {
        el.innerHTML = Array.from(txt).map((c, i) => {
          const dir = i % 2 ? -1 : 1
          return `<span style="display:inline-block;white-space:pre;opacity:0;filter:blur(11px);transform:translateY(${dir * 15}px);transition:all .5s cubic-bezier(.16,1,.3,1) ${i * 0.018}s">${c === ' ' ? '&nbsp;' : c}</span>`
        }).join('')
        requestAnimationFrame(() => el.querySelectorAll<HTMLElement>('span').forEach((s) => { s.style.opacity = '1'; s.style.filter = 'none'; s.style.transform = 'none' }))
      }
      render(IDENT[0])
      let i = 0, timer = 0
      const step = () => {
        el.querySelectorAll<HTMLElement>('span').forEach((s, k) => { const dir = k % 2 ? 1 : -1; s.style.opacity = '0'; s.style.filter = 'blur(11px)'; s.style.transform = `translateY(${dir * 15}px)` })
        setTimeout(() => { i = (i + 1) % IDENT.length; render(IDENT[i]); dots.querySelectorAll('i').forEach((dd, k) => (dd.className = k === i ? 'on' : '')) }, 500)
      }
      const identObs = new IntersectionObserver((e) => { if (e[0].isIntersecting && !timer) timer = window.setInterval(step, 2700) }, { threshold: 0.4 })
      identObs.observe(el)
      cleanups.push(() => { identObs.disconnect(); if (timer) clearInterval(timer) })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <div id="lpc">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <canvas id="lpcbg" />

      <div className="bar">
        <div className="brand">SOS <b>Shine</b></div>
        <div className="actions">
          <a className="ghost" href="https://julialaureau.com" target="_blank" rel="noopener noreferrer">Julia Laureau ↗</a>
          <a className="btn" href={QUIZ_URL}>Faire le test</a>
        </div>
      </div>

      {/* HERO */}
      <section className="hero"><div className="wrap"><div className="hero-grid">
        <div>
          <p className="eyebrow" style={{ marginBottom: 22 }}>Signature Émotionnelle · Gratuit</p>
          <h1 id="lpctitle">Tu n&apos;es peut-être pas la personne que tu crois être.</h1>
          <p className="sub">Tu es peut-être devenue la personne que ton cerveau a appris à protéger. En 3 minutes, découvre la phrase qui te dirige sans que tu le saches.</p>
          <div className="hero-cta">
            <a className="btn big pulse" href={QUIZ_URL}>Découvrir ma Signature →</a>
            <a className="btn ghost2 big" href="https://julialaureau.com" target="_blank" rel="noopener noreferrer">Rendez-vous avec Julia ↗</a>
          </div>
          <p className="microproof">12 questions · résultat immédiat · aucune carte bancaire</p>
        </div>
        <div className="portrait"><img src="/images/julia.jpeg" alt="Julia Laureau" /></div>
      </div></div></section>

      {/* IDENTIFICATION */}
      <section className="ident"><div className="wrap">
        <p className="eyebrow rv" style={{ marginBottom: 10 }}>Est-ce que ça te parle&nbsp;?</p>
        <div className="stage"><p className="phrase" id="lpcident">Tu donnes toujours plus que les autres.</p></div>
        <div className="dots" id="lpcidentDots" />
      </div></section>

      {/* SIGNATURES */}
      <section><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">La précision qui fait « c&apos;est moi »</p>
          <h2>10 Signatures. Une seule est la tienne.</h2>
          <p>Pas un test rigolo. Un modèle issu de milliers d&apos;accompagnements : ta Signature révèle ta lumière, ton ombre, et le protocole fait pour toi.</p>
        </div>
        <div className="siggrid">
          {SIG.map((s, i) => (
            <div className="sig rv" key={i} style={{ transitionDelay: `${(i % 5) * 0.05}s` }}>
              <span className="sweep" />
              <span className="ic" style={{ borderColor: `${s[3]}55` }}>{s[2]}</span>
              <h3>{s[0]}</h3><p>{s[1]}</p>
            </div>
          ))}
        </div>
        <div className="reading rv">
          <span className="tag">◆ Exemple de lecture — Le Pilier</span>
          <h3>« Ton cœur a une antenne ultra-sensible. »</h3>
          <p className="muted" style={{ fontSize: '.95rem', lineHeight: 1.6 }}>Face à l&apos;incertitude, ton réflexe est de prendre soin de l&apos;autre, d&apos;harmoniser, de porter.</p>
          <div className="lo">
            <div><p className="k">Ta lumière</p><p className="v">Une empathie rare. Tu crées des espaces de sécurité. Tu es le ciment de tes relations.</p></div>
            <div><p className="k">Ton ombre</p><p className="v">Tu oublies tes limites. Tu endosses le rôle du sauveur — jusqu&apos;à te vider de ton énergie.</p></div>
          </div>
        </div>
      </div></section>

      {/* METHOD */}
      <section><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">La méthode</p>
          <h2>Comprendre ne suffit pas. Il faut libérer, puis agir.</h2>
          <p>Chaque protocole se vit en 3 étapes. La première est toujours offerte.</p>
        </div>
        <div className="steps">
          <div className="step rv"><div className="n">01</div><h3>Comprendre</h3><p>Identifier le schéma inconscient qui pilote tes réactions. Une lecture précise de ce qui se joue en toi depuis toujours.</p><span className="free">Gratuit</span></div>
          <div className="step rv"><div className="n">02</div><h3>Libérer &amp; intégrer</h3><p>Décharger l&apos;émotion stockée dans le corps. Respiration, libération somatique, ce qui doit sortir sort.</p></div>
          <div className="step rv"><div className="n">03</div><h3>Agir</h3><p>Reprogrammer l&apos;automatisme. Miroir, ancrage, rituel quotidien. Un nouveau réflexe remplace l&apos;ancien.</p></div>
        </div>
      </div></section>

      {/* REFUGE */}
      <section className="refuge">
        <canvas id="lpcrefuge" />
        <div className="wrap">
          <div className="shead rv">
            <p className="eyebrow">Le refuge</p>
            <h2>Tu n&apos;es plus jamais seule à 3h du matin.</h2>
          </div>
          <p className="quote rv">« Le Courrier Anonyme m&apos;a sauvée un dimanche soir à 23h. Quelqu&apos;un a répondu. »</p>
          <div className="rgrid">
            {REF.map((r, i) => (
              <div className="rc rv" key={i}><div className="ic">{r[0]}</div><h3>{r[1]}</h3><p>{r[2]}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIVERSE */}
      <section><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">Tout un monde</p>
          <h2>Pas du contenu. Un écosystème pour te transformer.</h2>
        </div>
        <div className="ugrid">
          {UNI.map((u, i) => (
            <div className="u rv" key={i}><div className="ic">{u[0]}</div><h3>{u[1]}</h3><p>{u[2]}</p></div>
          ))}
        </div>
      </div></section>

      {/* TRINITY */}
      <section><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">Des humains, pas un algorithme</p>
          <h2>Trois piliers. Une seule mission.</h2>
          <p>Tout a commencé par un livre&nbsp;: <em>SOS Shine — Briller Comme un Diamant</em>, écrit par Julia. Puis William et Thomas l&apos;ont rejointe.</p>
        </div>
        <div className="trin">
          {TRIN.map((t, i) => (
            <div className="tp rv" key={i}>
              <div className="av" style={{ background: t[3] as string }}>
                {t[4] ? <img src={t[4] as string} alt={t[0] as string} /> : (t[0] as string).charAt(0)}
              </div>
              <h3>{t[0]}</h3><div className="role">{t[1]}</div><p>{t[2]}</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* TESTIMONIALS */}
      <section><div className="wrap">
        <div className="shead center rv"><p className="eyebrow">Elles se sont reconnues</p><h2>Avant. Le déclic. Aujourd&apos;hui.</h2></div>
        <div className="tgrid">
          {ST.map((s, i) => (
            <div className="tc rv" key={i}>
              <p className="txt">«&nbsp;{s[2]}&nbsp;»</p>
              <div className="who"><span className="av">{(s[0] as string).charAt(0)}</span><span>{s[0]} · {s[1]}</span></div>
            </div>
          ))}
        </div>
      </div></section>

      {/* PRICING */}
      <section><div className="wrap">
        <div className="shead center rv"><p className="eyebrow">Transparent, sans piège</p><h2>Commence gratuitement. Reste si ça te transforme.</h2></div>
        <div className="price rv">
          <div className="pc">
            <div className="pl">Gratuit</div>
            <div className="amt">0€</div>
            <ul><li>Quiz &amp; ta Signature</li><li>Étape 1 de ton protocole</li><li>Communauté &amp; Mur</li><li>Shine Audible</li></ul>
            <a className="btn ghost2" href={QUIZ_URL} style={{ width: '100%', justifyContent: 'center' }}>Créer mon compte</a>
          </div>
          <div className="pc feat">
            <span className="badge">7 JOURS OFFERTS</span>
            <div className="pl">SOS Shine</div>
            <div className="amt">29,90€ <small>/mois</small></div>
            <ul><li>Encyclopédie complète — 200+ protocoles</li><li>Le Refuge : Feu de Camp 24/7 + Courrier Anonyme</li><li>Shine TV, Shorts, Audible, Librairie</li><li>Événements &amp; sessions live</li><li>Protocole complet (étapes 1 → 3)</li></ul>
            <a className="btn" href="/rejoindre" style={{ width: '100%', justifyContent: 'center' }}>Essayer 7 jours gratuit</a>
          </div>
        </div>
        <p className="oneshot rv">Pas prête pour l&apos;abonnement&nbsp;? Débloque les étapes 2 &amp; 3 d&apos;un protocole en accès unique — <b>33€</b>.</p>
      </div></section>

      {/* FAQ */}
      <section><div className="wrap">
        <div className="shead center rv"><h2>Questions fréquentes</h2></div>
        <div className="faqbox">
          {FAQ.map((f, i) => <FaqItem key={i} q={f[0]} a={f[1]} />)}
        </div>
      </div></section>

      {/* FINAL */}
      <section className="final"><div className="wrap">
        <h2 className="rv">Et si cette phrase que tu cherches depuis des années était déjà en toi&nbsp;?</h2>
        <p className="disc rv">Découvre-la.</p>
        <div className="rv"><a className="btn big pulse" href={QUIZ_URL}>Faire le test gratuit →</a></div>
      </div></section>

      <footer>© {new Date().getFullYear()} SOS Shine — Briller comme un diamant</footer>
    </div>
  )
}
