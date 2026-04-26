/**
 * Email 15 — L'avant-dernier (J+13 14h)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail15(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', d' : 'D'}emain je te dis au revoir`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Demain, c'est mon dernier email de cette séquence.`),
    p(`Après, je continue à t'écrire. Mais moins souvent. Et différemment. Tu rejoindras la newsletter hebdomadaire où je partage mes réflexions plus larges.`),
    p(`Avant ça, je voulais te poser une dernière question.`),
    p(`<strong style="color:#e0e0e0;">Quand tu imagines ta vie dans 6 mois — si tu ne changes rien — à quoi elle ressemble ?</strong>`),
    p(`Vraiment.`),
    p(`Prends 30 secondes pour y penser.`),
    p(`Si ta réponse est "la même" ou "peut-être pire", alors tu as ta réponse.`),
    p(`La porte est encore ouverte. Mais plus pour longtemps.`),
    ctaButton('Entrer dans SOS Shine', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
