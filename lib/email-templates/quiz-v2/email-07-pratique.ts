/**
 * Email 7 — Un petit cadeau pour aujourd'hui (J+5)
 */
import { wrapEmail, p, quoteBlock, signature, spacer } from './wrapper'

type Vars = { firstName: string; email: string; topProtocol?: string }

export function generateEmail07(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Un petit cadeau pour aujourd'hui.`

  const content = [
    p(`Aujourd'hui, je vais te donner quelque chose de très simple.`),
    p(`Mais ne sous-estime jamais les choses simples.`),
    p(`Parce qu'en réalité, le cerveau et le corps ne changent presque jamais dans les grands moments spectaculaires. Ils prennent conscience avec les retraites de 10 jours, les week-ends de transformation, mais ton ADN lui il se modifie avec les petites répétitions du quotidien.`),
    p(`Dans ces gestes minuscules qu'on pose, jour après jour, sans même réaliser sur le moment qu'on est en train de reprogrammer quelque chose en profondeur.`),
    p(`Alors aujourd'hui, prends simplement 3 minutes pour toi.`),
    spacer(8),
    quoteBlock(`1. Assieds-toi dans le calme.<br>2. Pose une main sur ton cœur.<br>3. Respire lentement, 5 fois. Une vraie respiration ample, jusque dans le ventre.<br>4. Et intérieurement, répète doucement :<br><em>"J'ai le droit de me choisir. J'ai le droit d'exister autrement que dans la survie."</em><br>5. Reste quelques secondes avec cette phrase. Sans rien attendre. Sans rien forcer. Juste, observe ce qui se passe.`),
    spacer(16),
    p(`C'est tout, trois minutes, une main, une phrase.`),
    p(`Et pourtant, ce sont précisément ces petits moments qui finissent par modifier quelque chose de beaucoup plus profond à l'intérieur. Parce que le corps a besoin de répétition pour intégrer une nouvelle réalité. Il ne croit pas ce qu'on lui dit. Il croit ce qu'on lui fait vivre.`),
    p(`Essaie. Aujourd'hui. Demain. Pendant quelques jours.`),
    p(`Et si tu en ressens l'envie, réponds-moi simplement à ce mail pour me dire ce que tu as ressenti.`),
    p(`Oui, c'est vraiment moi qui les lis.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Cette pratique fait partie des micro-rituels qu'on déploie dans SOS Shine. Pas comme des recettes. Comme des graines qu'on plante chaque jour dans un sol qui finit par tout transformer. La vraie magie, elle est là. Pas dans le spectaculaire. Dans la régularité.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
