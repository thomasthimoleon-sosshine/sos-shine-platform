/**
 * Email 14 — Les 3 raisons (J+12 14h)
 */
import { wrapEmail, p, h3, ctaButton, signature, goldDivider } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail14(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', 3' : '3'} raisons pour lesquelles tu hésites`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Il te reste 2 jours avant que j'arrête de t'écrire.`),
    p(`Je sais pourquoi tu hésites. Tu n'es pas le/la seul(e).`),
    p(`Voici les 3 raisons les plus fréquentes :`),
    goldDivider(),
    h3(`1. "Je ne suis pas sûr(e) que ça marche pour moi."`),
    p(`→ Justement, les 7 jours gratuits sont faits pour ça. Tu testes. Si ça ne résonne pas, tu pars.`),
    h3(`2. "C'est le mauvais moment."`),
    p(`→ Il n'y aura jamais de bon moment. Ton schéma préfère que tu attendes. Parce que s'il change, il disparaît. Et il n'a pas envie de disparaître.`),
    h3(`3. "Je le ferai plus tard."`),
    p(`→ Tu l'as dit il y a un an. Tu l'as dit il y a cinq ans. Tu le rediras dans un an. "Plus tard" est le piège qui t'a gardé(e) là où tu es.`),
    goldDivider(),
    p(`Si tu es honnête, une de ces phrases est la tienne.`),
    p(`Et si tu es vraiment honnête, tu sais que ce sont des <strong style="color:#e0e0e0;">schémas qui parlent à ta place</strong>.`),
    ctaButton('Lever ces freins maintenant', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
