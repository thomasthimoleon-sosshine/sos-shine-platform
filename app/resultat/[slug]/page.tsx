import { notFound } from 'next/navigation'
import { getProtocole } from '@/lib/test5q/data'

export const dynamic = 'force-dynamic'

const CSS = `
.rz{min-height:100dvh;background:radial-gradient(900px 520px at 72% 6%,rgba(201,169,97,.06),transparent 60%),#0B0906;color:#F5EFE3;font-family:'Jost',system-ui,-apple-system,'Segoe UI',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased}
.rz .bar{border-bottom:1px solid rgba(201,169,97,.12)}
.rz .bar .in{max-width:720px;margin:0 auto;padding:22px 24px;display:flex;align-items:center;justify-content:space-between}
.rz .brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-weight:600;letter-spacing:.18em}
.rz .brand small{display:block;font-size:9.5px;font-weight:500;letter-spacing:.4em;color:#8C8271;margin-top:5px}
.rz .meta{font-size:12px;letter-spacing:.12em;color:#8C8271}
.rz .wrap{max-width:720px;margin:0 auto;padding:0 24px}
.rz .eyebrow{font-family:inherit;font-weight:500;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:#C9A961}
.rz h1,.rz h2,.rz h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;line-height:1.14}
.rz .em{font-style:italic;color:#E4C888}
.rz .intro{padding:48px 0 8px}
.rz .hello{color:#C9BEA6;font-size:18px;margin-bottom:14px}
.rz .intro .eyebrow{display:inline-block;margin-bottom:14px}
.rz h1{font-size:clamp(2.2rem,5vw,3.2rem)}
.rz .sig{margin-top:30px;border:1px solid rgba(201,169,97,.22);border-left:3px solid #C9A961;border-radius:6px;background:linear-gradient(180deg,rgba(201,169,97,.05),rgba(201,169,97,.015));padding:36px 40px}
.rz .sig .k{font-weight:500;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:#C9A961;margin-bottom:18px}
.rz .sig .q{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(1.4rem,3vw,2rem);line-height:1.4;color:#F5EFE3}
.rz .pill{display:inline-block;margin-top:22px;font-weight:500;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0A0806;background:#C9A961;border-radius:100px;padding:9px 20px}
.rz .audio{margin-top:20px;border:1px solid rgba(201,169,97,.12);border-radius:10px;padding:20px 24px;display:flex;align-items:center;gap:20px}
.rz .audio .play{flex:none;width:52px;height:52px;border-radius:50%;background:#C9A961;display:grid;place-items:center;box-shadow:0 8px 24px -10px rgba(201,169,97,.6)}
.rz .audio .t1{font-weight:500;font-size:15px}
.rz .audio .t2{font-size:13.5px;color:#8C8271;margin-top:3px}
.rz .why{padding:64px 0 20px}
.rz .why .eyebrow{display:inline-block;margin-bottom:18px}
.rz .why h2{font-size:clamp(1.5rem,3.4vw,2.2rem);margin-bottom:22px}
.rz .why p{color:#C9BEA6;margin-bottom:18px;line-height:1.6}
.rz .duo{margin-top:38px;display:grid;grid-template-columns:1fr 1fr;border:1px solid rgba(201,169,97,.12);border-radius:8px;overflow:hidden}
.rz .duo .c{padding:26px 28px}
.rz .duo .c:first-child{border-right:1px solid rgba(201,169,97,.12)}
.rz .duo .c h3{font-size:1.3rem;margin-bottom:12px}
.rz .duo .c p{color:#C9BEA6;font-size:14px;line-height:1.55;margin:0}
.rz .offer{margin:50px 0 0;border:1px solid #C9A961;border-radius:12px;background:linear-gradient(180deg,rgba(201,169,97,.06),rgba(201,169,97,.02));padding:46px 36px 40px;text-align:center}
.rz .offer .eyebrow{display:inline-block;margin-bottom:14px}
.rz .offer h2{font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:20px}
.rz .offer .price{font-family:'Cormorant Garamond',Georgia,serif;color:#E4C888;font-size:clamp(2.8rem,7vw,4.2rem);line-height:1;font-weight:500}
.rz .offer .price small{font-style:italic;font-size:.32em;color:#C9BEA6;margin-left:8px}
.rz .offer ul{list-style:none;margin:30px auto;max-width:420px;text-align:left;display:flex;flex-direction:column;gap:12px;padding:0}
.rz .offer li{color:#C9BEA6;font-size:15px}
.rz .cta{display:inline-block;margin-top:6px;padding:18px 40px;border-radius:100px;font-weight:500;font-size:16.5px;color:#0A0806;background:#C9A961;box-shadow:0 12px 32px -12px rgba(201,169,97,.6)}
.rz .offer .micro{margin-top:18px;font-size:13px;color:#8C8271}
.rz .offer .live{margin-top:10px;font-size:13px;color:#C9BEA6}
.rz .safety{margin-top:18px;font-size:12.5px;color:#9a9484;line-height:1.55;border:1px solid rgba(245,239,227,.08);border-radius:10px;padding:16px 20px}
.rz .secondary{text-align:center;padding:30px 0 12px;color:#C9BEA6;font-size:15px}
.rz .secondary a{color:#F5EFE3;border-bottom:1px solid rgba(201,169,97,.3);padding-bottom:1px}
.rz footer{margin-top:52px;border-top:1px solid rgba(201,169,97,.12)}
.rz .foot{max-width:720px;margin:0 auto;padding:26px 24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;color:#8C8271}
@media(max-width:640px){.rz .sig{padding:28px 24px}.rz .duo{grid-template-columns:1fr}.rz .duo .c:first-child{border-right:none;border-bottom:1px solid rgba(201,169,97,.12)}.rz .offer{padding:36px 24px}.rz .foot{flex-direction:column}}
`

export default async function ResultatPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ prenom?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const p = getProtocole(slug)
  if (!p) notFound()

  const prenom = (sp.prenom || '').trim().replace(/[<>]/g, '').slice(0, 40)

  return (
    <div className="rz">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bar">
        <div className="in">
          <span className="brand">SOS SHINE<small>Signature</small></span>
          <span className="meta">Résultat · 3 min</span>
        </div>
      </div>

      <div className="wrap">
        <section className="intro">
          {prenom ? <p className="hello">{prenom},</p> : null}
          <span className="eyebrow">Ta signature émotionnelle</span>
          <h1>{p.titre}</h1>

          <div className="sig">
            <div className="k">Ce que tu traverses</div>
            <p className="q">{p.signature}</p>
            <span className="pill">Protocole · {p.titre}</span>
          </div>

          <div className="audio">
            <span className="play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A0806"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <div>
              <div className="t1">Julia te lit ta signature</div>
              <div className="t2">Écoute avant de décider quoi que ce soit.</div>
            </div>
          </div>
        </section>

        <section className="why">
          <h2>Pourquoi ça fait mal</h2>
          <p>{p.pourquoi}</p>

          <div className="duo">
            <div className="c"><h3>Ce que ça produit</h3><p>{p.produit}</p></div>
            <div className="c"><h3>Par où commencer</h3><p>{p.commencer}</p></div>
          </div>

          <div className="offer">
            <span className="eyebrow">La suite · 7 jours</span>
            <h2>Entrer dans ton protocole</h2>
            <div className="price">9,90 €<small>les 7 jours</small></div>
            <ul>
              <li>– Les 3 étapes de {p.titre} : 2 vidéos, méditation, activation, hypnose, cahier</li>
              <li>– J1 les vidéos · J2 le corps · J3 l’hypnose · ensuite le cahier</li>
              <li>– Ensuite 49,90 €/mois, sans engagement</li>
              <li>– Annulable en 1 clic avant le 8<sup>e</sup> jour</li>
            </ul>
            {/* TODO câblage : ce CTA ouvrira le Checkout Stripe 9,90 € (phase essai). */}
            <a href="#" className="cta">Commencer les 7 jours →</a>
            <p className="micro">Carte requise · tu n’es pas débité à 49,90 € aujourd’hui</p>
            <p className="live">Julia · William · Thomas. Live mercredi. Le protocole commence aujourd’hui.</p>

            {p.safetyText ? <p className="safety">{p.safetyText}</p> : null}
          </div>

          <p className="secondary">Pour cette fois, le résultat te suffit. <a href="/">Garder ma signature et partir</a></p>
        </section>
      </div>

      <footer>
        <div className="foot">
          <span>SOS Shine · Le 49,90 € n’est pas dû aujourd’hui</span>
          <span>Sans engagement</span>
        </div>
      </footer>
    </div>
  )
}
