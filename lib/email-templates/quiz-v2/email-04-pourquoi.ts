/**
 * Email 4 — Pourquoi maintenant (J+2 14h)
 */
import { wrapEmail, p, signature } from './wrapper'

type Vars = { firstName: string; email: string }

export function generateEmail04(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', c' : 'C'}e qui se passe en toi depuis 48h`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Depuis que tu as découvert ta Signature, quelque chose a changé.`),
    p(`Peut-être que tu ne le vois pas encore clairement. Mais c'est là.`),
    p(`Tu as une conscience nouvelle. Une lecture de toi-même que tu n'avais pas il y a 72h.`),
    p(`Et là, deux chemins sont possibles.`),
    p(`<strong style="color:#e0e0e0;">Chemin 1</strong> : tu laisses cette conscience s'effacer. Dans trois semaines, tu auras oublié. Dans six mois, tu seras exactement au même point qu'aujourd'hui.`),
    p(`<strong style="color:#e0e0e0;">Chemin 2</strong> : tu transformes cette conscience en action. Pas une grosse action. Juste 10 minutes par jour. Dans une structure qui sait quoi te proposer, à quel moment.`),
    p(`C'est exactement ce qu'on a construit dans SOS Shine.`),
    p(`Je t'en dis plus demain. Pour l'instant, relis ta Signature si tu en as envie.`),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
