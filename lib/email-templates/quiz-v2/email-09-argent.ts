/**
 * Email 9 - Combien vaut le fait de respirer enfin (J+7)
 */
import { wrapEmail, p, ctaButton, ctaLink, signature } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail09(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Combien vaut le fait de respirer enfin.`

  const content = [
    p(`Je vais te poser une vraie question aujourd'hui. Combien vaut le fait de respirer enfin intérieurement ? Pas "aller bien" deux jours après un week-end de yoga. Pas tenir jusqu'aux vacances en serrant les dents. Pas oublier momentanément ce qu'on porte grâce à un verre, un épisode, un voyage.`),
    p(`Je parle de retrouver de la paix dans ton quotidien. Dans ton corps. Dans ton mental. Dans ta façon de regarder ta vie quand tu te lèves le matin.`),
    p(`Honnêtement, beaucoup de personnes dépensent des centaines, parfois des milliers d'euros pour essayer d'aller mieux.`),
    p(`Des séances. Des stages. Des formations. Des thérapies. Des week-ends entiers de développement personnel. Je sais de quoi je parle. Depuis mes 16 ans, j'ai investi l'équivalent de dizaines de milliers d'euros dans ma propre recherche. Je suis passée par énormément de pratiques, de personnes, d'approches.`),
    p(`Et ce que j'ai constaté, à un moment, c'est que malgré toutes ces dépenses, malgré tous ces efforts, beaucoup de personnes restaient bloquées dans les mêmes schémas.`),
    p(`Pas parce qu'elles n'investissaient pas. Pas parce qu'elles n'étaient pas sérieuses. Mais parce qu'il manquait une chose essentielle : une structure quotidienne, suivie, cohérente. Pas un coup de motivation tous les six mois. Une présence régulière.`),
    p(`C'est exactement pour cette raison que j'ai pensé SOS Shine différemment. Pas comme un programme à acheter. Pas comme une cure ponctuelle. Pas comme un coaching intensif qui te laisse seul(e) après trois mois.`),
    p(`Comme un espace vivant. Quotidien. Disponible 24h/24. Dans lequel tu avances à ton rythme, avec des outils concrets, sans avoir à attendre la prochaine séance, le prochain stage, la prochaine semaine.`),
    p(`Pour moins que le prix d'une seule séance classique avec un thérapeute, tu retrouves chaque mois :`),
    p(`Des protocoles guidés, personnalisés selon ton profil. Des exercices émotionnels et cognitifs. Des méditations et des audios à fréquences spécifiques. Des lives mensuels. Une encyclopédie complète des défis émotionnels. Une communauté de personnes qui traversent souvent les mêmes choses que toi. Et surtout, un espace où tu peux enfin arrêter de tout porter seul·e.`),
    p(`Sans engagement. Sans carte de crédit obligatoire si tu hésites. Juste pour ressentir si cet endroit te fait du bien.`),
    p(`Parce qu'au fond, ta paix intérieure influence toute ta vie. Tes relations. Ton énergie. Ton sommeil. Ton travail. Ta santé. Tes décisions. Ta capacité à profiter de tes enfants. Ta façon d'aimer. Ta façon de te montrer au monde.`),
    p(`Tout part de là.`),
    p(`Et quand on regarde les choses honnêtement, la vraie question n'est plus "est-ce que ça coûte trop cher ?".`),
    p(`C'est <em>"combien ça me coûte, chaque jour, de continuer à fonctionner comme ça ?"</em>`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu hésites encore, je veux que tu saches une chose. Le tarif d'entrée de SOS Shine est volontairement bas. Pas parce que ce qu'on y offre vaut peu. Parce que je voulais que personne ne reste bloqué(e) dehors faute de moyens. C'est une décision que j'ai prise au tout début, et que je tiens depuis. La plateforme doit rester accessible.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
