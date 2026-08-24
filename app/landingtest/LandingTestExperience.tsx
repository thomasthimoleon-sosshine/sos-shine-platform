'use client'

/**
 * /landingtest — Homepage produit orientée conversion.
 * Direction : universelle, chaleureuse, premium, pleine d'espoir.
 * Palette crème / or (shine) / teal profond. Mobile-first, reveals subtils.
 * Tout scopé sous #lt. Routes réelles + lien Amazon du livre.
 */

import { useEffect, useState } from 'react'

const TEST_URL = '/signature-emotionnelle?start=1'
const JOIN_URL = '/rejoindre'
const EVENT_URL = '/event'
const BOOK_URL = 'https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807'

const CSS = `
#lt{--cream:#FAF6EF;--card:#FFFFFF;--card2:#FCF8F1;--ink:#23201B;--gold:#C79A3D;--gold-2:#D8B65E;--teal:#215E58;--teal-d:#184B46;--muted:#7C7466;--line:rgba(35,32,27,.1);--serif:Georgia,'Times New Roman',serif;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--cream);color:var(--ink);font-family:var(--sans);line-height:1.55;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
#lt *{box-sizing:border-box;margin:0;padding:0}
#lt a{color:inherit;text-decoration:none}
#lt img{max-width:100%;display:block}
#lt .wrap{max-width:1140px;margin:0 auto;padding:0 22px}
#lt section{position:relative;padding:clamp(64px,9vh,110px) 0}
#lt .eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);font-weight:700}
#lt .muted{color:var(--muted)}
#lt h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,4vw,2.7rem);line-height:1.16;letter-spacing:-.01em}
#lt h3{font-family:var(--serif);font-weight:400}
#lt .shead{max-width:660px;margin:0 auto 46px;text-align:center}
#lt .shead h2{margin-top:12px}
#lt .shead p{color:var(--muted);margin-top:14px;font-size:1.05rem;font-weight:300;line-height:1.65}
/* buttons */
#lt .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border-radius:999px;padding:14px 26px;font-size:15px;font-weight:600;cursor:pointer;border:0;background:linear-gradient(135deg,var(--gold),var(--gold-2));color:#2b220e;box-shadow:0 10px 30px -12px rgba(199,154,61,.6);transition:transform .25s,box-shadow .25s}
#lt .btn:hover{transform:translateY(-2px);box-shadow:0 16px 38px -14px rgba(199,154,61,.7)}
#lt .btn:focus-visible{outline:3px solid rgba(33,94,88,.5);outline-offset:2px}
#lt .btn.sm{padding:10px 20px;font-size:14px}
#lt .btn.ghost{background:transparent;border:1px solid var(--line);color:var(--ink);box-shadow:none}
#lt .btn.teal{background:linear-gradient(135deg,var(--teal),var(--teal-d));color:#F3EEE4;box-shadow:0 10px 30px -12px rgba(33,94,88,.55)}
#lt .btn.pulse{animation:ltpulse 3.4s ease-in-out infinite}
@keyframes ltpulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
/* reveal */
#lt.anim .rv{opacity:0;transform:translateY(20px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
#lt.anim .rv.in{opacity:1;transform:none}
/* 1. banner */
#lt .banner{background:linear-gradient(90deg,var(--teal),var(--teal-d));color:#F3EEE4;font-size:13px;text-align:center;padding:9px 16px;position:relative;z-index:60}
#lt .banner a{font-weight:600;text-decoration:underline;text-underline-offset:2px}
#lt .banner .pill{display:inline-block;background:rgba(255,255,255,.15);border-radius:999px;padding:2px 9px;margin-right:8px;font-weight:700;font-size:11px;letter-spacing:.04em}
/* 2. nav */
#lt .nav{position:sticky;top:0;z-index:50;background:rgba(250,246,239,.95);border-bottom:1px solid var(--line)}
#lt .nav .inner{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;max-width:1140px;margin:0 auto}
#lt .nav .logo{font-family:var(--serif);font-size:20px}
#lt .nav .logo b{color:var(--gold)}
#lt .nav .links{display:flex;align-items:center;gap:24px}
#lt .nav .links a{font-size:13.5px;color:var(--muted);transition:color .2s}
#lt .nav .links a:hover{color:var(--ink)}
#lt .nav .links a.hide{display:inline}
@media(max-width:900px){#lt .nav .links a.hide{display:none}}
/* 3. hero */
#lt .hero{padding-top:clamp(48px,7vh,80px)}
#lt .hero .grid{display:grid;grid-template-columns:1.08fr .92fr;gap:52px;align-items:center}
@media(max-width:880px){#lt .hero .grid{grid-template-columns:1fr;gap:40px;text-align:center}}
#lt .hero h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.2rem,5.4vw,3.9rem);line-height:1.08;letter-spacing:-.015em}
#lt .hero h1 em{font-style:italic;color:var(--gold)}
#lt .hero .sub{font-size:clamp(1.02rem,1.7vw,1.25rem);color:var(--muted);max-width:44ch;margin:24px 0 30px;font-weight:300;line-height:1.7}
@media(max-width:880px){#lt .hero .sub{margin-left:auto;margin-right:auto}}
#lt .hero .cta{display:flex;flex-wrap:wrap;gap:14px}
@media(max-width:880px){#lt .hero .cta{justify-content:center}}
#lt .hero .trust{margin-top:20px;font-size:12.5px;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap;align-items:center}
@media(max-width:880px){#lt .hero .trust{justify-content:center}}
#lt .hero .trust b{color:var(--ink)}
/* hero visual — carte signature */
#lt .visual{position:relative;min-height:clamp(340px,48vw,440px)}
#lt .blob{position:absolute;border-radius:50%;filter:blur(46px);opacity:.5;z-index:0}
#lt .card-sig{position:relative;z-index:1;background:var(--card);border:1px solid var(--line);border-radius:24px;box-shadow:0 40px 90px -50px rgba(120,90,30,.5);padding:26px;max-width:340px;margin:0 auto}
#lt .card-sig .top{display:flex;align-items:center;gap:13px}
#lt .card-sig .em{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#FADCE7,#F6C9D9);display:flex;align-items:center;justify-content:center;font-size:26px}
#lt .card-sig .lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700}
#lt .card-sig .nm{font-family:var(--serif);font-size:1.5rem;margin-top:2px}
#lt .card-sig .bars{margin-top:18px;display:flex;flex-direction:column;gap:9px}
#lt .card-sig .bar{height:9px;border-radius:6px;background:linear-gradient(90deg,rgba(199,154,61,.35),rgba(199,154,61,.06))}
#lt .card-sig .foot{margin-top:20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:14px;font-size:12px;color:var(--muted)}
#lt .card-sig .foot b{color:var(--teal)}
/* generic grids */
#lt .cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:820px){#lt .cards3{grid-template-columns:1fr}}
#lt .cards4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:900px){#lt .cards4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){#lt .cards4{grid-template-columns:1fr}}
/* 4. empathy */
#lt .emp{background:var(--card2)}
#lt .ec{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px;transition:transform .3s,box-shadow .3s}
#lt .ec:hover{transform:translateY(-4px);box-shadow:0 24px 50px -34px rgba(120,90,30,.35)}
#lt .ec .ic{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--card2)}
#lt .ec h3{font-size:1.3rem;margin:16px 0 8px}
#lt .ec p{color:var(--muted);font-size:.94rem;line-height:1.6}
#lt .ec .hope{margin-top:12px;font-size:.9rem;color:var(--teal);font-weight:500}
/* 5. signature */
#lt .sigwrap{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
@media(max-width:880px){#lt .sigwrap{grid-template-columns:1fr;gap:36px}}
#lt .sigchips{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}
#lt .chip{display:inline-flex;align-items:center;gap:7px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 14px;font-size:13px}
#lt .sig-illus{position:relative;background:linear-gradient(160deg,#F3EADA,#EAD9B6);border:1px solid var(--line);border-radius:26px;padding:34px;min-height:300px;display:flex;flex-direction:column;justify-content:center;gap:14px;overflow:hidden}
#lt .sig-illus .ring{position:absolute;border:1px solid rgba(199,154,61,.3);border-radius:50%}
#lt .sig-illus .q{font-family:var(--serif);font-style:italic;font-size:1.4rem;position:relative;z-index:1}
#lt .sig-illus .lo{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:16px}
#lt .sig-illus .lo .k{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700}
#lt .sig-illus .lo .v{font-size:.86rem;color:#5b544733;color:#6a6153;line-height:1.5;margin-top:4px}
/* 6. how */
#lt .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;counter-reset:s}
@media(max-width:820px){#lt .steps{grid-template-columns:1fr}}
#lt .stp{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px;position:relative}
#lt .stp .n{font-family:var(--serif);font-size:2rem;color:var(--gold)}
#lt .stp h3{font-size:1.3rem;margin:10px 0 8px}
#lt .stp p{color:var(--muted);font-size:.92rem;line-height:1.6}
#lt .stp .free{display:inline-block;margin-top:12px;font-size:11px;font-weight:700;color:var(--teal);border:1px solid rgba(33,94,88,.3);border-radius:999px;padding:3px 10px}
/* 7. platform */
#lt .plat{background:var(--card2)}
#lt .pf{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;transition:transform .3s}
#lt .pf:hover{transform:translateY(-4px)}
#lt .pf .ic{font-size:24px}
#lt .pf h3{font-size:1.15rem;margin:12px 0 6px}
#lt .pf p{color:var(--muted);font-size:.86rem;line-height:1.55}
#lt .pf .tag{display:inline-block;margin-top:12px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);background:rgba(199,154,61,.1);border-radius:999px;padding:3px 9px}
/* 8. testimonials */
#lt .rating{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:34px}
#lt .rating .stars{color:var(--gold);font-size:20px;letter-spacing:3px}
#lt .rating .val{font-size:13px;color:var(--muted)}
#lt .tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:900px){#lt .tgrid{grid-template-columns:1fr}}
#lt .tc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 50px -36px rgba(120,90,30,.3)}
#lt .tc .st{color:var(--gold);font-size:13px;letter-spacing:2px}
#lt .tc .txt{font-style:italic;font-size:.98rem;line-height:1.6}
#lt .tc .who{display:flex;align-items:center;gap:11px;margin-top:auto}
#lt .tc .av{width:38px;height:38px;border-radius:999px;background:#F0E7D3;color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700}
#lt .tc .who span{font-size:13px;color:var(--muted)}
/* 9. creators */
#lt .crt{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:820px){#lt .crt{grid-template-columns:1fr}}
#lt .cc{text-align:center}
#lt .cc .av{width:96px;height:96px;border-radius:50%;margin:0 auto 16px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2rem;color:#fff;border:2px solid rgba(199,154,61,.3)}
#lt .cc .av img{width:100%;height:100%;object-fit:cover}
#lt .cc h3{font-size:1.35rem}
#lt .cc .role{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin:5px 0 12px;font-weight:700}
#lt .cc p{color:var(--muted);font-size:.9rem;line-height:1.6;max-width:30ch;margin:0 auto}
/* 10. pricing */
#lt .price{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}
@media(max-width:860px){#lt .price{grid-template-columns:1fr}}
#lt .pc{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:30px;display:flex;flex-direction:column}
#lt .pc.feat{border:2px solid var(--gold);box-shadow:0 30px 70px -40px rgba(199,154,61,.5);position:relative}
#lt .pc .badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:#2b220e;font-size:10px;font-weight:800;letter-spacing:.1em;padding:5px 14px;border-radius:999px}
#lt .pc .pl{font-family:var(--serif);font-size:1.35rem}
#lt .pc .amt{font-family:var(--serif);font-size:2.4rem;margin:8px 0}
#lt .pc .amt small{font-size:1rem;color:var(--muted)}
#lt .pc ul{list-style:none;margin:16px 0 22px;display:flex;flex-direction:column;gap:9px;flex:1}
#lt .pc li{font-size:.88rem;color:var(--muted);padding-left:22px;position:relative}
#lt .pc li::before{content:"✓";position:absolute;left:0;color:var(--teal);font-weight:700}
/* 11. cannes */
#lt .cannes{background:linear-gradient(150deg,var(--teal),var(--teal-d));color:#F3EEE4;overflow:hidden}
#lt .cannes .inner{display:grid;grid-template-columns:1.2fr .8fr;gap:36px;align-items:center}
@media(max-width:820px){#lt .cannes .inner{grid-template-columns:1fr;text-align:center}}
#lt .cannes .eyebrow{color:var(--gold-2)}
#lt .cannes h2{color:#FBF7EE}
#lt .cannes p{color:rgba(243,238,228,.72);margin:14px 0 24px;font-weight:300;line-height:1.65}
#lt .cannes .meta{display:flex;flex-direction:column;gap:12px}
@media(max-width:820px){#lt .cannes .meta{align-items:center}}
#lt .cannes .meta div{display:flex;align-items:center;gap:10px;font-size:14px}
#lt .cannes .meta .ic{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center}
/* 12. faq */
#lt .faqbox{max-width:720px;margin:0 auto}
#lt .qi{border-bottom:1px solid var(--line)}
#lt .qi button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;background:none;border:0;cursor:pointer;padding:22px 0;text-align:left;font-family:var(--serif);font-size:clamp(1.02rem,2vw,1.25rem);color:var(--ink)}
#lt .qi button:focus-visible{outline:2px solid var(--teal);outline-offset:3px}
#lt .qi .pl{color:var(--gold);font-size:24px;transition:transform .35s cubic-bezier(.16,1,.3,1)}
#lt .qi.open .pl{transform:rotate(45deg)}
#lt .qi .ans{max-height:0;overflow:hidden;transition:max-height .5s cubic-bezier(.16,1,.3,1)}
#lt .qi.open .ans{max-height:320px}
#lt .qi .ans p{padding:0 0 22px;color:var(--muted);font-weight:300;line-height:1.65;font-size:.96rem}
/* 13. final */
#lt .final{text-align:center;background:var(--card2)}
#lt .final h2{max-width:22ch;margin:0 auto 12px}
#lt .final p{color:var(--muted);margin-bottom:28px;font-weight:300}
/* 14. footer */
#lt .foot{background:var(--ink);color:#E7E1D5;padding:52px 0 34px}
#lt .foot .cols{display:flex;flex-wrap:wrap;gap:34px;justify-content:space-between}
#lt .foot .logo{font-family:var(--serif);font-size:22px}
#lt .foot .logo b{color:var(--gold-2)}
#lt .foot .col h4{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-2);margin-bottom:14px}
#lt .foot .col a{display:block;font-size:13.5px;color:rgba(231,225,213,.65);margin-bottom:9px;transition:color .2s}
#lt .foot .col a:hover{color:#fff}
#lt .foot .bottom{border-top:1px solid rgba(231,225,213,.12);margin-top:36px;padding-top:22px;font-size:12px;color:rgba(231,225,213,.45);text-align:center}
@media(prefers-reduced-motion:reduce){#lt *{animation:none!important}#lt.anim .rv{transition:none;opacity:1;transform:none}}
`

const EMP = [
  ['💛', 'En amour', 'Tu attires les mêmes histoires, tu donnes trop, ou tu gardes tes distances sans vraiment savoir pourquoi.', 'Et si ce n\'était pas toi, mais un schéma appris&nbsp;?'],
  ['💼', 'Au travail', 'Tu en fais toujours plus, tu doutes de ta valeur, ou tu n\'oses pas prendre ta place.', 'Ce réflexe a une origine — et il se transforme.'],
  ['🌙', 'Fatigue émotionnelle', 'Tu comprends tout de toi… mais tu te sens épuisée, comme si rien ne changeait vraiment.', 'Comprendre ne suffit pas. On va plus loin.'],
]
const SIGCHIPS = ['🧠 L\'Analyste', '💗 Le Pilier', '🏰 La Citadelle', '⚡ L\'Électron Libre', '🦎 Le Caméléon', '🔥 Le Catalyseur']
const HOW = [
  ['01', 'Passe le test', 'Réponds à 12 questions, en 3 minutes. Aucune bonne ou mauvaise réponse — juste toi.', 'Gratuit · sans carte'],
  ['02', 'Reçois ta Signature', 'Ta lumière, ton ombre, et la phrase inconsciente qui te dirige. Immédiatement.', null],
  ['03', 'Suis ton protocole', 'Un parcours guidé fait pour ton profil : comprendre, libérer, puis agir — à ton rythme.', null],
]
const PLAT = [
  ['📚', 'Encyclopédie', 'De A à Z, chaque expérience émotionnelle décodée en protocole guidé.', '200+ protocoles'],
  ['🔥', 'Communauté', 'Un Feu de Camp permanent. Des membres qui comprennent vraiment.', '24/7'],
  ['✉️', 'Courrier Anonyme', 'Exprime ce que tu ne dis à personne. Reçois une réponse bienveillante.', 'Anonyme'],
  ['🎬', 'Contenu exclusif', 'Shine TV, méditations, podcasts, livres. Un accès illimité.', 'Illimité'],
]
const TESTI = [
  ['Camille', '41 ans · Lyon', "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais."],
  ['Sophie', '34 ans · Paris', "10 ans en thérapie. Et en 3 minutes, j'ai compris un truc que personne n'avait réussi à me dire."],
  ['Nadia', '29 ans · Marseille', "Mon couple a changé. Pas parce que lui a changé — parce que j'ai arrêté de rejouer le même film."],
]
const CREATORS = [
  ['Julia', 'Fondatrice · Énergie', "Autrice du livre fondateur de SOS Shine. Elle a créé la méthode et reconnecte chacun à sa vibration authentique.", '#C79A3D', '/images/julia.jpeg'],
  ['William', 'Corps', 'Hypnothérapeute, diplômé en médecine chinoise. Il déconstruit les blocages ancrés dans le corps.', '#215E58', null],
  ['Thomas', 'Pratique', "Protocoles d'action concrets. Il transforme la prise de conscience en résultats tangibles.", '#8B9DC3', null],
]
const FAQ = [
  ["C'est vraiment gratuit ?", 'Oui. Le test et ta Signature Émotionnelle sont 100% gratuits, sans carte bancaire.'],
  ['Combien de temps ça prend ?', 'Environ 3 minutes. Tu reçois ton résultat immédiatement.'],
  ["Dois-je m'inscrire pour commencer ?", 'Non. Tu commences tout de suite. On te demande ton email à mi-parcours pour t\'envoyer ton résultat.'],
  ["C'est de la psychologie sérieuse ?", "C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Un outil de prise de conscience profonde, pas un test clinique validé."],
  ['Combien coûte l\'abonnement ensuite ?', "49,90€/mois, sans engagement, pour tout débloquer. Ou 33€ en accès unique pour un protocole complet. Tu restes en gratuit aussi longtemps que tu veux."],
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'qi rv' + (open ? ' open' : '')}>
      <button aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span dangerouslySetInnerHTML={{ __html: q }} />
        <span className="pl" aria-hidden>+</span>
      </button>
      <div className="ans"><p dangerouslySetInnerHTML={{ __html: a }} /></div>
    </div>
  )
}

export default function LandingTestExperience() {
  useEffect(() => {
    const root = document.getElementById('lt')
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) root.classList.add('anim')
    const revealAll = () => root.querySelectorAll('.rv').forEach((e) => e.classList.add('in'))
    const safety = setTimeout(revealAll, 3500)
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.14 })
    root.querySelectorAll('.rv').forEach((e) => io.observe(e))
    return () => { clearTimeout(safety); io.disconnect() }
  }, [])

  return (
    <div id="lt">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* 1. BANNIÈRE URGENCE */}
      <div className="banner">
        <span className="pill">C&apos;est demain</span>
        Événement SOS Shine — Plage du Palm Beach, Cannes. <a href={EVENT_URL}>Réserver ma place →</a>
      </div>

      {/* 2. NAV STICKY */}
      <nav className="nav">
        <div className="inner">
          <a className="logo" href="#top">SOS <b>Shine</b></a>
          <div className="links">
            <a className="hide" href={TEST_URL}>Découvrir ma Signature</a>
            <a className="hide" href="#comment">Comment ça marche</a>
            <a className="hide" href="#plateforme">La Plateforme</a>
            <a className="hide" href="#temoignages">Témoignages</a>
            <a className="hide" href="#tarifs">Tarifs</a>
            <a className="btn sm" href={TEST_URL}>Faire le test</a>
          </div>
        </div>
      </nav>

      {/* 3. HERO */}
      <section className="hero" id="top"><div className="wrap"><div className="grid">
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Signature Émotionnelle · Gratuit</p>
          <h1>Et si la phrase qui te protège depuis toujours <em>dirigeait encore ta vie</em>&nbsp;?</h1>
          <p className="sub">Nous portons tous un schéma émotionnel inconscient — appris tôt, pour nous protéger. Il façonne notre amour, notre travail, notre énergie. En 3 minutes, découvre le tien.</p>
          <div className="cta">
            <a className="btn pulse" href={TEST_URL}>Découvrir ma Signature →</a>
            <a className="btn ghost" href="#comment">▶&nbsp; Comment ça marche</a>
          </div>
          <div className="trust">
            <span><b>Gratuit</b> · sans carte bancaire</span>
            <span>·</span>
            <span><b>3 min</b> · résultat immédiat</span>
          </div>
        </div>
        <div className="visual">
          <div className="blob" style={{ width: 240, height: 240, top: '4%', right: '8%', background: '#F6C9D9' }} />
          <div className="blob" style={{ width: 200, height: 200, bottom: '2%', left: '4%', background: '#CDE3DF' }} />
          <div className="card-sig">
            <div className="top">
              <span className="em">💗</span>
              <div><span className="lbl">Ta Signature Émotionnelle</span><div className="nm">Le Pilier</div></div>
            </div>
            <div className="bars">
              <div className="bar" style={{ width: '92%' }} />
              <div className="bar" style={{ width: '74%' }} />
              <div className="bar" style={{ width: '84%' }} />
            </div>
            <div className="foot"><span>Protocole recommandé</span><span><b>Étape 1 offerte</b></span></div>
          </div>
        </div>
      </div></div></section>

      {/* 4. EMPATHIE */}
      <section className="emp"><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">Ça te parle&nbsp;?</p>
          <h2>Tes schémas se rejouent partout. Sans que tu les voies.</h2>
        </div>
        <div className="cards3">
          {EMP.map((e, i) => (
            <div className="ec rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="ic">{e[0]}</div>
              <h3>{e[1]}</h3>
              <p dangerouslySetInnerHTML={{ __html: e[2] }} />
              <p className="hope" dangerouslySetInnerHTML={{ __html: e[3] }} />
            </div>
          ))}
        </div>
      </div></section>

      {/* 5. SIGNATURE ÉMOTIONNELLE */}
      <section><div className="wrap"><div className="sigwrap">
        <div className="rv">
          <p className="eyebrow">La clé de tout</p>
          <h2 style={{ margin: '12px 0 16px' }}>Ta Signature Émotionnelle</h2>
          <p className="muted" style={{ fontWeight: 300, lineHeight: 1.7, fontSize: '1.05rem' }}>
            C&apos;est le schéma inconscient — souvent résumé par une seule phrase — que ton cerveau a construit très tôt pour te protéger. Il pilote encore aujourd&apos;hui tes réactions, tes choix, tes relations. Le révéler, c&apos;est reprendre les commandes.
          </p>
          <div className="sigchips">
            {SIGCHIPS.map((c, i) => <span className="chip" key={i}>{c}</span>)}
          </div>
          <div style={{ marginTop: 26 }}><a className="btn" href={TEST_URL}>Révéler ma Signature →</a></div>
        </div>
        <div className="sig-illus rv">
          <div className="ring" style={{ width: 260, height: 260, top: -60, right: -60 }} />
          <div className="ring" style={{ width: 160, height: 160, bottom: -40, left: -30 }} />
          <p className="q">« Ton cœur a une antenne ultra-sensible. »</p>
          <div className="lo">
            <div><div className="k">Ta lumière</div><div className="v">Une empathie rare. Tu crées des espaces de sécurité pour les autres.</div></div>
            <div><div className="k">Ton ombre</div><div className="v">Tu t&apos;oublies. Tu portes tout — jusqu&apos;à t&apos;épuiser.</div></div>
          </div>
        </div>
      </div></div></section>

      {/* 6. COMMENT ÇA MARCHE */}
      <section id="comment"><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">Simple</p>
          <h2>Trois étapes vers toi-même.</h2>
        </div>
        <div className="steps">
          {HOW.map((h, i) => (
            <div className="stp rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="n">{h[0]}</div>
              <h3>{h[1]}</h3>
              <p>{h[2]}</p>
              {h[3] && <span className="free">{h[3]}</span>}
            </div>
          ))}
        </div>
        <div className="rv" style={{ textAlign: 'center', marginTop: 40 }}><a className="btn pulse" href={TEST_URL}>Commencer gratuitement →</a></div>
      </div></section>

      {/* 7. LA PLATEFORME */}
      <section className="plat" id="plateforme"><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">Bien plus qu&apos;un test</p>
          <h2>Une plateforme complète pour te transformer.</h2>
          <p>Le test n&apos;est que le début. Ensuite, tout un écosystème t&apos;accompagne.</p>
        </div>
        <div className="cards4">
          {PLAT.map((p, i) => (
            <div className="pf rv" key={i} style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
              <div className="ic">{p[0]}</div>
              <h3>{p[1]}</h3>
              <p>{p[2]}</p>
              <span className="tag">{p[3]}</span>
            </div>
          ))}
        </div>
      </div></section>

      {/* 8. TÉMOIGNAGES */}
      <section id="temoignages"><div className="wrap">
        <div className="rating rv">
          <div className="stars" aria-hidden>★★★★★</div>
          <div className="val"><b>4,9/5</b> — des milliers de personnes se sont reconnues</div>
        </div>
        <div className="tgrid">
          {TESTI.map((t, i) => (
            <div className="tc rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="st" aria-hidden>★★★★★</div>
              <p className="txt">«&nbsp;{t[2]}&nbsp;»</p>
              <div className="who"><span className="av">{(t[0] as string).charAt(0)}</span><span>{t[0]} · {t[1]}</span></div>
            </div>
          ))}
        </div>
      </div></section>

      {/* 9. CRÉATEURS */}
      <section><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">Derrière SOS Shine</p>
          <h2>Une méthode née d&apos;un livre et de milliers de rencontres.</h2>
        </div>
        <div className="crt">
          {CREATORS.map((c, i) => (
            <div className="cc rv" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="av" style={{ background: c[3] as string }}>
                {c[4] ? <img src={c[4] as string} alt={`Portrait de ${c[0]}`} /> : (c[0] as string).charAt(0)}
              </div>
              <h3>{c[0]}</h3>
              <div className="role">{c[1]}</div>
              <p>{c[2]}</p>
            </div>
          ))}
        </div>
        <div className="rv" style={{ textAlign: 'center', marginTop: 36 }}>
          <a className="btn ghost" href={BOOK_URL} target="_blank" rel="noopener noreferrer">📖&nbsp; Le livre fondateur sur Amazon ↗</a>
        </div>
      </div></section>

      {/* 10. TARIFS */}
      <section id="tarifs"><div className="wrap">
        <div className="shead rv">
          <p className="eyebrow">Sans engagement</p>
          <h2>Commence gratuitement.</h2>
          <p>Le test est offert. Tu ne paies que si tu choisis d&apos;aller plus loin.</p>
        </div>
        <div className="price">
          <div className="pc feat rv">
            <span className="badge">COMMENCE ICI</span>
            <div className="pl">Test gratuit</div>
            <div className="amt">0€</div>
            <ul>
              <li>Ta Signature Émotionnelle complète</li>
              <li>Étape 1 de ton protocole</li>
              <li>Communauté &amp; Mur</li>
              <li>Shine Audible (méditations)</li>
            </ul>
            <a className="btn" href={TEST_URL} style={{ width: '100%' }}>Faire le test →</a>
          </div>
          <div className="pc rv" style={{ transitionDelay: '.08s' }}>
            <div className="pl">Abonnement</div>
            <div className="amt">49,90€ <small>/mois</small></div>
            <ul>
              <li>Encyclopédie — 200+ protocoles</li>
              <li>Communauté &amp; Courrier Anonyme</li>
              <li>Shine TV, Shorts, Audible, Librairie</li>
              <li>Événements &amp; lives · Sans engagement</li>
            </ul>
            <a className="btn teal" href={JOIN_URL} style={{ width: '100%' }}>Commencer maintenant</a>
          </div>
          <div className="pc rv" style={{ transitionDelay: '.16s' }}>
            <div className="pl">À la carte</div>
            <div className="amt">33€ <small>/ protocole</small></div>
            <ul>
              <li>Un protocole complet</li>
              <li>Les étapes 2 &amp; 3 débloquées</li>
              <li>Accès à vie à ce protocole</li>
              <li>Sans abonnement</li>
            </ul>
            <a className="btn ghost" href={TEST_URL} style={{ width: '100%' }}>Choisir mon protocole</a>
          </div>
        </div>
      </div></section>

      {/* 11. ÉVÉNEMENT CANNES */}
      <section className="cannes"><div className="wrap"><div className="inner">
        <div className="rv">
          <p className="eyebrow">Événement · C&apos;est demain</p>
          <h2>Rencontre SOS Shine à Cannes.</h2>
          <p>Une parenthèse pour se reconnecter, en vrai. Sur la plage du Palm Beach, entourée de personnes qui vivent le même chemin que toi.</p>
          <a className="btn" href={EVENT_URL}>Réserver ma place →</a>
        </div>
        <div className="meta rv">
          <div><span className="ic">📍</span> Plage du Palm Beach, Cannes</div>
          <div><span className="ic">📅</span> Demain · 13 juillet</div>
          <div><span className="ic">✨</span> Places limitées</div>
        </div>
      </div></div></section>

      {/* 12. FAQ */}
      <section><div className="wrap">
        <div className="shead rv"><h2>Questions fréquentes</h2></div>
        <div className="faqbox">{FAQ.map((f, i) => <FaqItem key={i} q={f[0]} a={f[1]} />)}</div>
      </div></section>

      {/* 13. CTA FINAL */}
      <section className="final"><div className="wrap">
        <p className="eyebrow rv">Ton point de départ</p>
        <h2 className="rv" style={{ marginTop: 12 }}>Ta phrase se révèle en 3 minutes. Et si tu commençais&nbsp;?</h2>
        <p className="rv">Gratuit, sans carte bancaire, résultat immédiat.</p>
        <div className="rv"><a className="btn pulse" href={TEST_URL} style={{ fontSize: 16, padding: '17px 34px' }}>Découvrir ma Signature →</a></div>
      </div></section>

      {/* 14. FOOTER */}
      <footer className="foot"><div className="wrap">
        <div className="cols">
          <div style={{ maxWidth: 260 }}>
            <div className="logo">SOS <b>Shine</b></div>
            <p style={{ color: 'rgba(231,225,213,.55)', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>Plateforme de déconditionnement émotionnel. Comprendre ses schémas, les libérer, et enfin se déposer.</p>
          </div>
          <div className="col">
            <h4>Découvrir</h4>
            <a href={TEST_URL}>Faire le test</a>
            <a href="#comment">Comment ça marche</a>
            <a href="#plateforme">La plateforme</a>
            <a href="#tarifs">Tarifs</a>
          </div>
          <div className="col">
            <h4>SOS Shine</h4>
            <a href="#temoignages">Témoignages</a>
            <a href={EVENT_URL}>Événements</a>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">Le livre ↗</a>
          </div>
          <div className="col">
            <h4>Rejoindre</h4>
            <a href={JOIN_URL}>S&apos;abonner</a>
            <a href="/login">Se connecter</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        <div className="bottom">© {new Date().getFullYear()} SOS Shine — Briller comme un diamant. Cet outil ne remplace pas un suivi médical ou psychologique.</div>
      </div></footer>
    </div>
  )
}
