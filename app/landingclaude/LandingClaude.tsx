'use client'

/**
 * /landingclaude — Page d'accueil produit (façon Calm / Gaia).
 * Présente LA PLATEFORME : le principe, ce qu'on fait, ce qu'on propose.
 * Scopé sous #lpc. Contenu réel de la plateforme.
 */

import { useEffect, useState } from 'react'

const QUIZ_URL = '/signature-emotionnelle?start=1'
const JOIN_URL = '/rejoindre'

const CSS = `
#lpc{--paper:#F5F1E9;--card:#FCFAF5;--ink:#1F1D26;--gold:#C2A15B;--sage:#8FA99B;--muted:#847C6E;--line:rgba(31,29,38,.1);--night:#181922;--night-2:#20222E;--serif:Georgia,'Times New Roman',serif;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
#lpc *{box-sizing:border-box;margin:0;padding:0}
#lpc canvas#lpcbg{position:fixed;inset:0;z-index:0;pointer-events:none}
#lpc .eyebrow{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);font-weight:600}
#lpc .muted{color:var(--muted)}
#lpc a{color:inherit;text-decoration:none}
#lpc .wrap{max-width:1120px;margin:0 auto;padding:0 28px}
#lpc section{position:relative;z-index:1;padding:clamp(72px,11vh,130px) 0}
#lpc .bar{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px 24px;backdrop-filter:blur(12px);background:rgba(245,241,233,.75);border-bottom:1px solid var(--line)}
#lpc .bar .brand{font-family:var(--serif);font-size:19px}
#lpc .bar .brand b{color:var(--gold)}
#lpc .bar .nav{display:flex;align-items:center;gap:22px}
#lpc .bar .nav a{font-size:13.5px;color:var(--muted)}
#lpc .bar .nav a.only-lg{display:inline}
@media(max-width:720px){#lpc .bar .nav a.only-lg{display:none}}
#lpc .btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer;border:0;background:linear-gradient(135deg,var(--gold),#D8BE82);color:#2a2318;box-shadow:0 8px 28px -10px rgba(194,161,91,.6);transition:transform .3s}
#lpc .btn:hover{transform:scale(1.04)}
#lpc .btn.big{padding:16px 34px;font-size:15px}
#lpc .btn.ghost2{background:transparent;border:1px solid var(--line);color:var(--ink);box-shadow:none}
#lpc .btn.pulse{animation:lpcpulse 3.6s ease-in-out infinite}
@keyframes lpcpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
#lpc.anim .rv{opacity:0;transform:translateY(22px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)}
#lpc.anim .rv.in{opacity:1;transform:none}
/* HERO */
#lpc .hero{min-height:96vh;display:flex;align-items:center;padding-top:118px}
#lpc .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;width:100%}
@media(max-width:880px){#lpc .hero-grid{grid-template-columns:1fr;gap:44px}}
#lpc h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.2rem,5.4vw,4rem);line-height:1.07;letter-spacing:-.015em}
#lpc h1 .w{display:inline-block;overflow:hidden;vertical-align:bottom}
#lpc.anim h1 .w span{display:inline-block;transform:translateY(105%);opacity:0}
#lpc.anim h1.play .w span{transform:none;opacity:1;transition:all 1s cubic-bezier(.16,1,.3,1)}
#lpc .sub{font-size:clamp(1.02rem,1.7vw,1.28rem);color:var(--muted);max-width:42ch;margin:26px 0 32px;font-weight:300;line-height:1.7}
#lpc .hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
#lpc .microproof{font-size:12.5px;color:var(--muted);margin-top:18px;display:flex;gap:14px;flex-wrap:wrap}
#lpc .microproof b{color:var(--ink);font-weight:600}
/* SHOWCASE (mock produit) */
#lpc .showcase{position:relative;height:clamp(360px,50vw,460px)}
#lpc .sc-card{position:absolute;background:var(--card);border:1px solid var(--line);border-radius:22px;box-shadow:0 30px 80px -40px rgba(120,95,45,.5);padding:22px}
#lpc .sc-main{left:6%;top:8%;width:74%;animation:lpcfloat 8s ease-in-out infinite}
#lpc .sc-badge{display:inline-block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);border:1px solid rgba(194,161,91,.3);border-radius:999px;padding:4px 10px;margin-bottom:14px}
#lpc .sc-main h4{font-family:var(--serif);font-weight:400;font-size:1.5rem;display:flex;align-items:center;gap:10px}
#lpc .sc-main .em{width:38px;height:38px;border-radius:999px;background:#FADCE7;display:flex;align-items:center;justify-content:center;font-size:19px}
#lpc .sc-main .line{height:8px;border-radius:6px;background:linear-gradient(90deg,rgba(194,161,91,.35),rgba(194,161,91,.08));margin-top:14px}
#lpc .sc-steps{right:4%;bottom:5%;width:60%;animation:lpcfloat 8s ease-in-out infinite;animation-delay:.8s}
#lpc .sc-steps .st{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:.86rem}
#lpc .sc-steps .st:last-child{border-bottom:0}
#lpc .sc-steps .n{width:24px;height:24px;border-radius:999px;background:var(--gold);color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
#lpc .sc-steps .n.lock{background:transparent;border:1px solid var(--line);color:var(--muted)}
@keyframes lpcfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
/* section head */
#lpc .shead{max-width:660px;margin-bottom:52px}
#lpc .shead h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.75rem,4vw,2.9rem);line-height:1.14;margin:14px 0 0;letter-spacing:-.01em}
#lpc .shead p{color:var(--muted);font-weight:300;margin-top:16px;font-size:1.06rem;line-height:1.65}
#lpc .center{text-align:center;margin-left:auto;margin-right:auto}
/* how it works */
#lpc .how{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
@media(max-width:760px){#lpc .how{grid-template-columns:1fr}}
#lpc .hc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px}
#lpc .hc .n{font-family:var(--serif);font-size:2.2rem;color:var(--gold);line-height:1}
#lpc .hc h3{font-family:var(--serif);font-size:1.35rem;font-weight:400;margin:12px 0 8px}
#lpc .hc p{color:var(--muted);font-size:.92rem;line-height:1.6}
/* features (produit) */
#lpc .fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
#lpc .f{position:relative;overflow:hidden;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;transition:transform .35s}
#lpc .f:hover{transform:translateY(-5px)}
#lpc .f .ic{font-size:26px}
#lpc .f h3{font-family:var(--serif);font-weight:400;font-size:1.3rem;margin:14px 0 7px}
#lpc .f p{color:var(--muted);font-size:.9rem;line-height:1.6}
#lpc .f .tag{display:inline-block;margin-top:14px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);background:rgba(194,161,91,.1);border-radius:999px;padding:4px 10px}
/* signatures */
#lpc .siggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:13px}
#lpc .sig{position:relative;overflow:hidden;border-radius:16px;padding:20px;background:var(--card);border:1px solid var(--line);min-height:130px;transition:transform .35s}
#lpc .sig:hover{transform:translateY(-4px)}
#lpc .sig .ic{width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:18px;background:#fff;border:1px solid;margin-bottom:12px}
#lpc .sig h3{font-family:var(--serif);font-weight:400;font-size:1.05rem}
#lpc .sig p{font-size:.76rem;color:var(--muted);margin-top:3px}
#lpc .sig .sweep{position:absolute;inset:0;transform:translateX(-120%);pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)}
#lpc .sig:hover .sweep{animation:lpcsweep 1.1s cubic-bezier(.16,1,.3,1)}
@keyframes lpcsweep{to{transform:translateX(120%)}}
/* refuge */
#lpc .refuge{background:var(--night);color:#EDE9DF;overflow:hidden}
#lpc .refuge canvas{position:absolute;inset:0;z-index:0;opacity:.5}
#lpc .refuge .wrap{position:relative;z-index:1}
#lpc .refuge .eyebrow{color:var(--sage)}
#lpc .refuge h2{color:#F3EFE5}
#lpc .refuge .shead p{color:rgba(237,233,223,.6)}
#lpc .refuge .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:20px}
#lpc .refuge .rc{background:var(--night-2);border:1px solid rgba(237,233,223,.08);border-radius:18px;padding:24px}
#lpc .refuge .rc .ic{font-size:24px}
#lpc .refuge .rc h3{font-family:var(--serif);font-weight:400;font-size:1.25rem;margin:14px 0 8px;color:#F3EFE5}
#lpc .refuge .rc p{font-size:.9rem;color:rgba(237,233,223,.55);line-height:1.6}
/* team (petit) */
#lpc .team{display:flex;flex-wrap:wrap;gap:26px;justify-content:center;align-items:flex-start}
#lpc .tp{text-align:center;max-width:240px}
#lpc .tp .av{width:66px;height:66px;border-radius:999px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.5rem;color:#fff;overflow:hidden}
#lpc .tp .av img{width:100%;height:100%;object-fit:cover}
#lpc .tp h3{font-family:var(--serif);font-size:1.25rem;font-weight:400}
#lpc .tp .role{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin:4px 0 10px}
#lpc .tp p{font-size:.85rem;color:var(--muted);line-height:1.55}
/* testimonials */
#lpc .tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
#lpc .tc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:0 20px 50px -34px rgba(120,95,45,.3);display:flex;flex-direction:column;gap:16px}
#lpc .tc .txt{font-style:italic;font-size:.98rem;line-height:1.6}
#lpc .tc .who{display:flex;align-items:center;gap:11px;margin-top:auto}
#lpc .tc .av{width:34px;height:34px;border-radius:999px;background:#F0E7D3;color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600}
#lpc .tc .who span{font-size:13px;color:var(--muted)}
/* pricing */
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
/* faq */
#lpc .faqbox{max-width:680px;margin:0 auto}
#lpc .qi{border-bottom:1px solid var(--line)}
#lpc .qi button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;background:none;border:0;cursor:pointer;padding:22px 0;text-align:left;font-family:var(--serif);font-size:clamp(1.02rem,2vw,1.25rem);color:var(--ink)}
#lpc .qi .pl{color:var(--gold);font-size:22px;transition:transform .4s cubic-bezier(.16,1,.3,1)}
#lpc .qi.open .pl{transform:rotate(45deg)}
#lpc .qi .ans{max-height:0;overflow:hidden;transition:max-height .55s cubic-bezier(.16,1,.3,1)}
#lpc .qi.open .ans{max-height:320px}
#lpc .qi .ans p{padding:0 0 22px;color:var(--muted);font-weight:300;line-height:1.65;font-size:.96rem}
/* final */
#lpc .final{background:#FDFBF6;text-align:center}
#lpc .final h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.8rem,4.4vw,3rem);line-height:1.18;max-width:22ch;margin:0 auto 26px}
#lpc footer{text-align:center;padding:44px;color:var(--muted);font-size:12px;position:relative;z-index:1}
@media(prefers-reduced-motion:reduce){#lpc *{animation:none!important}#lpc.anim .rv{transition:none;opacity:1;transform:none}}
`

const HOW = [
  ['01', 'Révèle ta Signature', 'Un test de 3 minutes révèle le schéma émotionnel inconscient qui pilote tes réactions. Gratuit, résultat immédiat.'],
  ['02', 'Suis ton protocole', 'Un parcours guidé en 3 étapes — Comprendre, Libérer, Agir — conçu pour ton profil. La première étape est offerte.'],
  ['03', 'Ne reste jamais seule', 'Une communauté 24/7, des contenus illimités et des rendez-vous en direct pour ancrer le changement dans la durée.'],
]
const FEAT = [
  ['🧭', 'Signature Émotionnelle', 'Un test qui décode ton fonctionnement profond et te donne une carte pour te comprendre.', 'Gratuit'],
  ['📚', 'Encyclopédie', 'De A à Z, chaque expérience émotionnelle décodée en protocole guidé.', '200+ protocoles'],
  ['🎬', 'Shine TV', 'Vidéos & soins guidés, chaque semaine.', null],
  ['🎧', 'Shine Audible', 'Méditations, podcasts & libérations sonores à emporter partout.', null],
  ['📖', 'Shine Librairie', 'eBooks, guides et rituels à ton rythme.', null],
  ['📱', 'Shine Shorts', 'Des capsules bien-être express pour les jours pressés.', null],
  ['🔥', 'Le Feu de Camp', 'Une communauté bienveillante, active 24h/24.', '24/7'],
  ['📅', 'Événements live', 'Sessions collectives et retraites en présentiel.', null],
]
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
  ['✉️', 'Le Courrier Anonyme', 'Écris ce que tu ne peux dire à personne. Reçois une réponse humaine et bienveillante.'],
  ['🤝', 'Les Rayons', "Des connexions choisies entre membres. Tu n'avances plus seule."],
  ['🌙', 'Météo énergétique', 'Ton climat intérieur, chaque jour, pour t\'accompagner.'],
  ['🆘', 'Soutien de crise', 'Un accès immédiat quand tout vacille. Toujours à portée.'],
]
const TEAM = [
  ['Julia', 'Fondatrice · Énergie', "Autrice du livre fondateur, elle a créé la méthode SOS Shine.", '#C2A15B', '/images/julia.jpeg'],
  ['William', 'Corps', 'Hypnothérapeute, médecine chinoise. Il déconstruit les blocages du corps.', '#8FA99B', null],
  ['Thomas', 'Pratique', "Protocoles d'action concrets. Il transforme la prise de conscience en résultats.", '#8B9DC3', null],
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
  ["C'est quoi SOS Shine, concrètement ?", "Une plateforme de déconditionnement émotionnel : un test qui révèle ta Signature, des protocoles guidés pour te transformer, une bibliothèque de contenus et une communauté. Le tout au même endroit."],
  ["C'est vraiment gratuit pour commencer ?", 'Oui. Le test, ta Signature et la première étape de ton protocole sont 100% gratuits, sans carte bancaire.'],
  ['Combien de temps ça prend ?', 'Le test dure 3 à 5 minutes, avec un résultat immédiat. Ensuite, tu avances à ton rythme.'],
  ["C'est de la psychologie sérieuse ?", "C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Un outil de prise de conscience, pas un test clinique validé."],
  ['Combien ça coûte ensuite ?', "L'abonnement SOS Shine est à 29,90€/mois (7 jours offerts) et donne accès à tout. Tu peux aussi débloquer un seul protocole complet pour 33€."],
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'qi rv' + (open ? ' open' : '')}>
      <button onClick={() => setOpen((o) => !o)}>
        <span>{q}</span><span className="pl">+</span>
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

    function wave(cv: HTMLCanvasElement | null, deep: boolean) {
      if (!cv) return
      try {
        const ctx = cv.getContext('2d'); if (!ctx) return
        let raf = 0, w = 0, h = 0
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
        const rs = () => { const r = cv.getBoundingClientRect(); w = r.width || window.innerWidth; h = r.height || window.innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
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
            for (let x = -20; x <= w + 20; x += 14) { const y = yB + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 0.5 + ph * 1.7) * amp * 0.35; if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y) }
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

    const title = root.querySelector<HTMLElement>('#lpctitle')
    if (title) {
      // Découpe par MOTS (ponctuation soudée au mot) puis lettres à l'intérieur,
      // pour que les retours à la ligne ne se fassent qu'entre les mots.
      const words = (title.textContent || '').split(' ')
      const total = words.join('').length
      title.innerHTML = words
        .map((word) => `<span class="w">${Array.from(word).map((c) => `<span>${c}</span>`).join('')}</span>`)
        .join(' ')
      const to = setTimeout(() => {
        title.classList.add('play')
        title.querySelectorAll<HTMLElement>('.w span').forEach((s, i) => { s.style.transitionDelay = (0.25 + i * 0.026 + Math.sin((i / total) * Math.PI) * 0.12) + 's' })
      }, 80)
      cleanups.push(() => clearTimeout(to))
    }

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.18 })
    root.querySelectorAll('.rv').forEach((e) => io.observe(e))
    cleanups.push(() => io.disconnect())

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <div id="lpc">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <canvas id="lpcbg" />

      <div className="bar">
        <div className="brand">SOS <b>Shine</b></div>
        <div className="nav">
          <a className="only-lg" href="#comment">Comment ça marche</a>
          <a className="only-lg" href="#plateforme">La plateforme</a>
          <a className="only-lg" href="#tarifs">Tarifs</a>
          <a className="btn" href={QUIZ_URL}>Faire le test</a>
        </div>
      </div>

      {/* HERO — produit */}
      <section className="hero"><div className="wrap"><div className="hero-grid">
        <div>
          <p className="eyebrow" style={{ marginBottom: 22 }}>Plateforme de déconditionnement émotionnel</p>
          <h1 id="lpctitle">Comprends tes émotions. Transforme tes schémas.</h1>
          <p className="sub">SOS Shine réunit un test qui révèle ta Signature Émotionnelle, des protocoles guidés pour te transformer, une bibliothèque de contenus et une communauté qui ne dort jamais. Commence gratuitement.</p>
          <div className="hero-cta">
            <a className="btn big pulse" href={QUIZ_URL}>Découvrir ma Signature →</a>
            <a className="btn ghost2 big" href="#plateforme">Explorer la plateforme</a>
          </div>
          <p className="microproof"><span><b>Gratuit</b> pour commencer</span><span>·</span><span><b>3 min</b> de test</span><span>·</span><span>Sans carte bancaire</span></p>
        </div>

        {/* mock produit */}
        <div className="showcase">
          <div className="sc-card sc-main">
            <span className="sc-badge">Ta Signature Émotionnelle</span>
            <h4><span className="em">💗</span> Le Pilier</h4>
            <div className="line" style={{ width: '90%' }} />
            <div className="line" style={{ width: '72%' }} />
            <div className="line" style={{ width: '80%' }} />
          </div>
          <div className="sc-card sc-steps">
            <div className="st"><span className="n">1</span> Comprendre</div>
            <div className="st"><span className="n lock">2</span> Libérer &amp; intégrer</div>
            <div className="st"><span className="n lock">3</span> Agir</div>
          </div>
        </div>
      </div></div></section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment"><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">Le principe</p>
          <h2>Une méthode claire, en trois temps.</h2>
          <p>Pas de théorie infinie. Tu comprends, tu libères, tu agis — accompagnée à chaque étape.</p>
        </div>
        <div className="how">
          {HOW.map((h, i) => (
            <div className="hc rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="n">{h[0]}</div><h3>{h[1]}</h3><p>{h[2]}</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* LA PLATEFORME */}
      <section id="plateforme"><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">La plateforme</p>
          <h2>Tout ce dont tu as besoin, au même endroit.</h2>
          <p>Un écosystème complet pour comprendre, apaiser et transformer — pas juste du contenu à consommer.</p>
        </div>
        <div className="fgrid">
          {FEAT.map((f, i) => (
            <div className="f rv" key={i} style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
              <div className="ic">{f[0]}</div>
              <h3>{f[1]}</h3><p>{f[2]}</p>
              {f[3] && <span className="tag">{f[3]}</span>}
            </div>
          ))}
        </div>
      </div></section>

      {/* SIGNATURES */}
      <section><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">Personnalisé</p>
          <h2>10 Signatures. Une seule est la tienne.</h2>
          <p>Ta Signature révèle ta lumière, ton ombre et le protocole fait pour toi. C&apos;est le point de départ de tout ton parcours.</p>
        </div>
        <div className="siggrid">
          {SIG.map((s, i) => (
            <div className="sig rv" key={i} style={{ transitionDelay: `${(i % 5) * 0.04}s` }}>
              <span className="sweep" />
              <span className="ic" style={{ borderColor: `${s[3]}55` }}>{s[2]}</span>
              <h3>{s[0]}</h3><p>{s[1]}</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* REFUGE */}
      <section className="refuge">
        <canvas id="lpcrefuge" />
        <div className="wrap">
          <div className="shead rv">
            <p className="eyebrow">Une communauté, pas une app de plus</p>
            <h2>Tu n&apos;es plus jamais seule.</h2>
            <p>Là où les autres plateformes te laissent seule face à ton écran, SOS Shine te connecte à des humains — à toute heure.</p>
          </div>
          <div className="rgrid">
            {REF.map((r, i) => (
              <div className="rc rv" key={i}><div className="ic">{r[0]}</div><h3>{r[1]}</h3><p>{r[2]}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
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

      {/* TARIFS */}
      <section id="tarifs"><div className="wrap">
        <div className="shead center rv"><p className="eyebrow">Transparent, sans piège</p><h2>Commence gratuitement. Reste si ça te transforme.</h2></div>
        <div className="price rv">
          <div className="pc">
            <div className="pl">Gratuit</div>
            <div className="amt">0€</div>
            <ul><li>Test &amp; ta Signature</li><li>Étape 1 de ton protocole</li><li>Communauté &amp; Mur</li><li>Shine Audible</li></ul>
            <a className="btn ghost2" href={QUIZ_URL} style={{ width: '100%', justifyContent: 'center' }}>Créer mon compte</a>
          </div>
          <div className="pc feat">
            <span className="badge">7 JOURS OFFERTS</span>
            <div className="pl">SOS Shine</div>
            <div className="amt">29,90€ <small>/mois</small></div>
            <ul><li>Encyclopédie complète — 200+ protocoles</li><li>Communauté &amp; Courrier Anonyme</li><li>Shine TV, Shorts, Audible, Librairie</li><li>Événements &amp; sessions live</li><li>Protocole complet (étapes 1 → 3)</li></ul>
            <a className="btn" href={JOIN_URL} style={{ width: '100%', justifyContent: 'center' }}>Essayer 7 jours gratuit</a>
          </div>
        </div>
        <p className="oneshot rv">Pas prête pour l&apos;abonnement&nbsp;? Débloque les étapes 2 &amp; 3 d&apos;un protocole en accès unique — <b>33€</b>.</p>
      </div></section>

      {/* L'ÉQUIPE (petit) */}
      <section><div className="wrap">
        <div className="shead center rv">
          <p className="eyebrow">Derrière la plateforme</p>
          <h2>Une méthode née d&apos;un livre et de milliers de rencontres.</h2>
        </div>
        <div className="team">
          {TEAM.map((t, i) => (
            <div className="tp rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="av" style={{ background: t[3] as string }}>
                {t[4] ? <img src={t[4] as string} alt={t[0] as string} /> : (t[0] as string).charAt(0)}
              </div>
              <h3>{t[0]}</h3><div className="role">{t[1]}</div><p>{t[2]}</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* FAQ */}
      <section><div className="wrap">
        <div className="shead center rv"><h2>Questions fréquentes</h2></div>
        <div className="faqbox">{FAQ.map((f, i) => <FaqItem key={i} q={f[0]} a={f[1]} />)}</div>
      </div></section>

      {/* FINAL */}
      <section className="final"><div className="wrap">
        <h2 className="rv">Ton schéma émotionnel se révèle en 3 minutes. Et si tu commençais&nbsp;?</h2>
        <div className="rv"><a className="btn big pulse" href={QUIZ_URL}>Découvrir ma Signature →</a></div>
      </div></section>

      <footer>© {new Date().getFullYear()} SOS Shine — Plateforme de déconditionnement émotionnel</footer>
    </div>
  )
}
