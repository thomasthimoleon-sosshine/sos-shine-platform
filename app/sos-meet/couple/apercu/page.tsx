import type { Metadata } from 'next'
import Link from 'next/link'
import { previewReport } from '@/lib/sosmeet/couple/preview'

export const metadata: Metadata = {
  title: 'Aperçu de la lecture — SOS Meet',
  description: 'À quoi ressemble le livrable du parcours à deux.',
  robots: { index: false, follow: false },
}

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

const VERDICT_LABEL: Record<string, string> = {
  faille: 'Faille', malentendu: 'Malentendu', usure: 'Usure', point_or: 'Point d’or',
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="mb-5" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.5rem,4.4vw,2rem)', lineHeight: 1.15 }}>{titre}</h2>
      {children}
    </section>
  )
}

function Jauge({ label, valeur }: { label: string; valeur: number }) {
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: C.smoke2 }}>{label}</span>
        <span className="text-[13px]" style={{ color: C.alabaster }}>{valeur}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(242,235,228,0.07)' }}>
        <div style={{ width: `${valeur}%`, height: '100%', background: `linear-gradient(90deg, ${C.garnet}, ${C.ember})` }} />
      </div>
    </div>
  )
}

export default function ApercuPage() {
  const r = previewReport()
  const n = r.narrative
  const e = r.energetique

  return (
    <main className="min-h-screen relative" style={{ ...sans, background: C.ink, color: C.alabaster }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 50% at 50% -8%, rgba(155,27,46,0.13), transparent 55%)' }} />

      <div className="relative max-w-2xl mx-auto px-6 py-20">
        <Link href="/sos-meet/couple" className="text-[12px] tracking-[0.08em] uppercase" style={{ color: C.smoke2 }}>← Se retrouver</Link>

        {/* Avertissement : ce couple n'existe pas. */}
        <div className="mt-6 mb-12 rounded-2xl px-6 py-5" style={{ background: 'rgba(155,27,46,0.10)', border: `1px solid ${C.garnet}` }}>
          <p className="text-[13.5px] leading-relaxed" style={{ color: C.alabaster }}>
            <b>Aperçu.</b> Camille et Alex n’existent pas. Leurs réponses ont été fabriquées pour montrer à quoi
            ressemble la lecture d’un couple. Le texte, les scores et la couche énergétique sont en revanche produits
            par le vrai moteur, sans retouche.
          </p>
        </div>

        <span className="text-[11px] tracking-[0.32em] uppercase" style={{ color: C.ember }}>Votre lecture</span>
        <h1 className="mt-4 mb-8" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6.4vw,3rem)', lineHeight: 1.06 }}>
          Camille <span style={{ color: C.smoke2 }}>et</span> Alex
        </h1>

        <p className="text-[17px] leading-relaxed mb-10" style={{ color: C.smoke }}>{n.ouverture}</p>

        <div className="flex gap-5 mb-14 pb-10" style={{ borderBottom: `1px solid ${C.line}` }}>
          <Jauge label="Santé du lien" valeur={r.crossing.sante} />
          <Jauge label="Vous vous lisez juste" valeur={r.crossing.lucidite} />
        </div>

        <Section titre={n.ceQuiTient.titre}>
          <p className="text-[16px] leading-relaxed" style={{ color: C.smoke }}>{n.ceQuiTient.texte}</p>
        </Section>

        <Section titre="Là où ça bloque">
          <div className="flex flex-col gap-4">
            {n.laOuCaBloque.map((b, i) => {
              const f = r.crossing.findings.find(x => x.dimension === b.dimension)!
              return (
                <div key={i} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}`, borderTop: `2px solid ${C.garnet}` }}>
                  <div className="flex items-baseline justify-between mb-2.5 gap-3">
                    <h3 style={{ ...serif, fontWeight: 400, fontSize: '1.3rem' }}>{b.titre}</h3>
                    <span className="text-[10.5px] tracking-[0.16em] uppercase whitespace-nowrap" style={{ color: C.ember }}>
                      {VERDICT_LABEL[f.verdict]}
                    </span>
                  </div>
                  <p className="text-[15.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>{b.texte}</p>
                  <div className="flex gap-4 flex-wrap">
                    <Jauge label="Écart de vécu" valeur={f.divergence} />
                    <Jauge label="Malentendu" valeur={f.malentendu} />
                    <Jauge label="Usure" valeur={f.usure} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {n.leMalentendu && (
          <Section titre={n.leMalentendu.titre}>
            <div className="rounded-2xl p-7" style={{ background: 'rgba(155,27,46,0.09)', border: `1px solid ${C.garnet}` }}>
              <p className="text-[16px] leading-relaxed" style={{ color: C.alabaster }}>{n.leMalentendu.texte}</p>
            </div>
          </Section>
        )}

        <Section titre="Par quoi commencer">
          <ol className="flex flex-col gap-5">
            {n.parQuoiCommencer.map((p, i) => (
              <li key={i} className="flex gap-4">
                <span style={{ ...serif, fontSize: '1.5rem', color: C.garnet, lineHeight: 1 }}>{i + 1}</span>
                <div>
                  <h3 className="mb-1" style={{ ...serif, fontWeight: 400, fontSize: '1.2rem' }}>{p.titre}</h3>
                  <p className="text-[15.5px] leading-relaxed" style={{ color: C.smoke }}>{p.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {e && (
          <Section titre="Votre lecture énergétique">
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: C.smoke }}>
              Elle sert à une seule chose : montrer en quoi vous êtes complémentaires, et quels points demandent
              de l’attention. Elle ne diagnostique rien. Aucune des difficultés plus haut n’a été détectée par
              une position planétaire, elles viennent toutes de vos réponses.
            </p>

            <p className="text-[17px] leading-relaxed mb-10 pb-8" style={{ color: C.alabaster, borderBottom: `1px solid ${C.line}`, ...serif, fontWeight: 400 }}>
              {e.ensemble}
            </p>

            <h3 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>En quoi vous vous complétez</h3>
            <div className="flex flex-col gap-3.5 mb-10">
              {e.complementarites.map((o, i) => (
                <div key={i} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `2px solid ${C.garnet}` }}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h4 style={{ ...serif, fontWeight: 400, fontSize: '1.15rem' }}>{o.titre}</h4>
                    <span className="text-[10px] tracking-[0.14em] uppercase whitespace-nowrap" style={{ color: C.smoke2 }}>{o.source}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{ color: C.smoke }}>{o.texte}</p>
                </div>
              ))}
            </div>

            <h3 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>Ce qui demande de l’attention</h3>
            <div className="flex flex-col gap-3.5 mb-10">
              {e.attentions.map((o, i) => (
                <div key={i} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `2px solid ${C.smoke2}` }}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h4 style={{ ...serif, fontWeight: 400, fontSize: '1.15rem' }}>{o.titre}</h4>
                    <span className="text-[10px] tracking-[0.14em] uppercase whitespace-nowrap" style={{ color: C.smoke2 }}>{o.source}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{ color: C.smoke }}>{o.texte}</p>
                </div>
              ))}
            </div>

            <details className="rounded-2xl px-6 py-5" style={{ border: `1px solid ${C.line}` }}>
              <summary className="text-[13px] tracking-[0.1em] uppercase cursor-pointer" style={{ color: C.smoke2 }}>D’où cela vient</summary>
              <div className="mt-5 text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
                <p className="mb-2">
                  Chemins de vie {e.detail.numerologie.cheminA} et {e.detail.numerologie.cheminB}, nombre du couple {e.detail.numerologie.nombreCouple}.
                </p>
                <p className="mb-2">
                  Soleils en {e.detail.astrologie.themeA.soleil.signe} à {e.detail.astrologie.themeA.soleil.degre} degrés
                  et en {e.detail.astrologie.themeB.soleil.signe} à {e.detail.astrologie.themeB.soleil.degre} degrés.
                  Composite en {e.detail.astrologie.compositeSoleil.signe}.
                </p>
                <p className="mb-5">
                  Profils {e.detail.humanDesign.a.profil} et {e.detail.humanDesign.b.profil}.
                </p>
                <h4 className="text-[11px] tracking-[0.16em] uppercase mb-2.5" style={{ color: C.smoke2 }}>Ce que nous ne savons pas encore</h4>
                <ul style={{ color: C.smoke2 }}>
                  {e.limites.map((l, i) => <li key={i} className="mb-2">{l}</li>)}
                </ul>
              </div>
            </details>
          </Section>
        )}

        <p className="text-[16px] leading-relaxed pt-10" style={{ color: C.smoke, borderTop: `1px solid ${C.line}` }}>{n.motDeFin}</p>

        <div className="mt-12">
          <Link href="/sos-meet/couple/duo" className="inline-block px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase"
            style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
            Ouvrir notre duo →
          </Link>
        </div>
      </div>
    </main>
  )
}
