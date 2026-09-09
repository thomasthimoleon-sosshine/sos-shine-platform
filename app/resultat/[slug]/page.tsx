import { notFound } from 'next/navigation'
import { getPorte } from '@/lib/test5q/portes'

export const dynamic = 'force-dynamic'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
.rp{min-height:100dvh;background:#0A0806;color:#F5EFE3;font-family:"DM Sans",system-ui,sans-serif;font-weight:300;line-height:1.55;-webkit-font-smoothing:antialiased}
.rp *{box-sizing:border-box;margin:0;padding:0}
.rp .page{max-width:640px;margin:0 auto;padding:28px 22px 96px}
.rp header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:42px;letter-spacing:.18em;font-size:11px;color:#A89B88;text-transform:uppercase}
.rp header strong{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;letter-spacing:.22em;color:#F5EFE3;font-size:13px}
.rp .kicker{font-size:13px;color:#A89B88;margin-bottom:10px}
.rp .name{font-family:"Cormorant Garamond",Georgia,serif;font-size:42px;font-weight:500;letter-spacing:-0.02em;line-height:1;margin-bottom:28px}
.rp .sig{border-top:1px solid rgba(201,169,97,.22);border-bottom:1px solid rgba(201,169,97,.22);padding:28px 0 26px;margin-bottom:18px}
.rp .sig p{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(26px,6vw,34px);font-weight:500;line-height:1.22;text-wrap:balance}
.rp .sig p em{font-style:italic;color:#E4C888}
.rp .not-a-box{font-size:14px;color:#A89B88;margin-bottom:40px}
.rp .letter{background:#14110D;border:1px solid rgba(245,239,227,.06);border-radius:18px;padding:32px 26px 28px;margin-bottom:22px}
.rp .letter .from{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C9A961;margin-bottom:22px}
.rp .letter p{font-size:17px;margin-bottom:16px;color:#EDE6D8}
.rp .letter p.space{margin-top:8px}
.rp .letter .sign{margin-top:28px;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:26px;color:#E4C888}
.rp .tonight{border:1px solid rgba(201,169,97,.22);border-radius:18px;padding:22px 22px 20px;margin-bottom:36px}
.rp .tonight h3{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C9A961;margin-bottom:10px}
.rp .tonight p{font-size:16.5px;color:#F5EFE3}
.rp .tonight p span{color:#A89B88;display:block;margin-top:8px;font-size:14.5px}
.rp .offer h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin-bottom:12px}
.rp .offer>p{color:#A89B88;font-size:15.5px;margin-bottom:22px}
.rp .days{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px}
.rp .days div{background:rgba(245,239,227,.04);border-radius:14px;padding:14px 14px 13px;font-size:14px}
.rp .days b{display:block;color:#C9A961;font-weight:500;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.rp .cta{display:block;width:100%;text-align:center;text-decoration:none;background:#C9A961;color:#0A0806;font-weight:500;font-size:16.5px;padding:18px;border-radius:999px;margin-bottom:12px;transition:background .2s}
.rp .cta:hover{background:#E4C888}
.rp .price{text-align:center;font-size:14px;color:#A89B88;margin-bottom:18px}
.rp .leave{display:block;text-align:center;color:#A89B88;font-size:14px;text-decoration:none;padding:8px}
.rp .leave:hover{color:#F5EFE3}
.rp .safety{margin-top:18px;font-size:12.5px;color:#9a9484;line-height:1.55;border:1px solid rgba(245,239,227,.08);border-radius:10px;padding:16px 20px}
@media(max-width:480px){.rp .name{font-size:34px}.rp .letter{padding:24px 20px 22px}.rp .days{grid-template-columns:1fr}}
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
  const porte = getPorte(slug)
  if (!porte) notFound()

  const prenom = (sp.prenom || '').trim().replace(/[<>]/g, '').slice(0, 40)

  return (
    <div className="rp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="page">
        <header>
          <strong>SOS SHINE</strong>
          <span>Signature</span>
        </header>

        <p className="kicker">
          {prenom ? `${prenom}, voilà ce qui tourne en boucle.` : 'Voilà ce qui tourne en boucle.'}
        </p>
        <h1 className="name">Ta signature</h1>

        <div className="sig">
          <p>
            {porte.phrase[0]}
            <br />
            <em>{porte.phrase[1]}</em>
          </p>
        </div>
        <p className="not-a-box">{porte.antiCase}</p>

        <article className="letter">
          <p className="from">Une lettre · Julia</p>
          <p>{prenom || 'Toi'},</p>
          {porte.lettre.map((para, i) => (
            <p key={i} className={i === porte.lettre.length - 2 ? 'space' : undefined}>
              {para}
            </p>
          ))}
          <p className="sign">Julia</p>
        </article>

        <div className="tonight">
          <h3>Ce soir, une seule chose</h3>
          <p>
            {porte.ceSoir.geste}
            <span>{porte.ceSoir.explication}</span>
          </p>
        </div>

        <section className="offer">
          <h2>
            Si tu veux qu'on le tienne
            <br />
            sept jours.
          </h2>
          <p>{porte.offreSousTexte}</p>
          <div className="days">
            <div>
              <b>Jour 1–2</b>
              {porte.jours[0]}
            </div>
            <div>
              <b>Jour 3–4</b>
              {porte.jours[1]}
            </div>
            <div>
              <b>Jour 5–6</b>
              {porte.jours[2]}
            </div>
            <div>
              <b>Jour 7</b>
              {porte.jours[3]}
            </div>
          </div>
          <a className="cta" href="#">
            Commencer les 7 jours
          </a>
          <p className="price">
            9,90 € · tu peux arrêter avant le 8e jour
            <br />
            Ensuite 49,90 € / mois, seulement si tu restes
          </p>
          <a className="leave" href="/">
            Garder la lettre et partir
          </a>
          {porte.safetyText ? <p className="safety">{porte.safetyText}</p> : null}
        </section>
      </div>
    </div>
  )
}
