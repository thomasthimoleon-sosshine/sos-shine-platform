/**
 * Email notification — Nouveau protocole disponible
 * Déclenché quand un protocole passe de coming_soon à available
 */
import { wrapEmail, p, h2, ctaButton, goldDivider, spacer } from './wrapper'

const BRAND = '#C9A961'

type Vars = {
  firstName: string
  email: string
  protocolTitle: string
  protocolSlug: string
  matchPercentage: number
}

export function generateEmailNotification(vars: Vars): { subject: string; html: string } {
  const { firstName, email, protocolTitle, protocolSlug, matchPercentage } = vars
  const subject = `${firstName ? firstName + ', l' : 'L'}e protocole ${protocolTitle} vient d'arriver pour toi`
  const protocolUrl = `https://sosshine.com/dashboard/encyclopedie/${protocolSlug}`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Tu te souviens ? Il y a quelque temps, tu as fait le test Signature Émotionnelle.`),
    p(`Dans ton résultat, on t'avait dit qu'un protocole arrivait bientôt pour toi : <strong style="color:#e0e0e0;">${protocolTitle}</strong>.`),
    p(`Il est là.`),
    goldDivider(),
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:20px 24px;background:rgba(201,169,97,0.06);border:1px solid rgba(201,169,97,0.12);border-radius:12px;text-align:center;">
<p style="font-size:13px;color:${BRAND};font-weight:600;margin:0 0 4px 0;">Match avec ton profil</p>
<p style="font-size:32px;color:${BRAND};font-weight:700;margin:0;font-family:Georgia,serif;">${matchPercentage}%</p>
</td></tr>
</table>`,
    spacer(16),
    p(`On l'a construit spécifiquement pour des personnes comme toi. Les premières à l'avoir testé nous disent qu'elles auraient aimé l'avoir il y a 10 ans.`),
    p(`Tu veux l'essayer ?`),
    ctaButton('Découvrir le protocole', protocolUrl),
    goldDivider(),
    p(`Si ce n'est pas le bon moment, pas de souci. On te tient au courant quand d'autres sortent.`),
    p(`L'équipe SOS Shine`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
