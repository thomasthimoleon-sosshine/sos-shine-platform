/**
 * Email 6 — Quand elle a compris comment elle fonctionnait (J+4)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r'

type Vars = { firstName: string; email: string }

export function generateEmail06(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Quand elle a compris comment elle fonctionnait, tout a changé.`

  const content = [
    p(`Je voudrais te parler de Laetitia.`),
    p(`Elle a fait le test, il y a quelque temps. Et en lisant sa Signature Émotionnelle, elle a vu noir sur blanc ce qui se passait dans sa vie depuis des années. Sans qu'elle ait jamais réussi à mettre des mots dessus.`),
    p(`Elle a compris comment elle fonctionnait.`),
    p(`Et ça, c'est déjà énorme. Parce que la majorité des gens passent leur vie entière sans jamais vraiment se comprendre.`),
    p(`Mais Laetitia n'en est pas restée là.`),
    p(`Elle s'est prise en main. Elle a décidé de redevenir créatrice de sa vie, au lieu de la subir.`),
    p(`Et c'est exactement à ce moment-là que tout a changé pour elle.`),
    p(`Parce que comprendre, c'est précieux. Mais ce n'est qu'une porte.`),
    p(`Ce qui change vraiment une vie, c'est ce qu'on fait juste après. C'est le passage à l'action.`),
    p(`Pour Laetitia, ce passage à l'action a pris la forme d'un chemin de déconditionnement.`),
    p(`Le déconditionnement, c'est tout le travail de la plateforme SOS Shine. C'est le cœur de la méthode. C'est ce sur quoi je travaille depuis 5 ans, et c'est ce que j'ai voulu rendre accessible à tous.`),
    p(`Parce que la majorité des choses qu'on prend pour "notre personnalité", "nos limites", "nos peurs", ne sont en réalité que des couches accumulées au fil des années. Des phrases qu'on a entendues. Des comportements qu'on a appris pour se protéger. Des croyances qu'on a avalées sans pouvoir les filtrer.`),
    p(`Et tant qu'on n'enlève pas ces couches, on construit sa vie sur quelque chose qui n'est pas vraiment soi.`),
    p(`Le déconditionnement, c'est exactement ça. C'est aller retirer, une par une, les choses qui ne nous appartiennent pas. C'est se reconnecter à ce qu'on était avant que le monde nous explique qui on devait être.`),
    p(`Laetitia a fait ce chemin. Pas en un week-end. Pas avec une formule magique. Avec un protocole, des étapes, du soutien, et le temps qu'il fallait pour qu'un corps et un système nerveux acceptent vraiment de changer.`),
    p(`Aujourd'hui, elle n'est plus la même.`),
    p(`Pas parce que quelqu'un l'a changée. Parce qu'elle s'est reconnectée à elle-même.`),
    p(`C'est ça, le chemin qu'on a construit dans SOS Shine.`),
    p(`Pas une promesse de transformation magique. Pas un programme de plus à empiler sur tous les autres. Une vraie méthode, le déconditionnement, déployée jour après jour, à travers des protocoles, des outils, une communauté et une structure qui te permettent enfin d'enlever ce qui ne t'appartient pas.`),
    p(`Tu peux faire exactement ce chemin-là.`),
    ctaButton('Rejoindre SOS Shine', URL_SERENITE, { email }),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Ce qui m'impressionne le plus chez Laetitia, ce n'est pas ce qu'elle a accompli. C'est le moment précis où elle a décidé qu'elle ne voulait plus subir. Ce moment-là, personne ne peut le décider à ta place. Mais quand il arrive, il faut être prêt·e à le saisir.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
