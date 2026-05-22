/**
 * Email 12 - Voilà ce qui va se passer concrètement (J+10)
 */
import { wrapEmail, p, h3, ctaButton, signature, goldDivider } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r'

type Vars = { firstName: string; email: string }

export function generateEmail12(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Voilà ce qui va se passer concrètement.`

  const content = [
    p(`Si aujourd'hui tu décides de rejoindre SOS Shine, voilà concrètement ce qu'il va se passer.`),
    p(`Pas une promesse vague. Pas un "tu vas voir, tu seras transformé·e". Du concret.`),
    goldDivider(),
    h3(`Minute 1`),
    p(`Tu entres dans ton espace membre. Tu y retrouves ta Signature Émotionnelle, ton profil personnalisé, et les premiers outils adaptés à ce que tu traverses en ce moment précis.`),
    h3(`Minute 5`),
    p(`Tu découvres ton premier protocole.`),
    p(`Pas quelque chose de compliqué. Pas une montagne de vidéos théoriques que tu ne regarderas jamais. Pas un PDF de 80 pages à imprimer.`),
    p(`Quelque chose de simple. Concret. Pensé pour être vraiment applicable dans une vraie vie. Une vie qui continue à courir pendant que tu commences à te poser.`),
    h3(`Jour 1`),
    p(`Tu commences doucement à te reconnecter à toi.`),
    p(`10 à 15 minutes. Une vidéo. Un exercice. Une réflexion. Une respiration. Un petit déplacement intérieur que tu n'avais pas senti depuis longtemps.`),
    h3(`Jour 3`),
    p(`Tu commences souvent à ressentir les premiers changements. Pas quelque chose de spectaculaire. Pas un avant/après Instagram.`),
    p(`Quelque chose de réel. Un peu plus de calme dans la poitrine. Une réaction qui ne part pas comme d'habitude. Une pensée automatique qui ne se déclenche plus tout à fait pareil. Une respiration qui descend un peu plus bas. Ce sont ces signaux subtils qui annoncent qu'un système nerveux commence à apprendre autre chose.`),
    h3(`Jour 5`),
    p(`Tu commences à te déplacer dans la plateforme avec aisance. Tu connais ton protocole. Tu sais où aller quand une émotion monte. Tu peux ouvrir l'application à 2h du matin si tu en as besoin, et trouver une réponse, une voix, un exercice. C'est ce moment où SOS Shine cesse d'être "un truc qu'on essaie" pour devenir un compagnon de quotidien.`),
    h3(`Jour 7`),
    p(`Soit tu sens que cet espace te fait du bien et tu continues, dans la formule que tu auras choisie.`),
    p(`Soit tu décides que ce n'est pas pour toi à ce moment de ta vie, et tu arrêtes simplement.`),
    p(`Sans piège. Sans engagement caché. Sans relance insistante. Sans pression.`),
    p(`Juste l'opportunité d'avoir essayé enfin quelque chose de différent. De savoir, par toi-même, si c'est l'endroit qui peut t'accompagner.`),
    goldDivider(),
    p(`C'est tout.`),
    p(`Pas de promesse de miracle. Pas de transformation instantanée. Pas de "ta vie va changer en 7 jours".`),
    p(`Mais 7 jours, c'est largement assez pour sentir si un endroit te fait du bien. Si la voix qu'on y entend te parle. Si la méthode te correspond. Si ton corps, ton mental et ton cœur ont envie de continuer.`),
    p(`Et si la réponse est oui, alors un vrai chemin peut commencer.`),
    ctaButton('Démarrer maintenant', URL_SERENITE, { email }),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Une chose que je veux que tu saches. SOS Shine est sans engagement, résiliable à tout moment. C'est moi qui ai voulu ça dès le début, parce que je trouve normal qu'on puisse voir avant de continuer. On ne te demande pas de croire sur parole. On te demande juste de venir voir.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
