/**
 * Email 3 — La question qui touche (J+1 14h)
 */
import { wrapEmail, p, signature } from './wrapper'

type Vars = { firstName: string; email: string }

export function generateEmail03(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', u' : 'U'}ne question qui va peut-être te déranger`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Une question qui va peut-être te gêner :`) ,
    p(`Depuis hier, combien de fois tu as repensé à ta Signature ?`),
    p(`Combien de fois tu t'es dit <em>"merde, c'est exactement ça"</em> ?`),
    p(`Si tu es comme 80% des gens qui font le test, c'est plusieurs fois par jour.`),
    p(`C'est normal.`),
    p(`Quand on met enfin le doigt sur quelque chose qu'on portait depuis des années sans pouvoir le nommer, ça tourne en boucle dans la tête.`),
    p(`C'est le moment où les choses peuvent vraiment commencer à bouger.`),
    p(`Pas en dix ans de thérapie. Pas en trois stages de développement personnel.`),
    p(`<strong style="color:#e0e0e0;">Maintenant.</strong>`),
    p(`Je t'explique pourquoi dans le prochain email.`),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
