import { wrapEmail, p, signature, goldDivider } from './quiz-v2/wrapper'
import { getPorte } from '@/lib/test5q/portes'

const SERIF = "Georgia, 'Times New Roman', serif"
const BRAND = '#C9A961'
const GOLD2 = '#E4C888'

type Vars = {
  slug: string
  prenom: string
  email: string
}

export function generateSignatureLetter(vars: Vars): { subject: string; html: string } | null {
  const porte = getPorte(vars.slug)
  if (!porte) return null

  const { prenom, email } = vars
  const name = prenom || 'Toi'

  const subject = prenom ? `${prenom}, ta signature` : 'Ta signature'

  const content = [
    `<p style="font-size:13px;color:#a1a1aa;margin:0 0 8px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${prenom ? `${prenom}, voilà ce qui tourne en boucle.` : 'Voilà ce qui tourne en boucle.'}</p>`,

    `<h2 style="font-family:${SERIF};font-size:28px;color:#e8e8e8;font-weight:500;margin:0 0 24px 0;">Ta signature</h2>`,

    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px 0;">
<tr><td style="padding:24px 0;border-top:1px solid rgba(201,169,97,0.22);border-bottom:1px solid rgba(201,169,97,0.22);">
<p style="font-family:${SERIF};font-size:24px;font-weight:500;line-height:1.3;color:#e8e8e8;margin:0;">
${porte.phrase[0]}<br><em style="font-style:italic;color:${GOLD2};">${porte.phrase[1]}</em>
</p>
</td></tr>
</table>`,

    `<p style="font-size:14px;color:#a1a1aa;margin:0 0 28px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${porte.antiCase}</p>`,

    goldDivider(),

    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0;">
<tr><td style="padding:28px 24px;background:#111111;border:1px solid rgba(245,239,227,0.06);border-radius:14px;">
<p style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND};margin:0 0 20px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Une lettre · Julia</p>
<p style="font-size:16px;color:#EDE6D8;margin:0 0 14px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.65;">${name},</p>
${porte.lettre.map((para) => `<p style="font-size:16px;color:#EDE6D8;margin:0 0 14px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.65;">${para}</p>`).join('')}
<p style="font-family:${SERIF};font-style:italic;font-size:22px;color:${GOLD2};margin:24px 0 0 0;">Julia</p>
</td></tr>
</table>`,

    goldDivider(),

    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0;">
<tr><td style="padding:20px;border:1px solid rgba(201,169,97,0.22);border-radius:14px;">
<p style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND};margin:0 0 8px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Ce soir, une seule chose</p>
<p style="font-size:15px;color:#e8e8e8;margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.55;">${porte.ceSoir.geste}</p>
<p style="font-size:13px;color:#a1a1aa;margin:8px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.55;">${porte.ceSoir.explication}</p>
</td></tr>
</table>`,

    p(`Conserve cette lettre. Relis-la dans quelques jours.`),

    signature(),
  ].join('')

  return {
    subject,
    html: wrapEmail(content, { email }),
  }
}
