/**
 * Email 5 — L'histoire de Julia (J+3 10h)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail05(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', m' : 'M'}oi aussi, j'étais à ta place`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Je veux te raconter quelque chose.`),
    p(`Il y a huit ans, j'étais exactement à ta place.`),
    p(`J'avais tous les outils. J'avais lu tous les livres. J'allais voir des thérapeutes, des coachs, des énergéticiens. J'accumulais les prises de conscience sans que rien ne change vraiment.`),
    p(`Jusqu'au jour où j'ai compris une chose simple :`),
    p(`<strong style="color:#e0e0e0;">Comprendre ne suffit pas. Il faut un chemin.</strong>`),
    p(`Pas un protocole générique qui marche pour tout le monde. Un chemin spécifique à toi, à ce que tu portes, à ce que ton corps a appris.`),
    p(`C'est comme ça qu'est née la méthode SOS Shine.`),
    p(`D'abord pour moi. Puis pour des centaines d'autres.`),
    p(`Aujourd'hui, elle est à ta portée.`),
    ctaButton('Découvrir la méthode SOS Shine', URL_SERENITE),
    p(`À demain,`),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
