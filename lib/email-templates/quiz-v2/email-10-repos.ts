/**
 * Email 10 - Une pensée avant la nuit (J+8)
 */
import { wrapEmail, p, signature } from './wrapper'

type Vars = { firstName: string; email: string }

export function generateEmail10(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Une pensée avant la nuit.`

  const content = [
    p(`Pas de longue histoire ce soir. Juste une pensée que j'avais envie de te laisser avant la nuit.`),
    p(`Tu n'es pas obligé(e) de tout comprendre pour commencer à changer.`),
    p(`Tu n'as pas besoin d'avoir toutes les réponses. D'être "guéri·e". D'être prêt(e) parfaitement. D'avoir lu tous les livres, fait toutes les thérapies, identifié tous tes schémas.`),
    p(`Parfois, il suffit simplement de recommencer à s'écouter un peu plus chaque jour.`),
    p(`Une respiration plus consciente. Une phrase qu'on s'autorise enfin à dire. Un non posé doucement. Un oui qu'on s'offre. Un moment de silence pris au milieu du bruit.`),
    p(`C'est souvent dans ces petits gestes-là que les vraies transformations commencent.`),
    p(`Prends soin de toi ce soir.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu lis ce mail tard, fais-toi une faveur. Pose ton téléphone, respire deux fois profondément, et autorise-toi à ne penser à rien pendant 30 secondes. Le monde peut attendre.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
