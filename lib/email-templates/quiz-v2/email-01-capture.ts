/**
 * Email 1 — Capture intermédiaire
 * Envoyé 2 min après email donné à Q10, SI quiz pas terminé
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

type Vars = { firstName: string; email: string; resumeUrl: string }

export function generateEmail01(vars: Vars): { subject: string; html: string } {
  const { firstName, email, resumeUrl } = vars
  const subject = `${firstName ? firstName + ', j' : 'J'}'attends ta réponse aux 5 dernières questions...`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Julia ici.`),
    p(`Tu viens de répondre aux 10 questions les plus profondes du test.`),
    p(`Il t'en reste 5 — celles qui vont nous permettre de voir vers quel chemin on doit t'orienter.`),
    p(`Prends 2 minutes. Je t'attends de l'autre côté.`),
    ctaButton('Terminer mon test', resumeUrl),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
