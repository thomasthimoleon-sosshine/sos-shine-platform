/**
 * Email 16 — Le dernier message (J+14 14h)
 */
import { wrapEmail, p, ctaButton, ctaLink, goldDivider, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'
const URL_CADEAU = 'https://sosshine.com/api/download/5min-protocol'

type Vars = { firstName: string; email: string }

export function generateEmail16(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', d' : 'D'}ernier message (et un cadeau)`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Voilà. Dernier message.`),
    p(`Tu n'as pas rejoint SOS Shine. Je ne te juge pas. Le timing n'était peut-être pas bon. Ou je ne suis pas la bonne personne pour toi. Les deux sont possibles.`),
    p(`Je voulais juste te dire deux choses avant qu'on se quitte.`),
    p(`<strong style="color:#e0e0e0;">Un</strong> : garde ta Signature précieusement. Relis-la dans 6 mois. Tu la verras différemment.`),
    p(`<strong style="color:#e0e0e0;">Deux</strong> : si un jour tu changes d'avis, la porte est toujours ouverte. 7 jours gratuits, même offre, même méthode.`),
    ctaButton('Rejoindre SOS Shine quand tu voudras', URL_SERENITE),
    goldDivider(),
    p(`Et pour finir, un petit cadeau :`),
    p(`Je t'offre mon protocole <strong style="color:#e0e0e0;">"5 minutes pour réaligner ta journée"</strong>. Un PDF gratuit que j'envoie rarement. Il est à toi.`),
    ctaLink('📄 Télécharger mon cadeau →', URL_CADEAU),
    goldDivider(),
    p(`Prends soin de toi.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu veux quand même rester en contact plus léger, tu n'as rien à faire. Tu rentres automatiquement dans ma newsletter hebdomadaire demain.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
