/**
 * Email 1 - Abandon quiz à Q10
 * Envoyé 2 min après email donné à Q10, SI quiz pas terminé
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

type Vars = { firstName: string; email: string; resumeUrl: string }

export function generateEmail01(vars: Vars): { subject: string; html: string } {
  const { firstName, email, resumeUrl } = vars
  const subject = `Tu t'es arrêtée. Et je crois savoir pourquoi.`

  const content = [
    p(`Coucou Shiner, c'est Julia.`),
    p(`Tu as répondu à 10 questions. Et puis tu t'es arrêté(e).`),
    p(`Honnêtement, je comprends.`),
    p(`Parce que les 5 questions qui suivent, celles que tu n'as pas encore vues, sont celles qui vont plus loin. Celles qui ne se contentent pas de gratter la surface.`),
    p(`Et quand on a passé des années à faire comme si tout allait bien, à porter ce qu'on porte en silence, ces questions-là peuvent serrer un peu la gorge.`),
    p(`Je le sais. Je suis passée par là. Depuis mes 16 ans, j'ai investi l'équivalent de dizaines de milliers d'euros en thérapies, en formations, en recherche. J'ai traversé un divorce qui a tout fait basculer. Et tout ça pour finir par comprendre une chose simple : la plupart de nos souffrances ne viennent pas de nous. Elles viennent de mécanismes invisibles qu'on traîne depuis l'enfance, et que personne ne nous a jamais appris à nommer.`),
    p(`Ce test, on l'a construit pendant des mois avec l'équipe SOS Shine® pour mettre des mots précis sur ces mécanismes. Pour que tu puisses enfin voir ce qui te bloque, et surtout, savoir quoi en faire.`),
    p(`Mais sans tes 5 dernières réponses, je ne peux pas te dire ce qui se passe vraiment chez toi.`),
    p(`Et il y a autre chose que je ne peux pas t'envoyer tant que le test n'est pas terminé.`),
    p(`À la fin, je t'offre mon ebook <em>Le Déconditionnement</em>. Une trentaine de pages, celles que j'ai mis vingt-deux ans à pouvoir écrire. Ce n'est pas un extrait, ce n'est pas un aperçu, c'est le socle entier de la méthode. Et il est à toi, sans rien en échange.`),
    p(`Trois autres cadeaux suivront dans les jours d'après. Mais celui-là commence par tes 5 dernières réponses.`),
    ctaButton('Reprendre là où je me suis arrêtée', resumeUrl, { email }),
    p(`Prends 2 minutes, honore toi maintenant.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : SOS Shine®, c'est né des urgences émotionnelles qu'on vit tous les jours sans savoir les nommer. La traduction littérale de SOS, c'est "sauver nos âmes". Et c'est un jour de février 2023 que ma quête de sens a vraiment pris un tournant : celui de transmettre mes 22 ans d'expérience à celles qui en ont besoin. Parce que quand on se rend compte à 40 ans qu'on a vécu sous conditionnements, on n'a pas 20 ans devant Soi. Et aujourd'hui, ce que je veux, c'est te transmettre mes 22 d'expériences. Pour que tu puisses créer ta vie le plus vite possible.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
