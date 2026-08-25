/**
 * Email 3 - Une question qui va peut-être te déranger (J+1)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'
import { CADEAUX } from './cadeaux'

type Vars = { firstName: string; email: string }

export function generateEmail03(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Une question qui va peut-être te déranger.`

  const content = [
    firstName ? p(`Coucou Shiner, depuis hier, combien de fois tu as repensé à ta Signature Émotionnelle ?`) : p(`Depuis hier, combien de fois tu as repensé à ta Signature Émotionnelle ?`),
    p(`Combien de fois tu t'es dit : « C'est fou. C'est exactement ce que je ressens. » Ou : « Je n'avais jamais réussi à mettre des mots là-dessus. » Si tu es comme la plupart des personnes qui passent par le test, c'est arrivé plusieurs fois et c'est normal.`),
    p(`Parce que quand le cerveau met enfin de la conscience sur quelque chose qu'il vivait en automatique depuis des années, il ne peut plus faire semblant de ne pas l'avoir vu. C'est souvent là que les choses commencent à bouger. Pas de manière spectaculaire. Pas avec des feux d'artifice. Mais intérieurement.`),
    p(`Une phrase qu'on relit le soir. Une émotion qui remonte sans prévenir. Un comportement qu'on observe enfin de l'extérieur. Une fatigue qu'on comprend autrement.`),
    p(`Et je veux te dire quelque chose, parce que je suis passée par là. Ça fait maintenant 5 ans que je travaille sur ce que j'appelle le déconditionnement. Que je le déploie, que je le modifie, qu'il évolue en même temps que moi et mes expériences personnelles et professionnelles. Parce que le conditionnement, ce n'est pas un concept. C'est ce qui structure nos réactions, nos choix, nos relations, parfois sans qu'on en soupçonne l'existence.`),
    p(`Quand j'ai commencé à parler de ça du subconscient, des enregistrements, que j'ai parlé de mes recherches, ma mère m'a dit : "Mais toi, tu n'as jamais été conditionnée."`),
    p(`Sauf qu'avec un seul son de cloche, une seule personne référente, pas de famille élargie, un cercle très restreint… je crois honnêtement que j'ai été la fille la plus conditionnée qui soit - c'est exactement pour cette raison que j'en ai fait un programme.`),
    p(`Parce que je vois trop de personnes qui ont la connaissance, qui ont lu, qui ont compris, qui ont fait des thérapies pendant des années, et qui restent bloquées. Pas parce qu'elles manquent de volonté. Mais parce que les automatismes installés par le conditionnement sont plus forts que la compréhension intellectuelle.`),
    p(`<strong style="color:#e0e0e0;">Comprendre n'est pas suffisant.</strong>`),
    p(`Le cerveau a besoin de répétition. Le système nerveux a besoin de sécurité. Le corps a besoin de vivre autre chose pour arrêter de reproduire les mêmes schémas. C'est précisément ce qu'on construit chaque jour dans SOS Shine®, avec William, Thomas.`),
    p(`Au passage : hier je t'ai offert l'ebook <em>Le Déconditionnement</em>. Si tu ne l'as pas encore ouvert, il t'attend. Ce n'est pas grave si tu le lis dans trois semaines, mais télécharge-le maintenant, tant que le lien est sous tes yeux.`),
    ctaButton('Récupérer mon ebook offert', CADEAUX.deconditionnement.url, { email }),
    p(`Et demain, je vais te dire pourquoi tant de personnes restent bloquées, même après des années de thérapie ou de développement personnel. Ce que je vais t'expliquer, peu de coachs ou de thérapeutes osent le dire clairement. Et je t'offrirai un deuxième cadeau en même temps.`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu te reconnais dans ce que je viens d'écrire, fais-toi une petite faveur ce soir. Reprends ton résultat. Relis-le calmement. Et observe juste ce qui se passe en toi à cette lecture. C'est déjà un premier mouvement intérieur.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
