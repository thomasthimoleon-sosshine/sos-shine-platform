/**
 * Email 12 — Ce qui t'attend dedans (J+10 14h)
 */
import { wrapEmail, p, h3, ctaButton, signature, goldDivider } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail12(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', v' : 'V'}oilà ce qui se passe si tu dis oui`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Si tu commences tes 7 jours gratuits aujourd'hui, voilà ce qui se passe concrètement.`),
    goldDivider(),
    h3(`Minute 1`),
    p(`Tu rentres dans ton espace membre. Tu retrouves ta Signature Émotionnelle. Ton profil.`),
    h3(`Minute 3`),
    p(`Tu découvres ton premier protocole personnalisé. Basé sur tes réponses au quiz. Prêt à démarrer demain matin.`),
    h3(`Jour 1 du protocole`),
    p(`Première pratique du matin. 10 minutes. Une vidéo courte de Julia, un exercice concret de Thomas, un éclairage cognitif de William.`),
    h3(`Jour 3`),
    p(`Tu ressens les premiers déplacements. Pas spectaculaires. Mais réels. Ton corps reconnaît quelque chose.`),
    h3(`Jour 7`),
    p(`Fin de ta période gratuite. Soit tu restes (et tu continues). Soit tu pars (et tu ne paies rien).`),
    goldDivider(),
    p(`Pas de piège. Pas de conditions cachées.`),
    ctaButton('Démarrer maintenant', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
