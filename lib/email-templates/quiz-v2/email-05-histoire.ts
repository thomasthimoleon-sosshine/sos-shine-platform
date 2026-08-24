/**
 * Email 5 - Moi aussi, j'étais à ta place (J+3)
 */
import { wrapEmail, p, ctaButton, ctaLink, signature } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail05(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Moi aussi, j'étais à ta place.`

  const content = [
    firstName ? p(`Shiner,`) : '',
    p(`Hier, je t'ai dit que comprendre ne suffisait pas.`),
    p(`Aujourd'hui, je veux te raconter comment j'ai appris cette leçon dans ma propre chair. Il y a 7 ans, j'étais exactement à ta place. J'avais déjà beaucoup d'outils. Je lisais énormément. Je voyais des thérapeutes, des coachs, des énergéticiens. J'accumulais les prises de conscience. Je comprenais. J'analysais. Je faisais des liens entre tout.`),
    p(`J'étais à Pékin. Mariée. Trois enfants. Une vie qui ressemblait, vue de l'extérieur, à ce qu'il faut avoir pour être heureuse. Sauf qu'à l'intérieur, je m'éteignais doucement. Je faisais passer tout le monde avant moi. Je vivais dans la survie. Pas dans la vie. Jusqu'au jour où j'ai compris quelque chose de très simple, et qui a tout changé.`),
    p(`<strong style="color:#e0e0e0;">Comprendre ne suffit pas. Il faut une action.</strong>`),
    p(`Il faut aussi de l'amour pour soi, mais ça, je t'en parlerai dans un prochain mail. C'est tout un sujet, et il mérite qu'on s'y attarde vraiment.`),
    p(`Pour le moment, retiens juste ça : aucune transformation profonde n'a lieu sans passage à l'action.`),
    p(`Et cette action, pour moi, ce jour-là, ça a été de me choisir, au mois de mai un jeudi vers 6h30 du matin, j'ai prit cette décision car j'allais encore commençais une journée qui me tuait chaque jour. J'ai quitté Pékin. J'ai divorcé. Je suis rentrée en France avec mes trois enfants. Le chemin que j'ai pris était terrifiant. J'ai tout reconstruit à zéro. Une maison. Un métier. Une identité. Une vie entière.`),
    p(`À cette époque-là, j'aurais tellement aimé avoir un endroit comme SOS Shine. Un endroit où parler. Où comprendre ce qui se passait en moi. Où respirer sans avoir à expliquer. Où ne plus me sentir seule face à tout ce que je traversais intérieurement.`),
    p(`Mais je l'ai fait. Et je ne regrette absolument rien. Lors de mon retour en France, je savais exactement ce que je voulais. Je voulais une maison au bord d'un lac. Dans le sud. Entourée de nature. Pour mes enfants, pour moi, pour la vie que je voulais construire.`),
    p(`Aujourd'hui, je t'écris ce mail depuis cette maison. Au bord de ce lac. Exactement celle que j'avais imaginée.`),
    p(`Parce que j'ai créé ce que je voulais. Et tout ça n'est pas arrivé parce que j'avais accumulé encore plus de connaissances. C'est arrivé le jour où j'ai commencé à les mettre en action. C'est ce jour-là que ma propre vie a changé.`),
    p(`Et c'est aussi de ce jour-là qu'est née la méthode qu'on déploie aujourd'hui dans SOS Shine. Pour que tu n'aies pas à faire ce chemin seule. Pour que tu aies l'endroit que je n'ai pas eu.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu as lu jusqu'ici, c'est que quelque chose dans cette histoire te parle. Peut-être que tu n'es pas marié(e) à Pékin. Peut-être que ton point de bascule, c'est autre chose. Mais il y a une chose que je sais : quand on commence à entendre cet appel intérieur, il ne s'éteint plus. Il revient. Encore. Et encore. Jusqu'à ce qu'on lui réponde.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
