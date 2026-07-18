'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const TEST = '/signature-emotionnelle?start=1'

// Palette : bleu profond + sable + or chaud
const C = {
  sand: '#F4ECDD',
  sand2: '#FBF6EC',
  blue: '#16314A',
  blueDeep: '#0F2436',
  gold: '#C9A961',
  goldSoft: '#E2CB86',
  ink: '#22303C',
  cream: '#F7F1E6',
  muted: '#5D6771',
}
const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' }
const sans = { fontFamily: 'var(--font-figtree), -apple-system, system-ui, sans-serif' }
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease }} className={className}>
      {children}
    </motion.div>
  )
}

const TAGS = ['Anxiété', 'Confiance en soi', 'Dépendance affective', 'Séparation / rupture', 'Burn-out', 'Hypersensibilité', 'Deuil', 'Traumatismes', 'Estime de soi', 'Relations répétitives', 'Thérapeutes & professionnels de l\'accompagnement']

const JOURNEY = [
  ['1', 'Faire le test', 'Trois minutes, en toute simplicité.'],
  ['2', 'Découvrir ta Signature Émotionnelle', 'Un texte personnalisé, précis, immédiat.'],
  ['3', 'Comprendre tes mécanismes en profondeur', 'D\'où ils viennent, ce qu\'ils protègent.'],
  ['4', 'Transformer durablement', 'La plateforme SOS Shine, disponible 24/7.'],
]

const FOUNDERS = [
  ['Julia Laureau', 'Fondatrice', 'Elle a traversé ce dont elle parle. Sa voix guide l\'accompagnement, et son histoire a fondé SOS Shine.', '/images/julia.jpeg'],
  ['William', 'Accompagnement corporel', 'Il transforme le vécu en chemin structuré : comprendre le corps pour libérer l\'émotion.', null],
  ['Thomas', 'Plateforme & outils', 'Il construit l\'espace qui rend tout cela possible, pour que la technologie s\'efface derrière la transformation.', null],
]

const TESTIMONIALS = [
  "J'ai enfin compris pourquoi je répétais toujours les mêmes schémas. La Signature m'a ouvert les yeux. Merci Julia !",
  "J'ai pleuré pendant la séance, mais c'était des larmes de libération. Enfin quelqu'un qui comprend vraiment.",
  "Travail profond et libérateur. Je me sens plus légère et en paix. Je recommande à 100%.",
  "Merci pour cet accompagnement qui m'a permis de débloquer des choses que je traînais depuis des années.",
]

const FAQ = [
  ['Ce test est-il vraiment gratuit et sans engagement ?', "Oui. Le test est 100 % gratuit, dure environ 3 minutes et ne nécessite aucune carte bancaire. Tu reçois immédiatement ta Signature Émotionnelle personnalisée. Aucun suivi commercial automatique."],
  ['En quoi est-il différent des tests de personnalité classiques ?', "Il ne te met pas dans une case (INFP, Ennéagramme…). Il identifie ta phrase unique — la mécanique émotionnelle qui dirige tes réactions depuis des années. Beaucoup disent : « Pour la première fois, quelqu'un a mis des mots exacts sur ce que je vivais. »"],
  ['Est-ce que ça marche même si je ne connais pas Julia ?', "Oui. Le test est conçu pour tout le monde. Que tu suives Julia ou que tu découvres SOS Shine via Google, le résultat est le même : une compréhension profonde."],
  ['Est-ce scientifique ou plutôt spirituel ?', "C'est une approche hybride : compréhension psychologique des mécanismes émotionnels, outils de régulation, et pratiques énergétiques complémentaires pour ceux qui le souhaitent. Nous ne prétendons pas remplacer une thérapie — beaucoup de thérapeutes utilisent SOS Shine en complément."],
  ['Combien de temps avant de voir un changement ?', "Dès le test, beaucoup ressentent un soulagement immédiat (« enfin compris »). Les transformations plus profondes arrivent avec la plateforme (méditations, contenus, accompagnement)."],
  ['Est-ce adapté si je suis en thérapie ou suivi médical ?', "Oui. SOS Shine est un outil de compréhension et de libération complémentaire. Il n'interfère pas avec un suivi thérapeutique classique."],
  ['Que se passe-t-il après le test ?', "Tu peux t'arrêter là (beaucoup gardent leur Signature comme référence) ou aller plus loin avec la plateforme SOS Shine pour nettoyer les mécanismes identifiés."],
  ['Est-ce confidentiel ?', "Totalement. Tes réponses et ta Signature sont privées et sécurisées."],
]

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'rgba(34,48,60,0.12)' }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer">
        <span className="text-[16px] sm:text-[17px] font-medium" style={{ ...serif, color: C.ink }}>{q}</span>
        <span className="shrink-0 text-2xl leading-none transition-transform duration-300" style={{ color: C.gold, transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
        <p className="pb-5 text-[15px] leading-relaxed" style={{ ...sans, color: C.muted }}>{a}</p>
      </motion.div>
    </div>
  )
}

const cta = (dark = false): React.CSSProperties => ({
  background: dark ? `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})` : C.blue,
  color: dark ? '#22190a' : C.cream,
  boxShadow: dark ? '0 16px 40px -14px rgba(201,169,97,0.5)' : '0 16px 40px -16px rgba(22,49,74,0.5)',
})

export default function Landing4Client() {
  return (
    <main style={{ ...sans, background: C.sand, color: C.ink }} className="min-h-screen overflow-x-hidden">

      {/* 1. HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center px-6 text-center overflow-hidden" style={{ background: `linear-gradient(160deg, ${C.blueDeep}, ${C.blue})`, color: C.cream }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute rounded-full blur-[130px] opacity-25" style={{ width: 620, height: 620, top: '-10%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,#C9A961,transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl">
          <Reveal><p className="text-[11px] tracking-[0.32em] uppercase font-semibold mb-7" style={{ color: C.goldSoft }}>Déconditionnement émotionnel</p></Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-normal leading-[1.1] mb-6" style={{ ...serif, fontSize: 'clamp(2.2rem,5.6vw,3.9rem)' }}>
              Tu répètes les mêmes réactions sans savoir vraiment <span style={{ color: C.goldSoft, fontStyle: 'italic' }}>pourquoi</span> ?
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto max-w-2xl text-[17px] sm:text-[19px] leading-relaxed mb-6" style={{ color: 'rgba(247,241,230,0.82)' }}>
              Ce test gratuit révèle <strong style={{ color: C.cream }}>la mécanique émotionnelle</strong> qui pilote tes comportements depuis des années.
            </p>
          </Reveal>
          <Reveal delay={0.18}><p className="text-[13px] tracking-[0.12em] mb-9" style={{ color: C.goldSoft }}>3 minutes • Résultat personnalisé • Aucun engagement</p></Reveal>
          <Reveal delay={0.24}>
            <a href={TEST} className="inline-block text-[15px] font-semibold px-9 py-4 rounded-full transition-transform hover:scale-[1.03]" style={cta(true)}>
              Découvrir ma Signature Émotionnelle gratuitement
            </a>
            <p className="mt-6 text-[13px]" style={{ color: 'rgba(247,241,230,0.6)' }}>
              Déjà <strong style={{ color: C.cream }}>plus de 12 450 personnes</strong> ont mis des mots sur ce qu'elles portaient depuis toujours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. VIDÉO */}
      <section className="px-6 py-20 sm:py-28" style={{ background: C.sand2 }}>
        <div className="max-w-3xl mx-auto text-center">
          <Reveal><p className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-4" style={{ color: C.gold }}>Un mot de Julia</p></Reveal>
          <Reveal delay={0.05}>
            <div className="relative rounded-3xl overflow-hidden aspect-video mx-auto" style={{ background: '#000', border: '1px solid rgba(201,169,97,0.2)', boxShadow: '0 40px 90px -50px rgba(22,49,74,0.5)' }}>
              <video src="https://www.sosshine.com/videos/presentation.mp4" poster="/images/julia.jpeg" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-[15.5px] italic leading-relaxed max-w-2xl mx-auto" style={{ ...serif, color: C.muted }}>
              « Si tu es ici, c'est probablement parce que tu sens que quelque chose se répète : les mêmes réactions, les mêmes blocages. Ce test ne va pas te mettre dans une case. Il va t'aider à identifier les mécanismes qui t'influencent, souvent depuis l'enfance. »
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. À QUI ÇA PARLE */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal><h2 className="font-normal leading-tight mb-10" style={{ ...serif, fontSize: 'clamp(1.7rem,4vw,2.5rem)' }}>
            SOS Shine accompagne celles et ceux qui veulent enfin <span style={{ color: C.gold, fontStyle: 'italic' }}>comprendre leur fonctionnement émotionnel</span>
          </h2></Reveal>
          <Reveal delay={0.08}>
            <div className="flex flex-wrap justify-center gap-2.5">
              {TAGS.map((t, i) => (
                <span key={i} className="px-4 py-2.5 rounded-full text-[14px]" style={{ background: C.sand2, border: '1px solid rgba(201,169,97,0.28)', color: C.ink }}>{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. CE QUE TU OBTIENS */}
      <section className="px-6 py-20 sm:py-28" style={{ background: C.blue, color: C.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <Reveal><h2 className="font-normal leading-tight mb-4" style={{ ...serif, fontSize: 'clamp(1.8rem,4.4vw,2.7rem)' }}>En 3 minutes, tu reçois ta Signature Émotionnelle</h2></Reveal>
          <Reveal delay={0.05}><p className="text-[16px] mb-8" style={{ color: 'rgba(247,241,230,0.75)' }}>Un texte profond et précis qui te montre :</p></Reveal>
          <Reveal delay={0.1}>
            <ul className="text-left max-w-xl mx-auto space-y-3 mb-12">
              {['Pourquoi tu réagis comme tu réagis', 'D\'où viennent tes schémas répétitifs', 'Ce que ton corps et tes émotions essaient de te dire', 'Les premières clés pour t\'en libérer'].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-[16px]" style={{ color: 'rgba(247,241,230,0.9)' }}>
                  <span style={{ color: C.goldSoft }}>◆</span>{f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <blockquote className="text-[18px] sm:text-[20px] italic leading-relaxed max-w-2xl mx-auto" style={{ ...serif, color: C.goldSoft }}>
              « J'ai pleuré. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais depuis 30 ans. »
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Bandeau témoignages */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={(i % 2) * 0.08}>
              <div className="rounded-2xl p-6 h-full" style={{ background: C.sand2, border: '1px solid rgba(201,169,97,0.18)' }}>
                <p className="text-[15px] italic leading-relaxed" style={{ ...serif, color: C.ink }}>« {t} »</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. QUI SOMMES-NOUS */}
      <section className="px-6 py-20 sm:py-28" style={{ background: C.sand2 }}>
        <div className="max-w-2xl mx-auto text-center">
          <Reveal><p className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-4" style={{ color: C.gold }}>Qui sommes-nous</p></Reveal>
          <Reveal delay={0.05}><h2 className="font-normal leading-tight mb-6" style={{ ...serif, fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>Une approche à la fois psychologique et humaine.</h2></Reveal>
          <Reveal delay={0.1}><p className="text-[16px] leading-relaxed mb-4" style={{ color: C.muted }}>
            SOS Shine est une plateforme de déconditionnement émotionnel fondée par <strong style={{ color: C.ink }}>Julia Laureau</strong>, accompagnée de Thomas et William.
          </p></Reveal>
          <Reveal delay={0.14}><p className="text-[16px] leading-relaxed" style={{ color: C.muted }}>
            Notre approche combine une compréhension fine des mécanismes psychologiques, des outils concrets de régulation émotionnelle, et — pour celles et ceux qui le souhaitent — des pratiques énergétiques complémentaires.
          </p></Reveal>
        </div>
      </section>

      {/* 6. PARCOURS */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14"><h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>Ton parcours avec SOS Shine</h2></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {JOURNEY.map((s, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full" style={{ background: C.sand2, border: '1px solid rgba(201,169,97,0.2)' }}>
                  <div className="text-[26px] font-normal mb-2" style={{ ...serif, color: C.gold }}>{s[0]}</div>
                  <h3 className="text-[16px] font-semibold mb-1.5" style={{ color: C.ink }}>{s[1]}</h3>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>{s[2]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: C.sand2 }}>
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-10"><h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>Questions fréquentes</h2></Reveal>
          <div>{FAQ.map((f, i) => <Faq key={i} q={f[0]} a={f[1]} />)}</div>
        </div>
      </section>

      {/* 8. FONDATEURS */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14"><h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>L'équipe derrière SOS Shine</h2></Reveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {FOUNDERS.map((m, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="rounded-2xl p-7 h-full text-center" style={{ background: C.sand2, border: '1px solid rgba(201,169,97,0.2)' }}>
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden flex items-center justify-center" style={{ background: C.blue, color: C.cream, border: `2px solid ${C.goldSoft}` }}>
                    {m[3] ? <img src={m[3] as string} alt={m[0] as string} className="w-full h-full object-cover" /> : <span style={{ ...serif, fontSize: '1.4rem' }}>{(m[0] as string).charAt(0)}</span>}
                  </div>
                  <h3 className="text-[19px]" style={{ ...serif, color: C.ink }}>{m[0]}</h3>
                  <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mt-1 mb-3" style={{ color: C.gold }}>{m[1]}</p>
                  <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{m[2]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="px-6 py-24 sm:py-32 text-center" style={{ background: `linear-gradient(160deg, ${C.blue}, ${C.blueDeep})`, color: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <Reveal><h2 className="font-normal leading-tight mb-8" style={{ ...serif, fontSize: 'clamp(1.9rem,4.6vw,2.9rem)' }}>Prêt·e à enfin te comprendre ?</h2></Reveal>
          <Reveal delay={0.08}>
            <a href={TEST} className="inline-block text-[15px] font-semibold px-9 py-4 rounded-full transition-transform hover:scale-[1.03]" style={cta(true)}>
              Découvrir ma Signature Émotionnelle gratuitement
            </a>
            <p className="mt-5 text-[13px]" style={{ color: 'rgba(247,241,230,0.6)' }}>3 minutes • Gratuit • Aucun engagement</p>
          </Reveal>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-[12px]" style={{ background: C.blueDeep, color: 'rgba(247,241,230,0.5)' }}>
        © {new Date().getFullYear()} SOS Shine · Déconditionnement émotionnel
      </footer>
    </main>
  )
}
