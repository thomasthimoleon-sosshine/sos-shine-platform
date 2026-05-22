/**
 * Email 4 - Ce qui se passe en toi depuis 48h (J+2)
 */
import { wrapEmail, p, goldDivider, signature } from './wrapper'

type Vars = { firstName: string; email: string }

export function generateEmail04(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Ce qui se passe en toi depuis 48h.`

  const content = [
    p(`Dans la Shine Family on brille !!! Hier, je t'ai dit que j'allais t'expliquer pourquoi tant de personnes restent bloquées, même après des années de thérapie ou de développement personnel. Je vais tenir ma promesse. Mais avant, je veux te poser une question. Depuis 48h, je crois qu'il y a forcément des questions qui ont commencé à trotter dans ta tête.`),
    p(`Une curiosité. Une envie de comprendre un peu plus loin.`),
    p(`Parce que c'est ce qui se passe presque toujours quand on découvre que ce qu'on prenait pour "sa personnalité", "son tempérament" ou "ses défauts" n'était en réalité qu'un ensemble de mécanismes appris. À ce moment précis, le cerveau ne veut plus revenir en arrière. Il veut avancer. Comprendre. Réagir différemment.`),
    p(`<strong style="color:#e0e0e0;">Tu n'es pas cassé(e).</strong>`),
    p(`Tu reproduis simplement des schémas que ton cerveau, ton corps et ton système émotionnel ont appris au fil du temps, pour te protéger d'un monde qui n'était pas toujours sûr quand tu étais petit(e).`),
    p(`Et une fois qu'on comprend ça, on ne veut plus se rendormir. Maintenant, voilà ce que j'ai compris au fil de toutes ces années.`),
    p(`J'ai accompagné des centaines de personnes brillantes. Lucides. Intelligentes. Des personnes qui avaient lu, compris, analysé, fait des thérapies, suivi des stages, avalé des podcasts et des livres entiers.`),
    p(`Et qui pourtant restaient coincées dans les mêmes cycles. Les mêmes schémas. Les mêmes histoires qui se répétaient. Ce n'était pas un manque de connaissance, c'était quelque chose de plus profond.`),
    p(`<strong style="color:#e0e0e0;">Comprendre quelque chose intellectuellement ne suffit jamais à le transformer.</strong>`),
    p(`Parce que les automatismes ne sont pas dans le mental. Ils sont dans le corps. Dans le système nerveux. Dans des connexions neuronales qui se sont gravées tellement tôt qu'elles fonctionnent en pilote automatique, sans même demander la permission au mental.`),
    p(`Tu peux savoir parfaitement que ton ex n'était pas la bonne personne. Et y retourner trois mois plus tard. Tu peux savoir que tu te sabotes au travail. Et continuer à le faire. Tu peux savoir d'où vient ta peur du rejet. Et continuer à fuir dès qu'on s'approche trop de toi.`),
    p(`Pourquoi ?`),
    p(`Parce que la connaissance s'installe dans une partie du cerveau. Et les automatismes vivent dans une autre. Et tant qu'on ne va pas reprogrammer cette deuxième partie, par le corps, par la répétition, par la sécurité émotionnelle, par des protocoles précis, rien ne change durablement.`),
    p(`C'est exactement ce qu'on a construit dans SOS Shine.`),
    p(`Quand j'ai imaginé la plateforme, je voulais une chose précise. Quelque chose qui soit disponible 24h/24. Pour que les personnes n'aient plus à attendre le prochain rendez-vous. Pour qu'au moment exact où l'urgence émotionnelle frappe - à 2h du matin, un dimanche, en plein milieu d'une nuit blanche ou juste après une dispute - elles trouvent une réponse. Un protocole. Une voix.`),
    p(`Un soir, j'étais dans ma chambre après une journée entière de rendez-vous. Et la seule chose que je voulais, c'était créer cet endroit. Un espace où les gens puissent se prendre en main au moment précis où ils en ont besoin.`),
    p(`Pas trois semaines plus tard. Maintenant.`),
    p(`C'est de là qu'est née la plateforme.`),
    p(`Et aujourd'hui, tu es à un croisement.`),
    goldDivider(),
    p(`<strong style="color:#e0e0e0;">Chemin 1 :</strong> tu refermes cette parenthèse. Dans trois semaines, tu auras à peine relu ta Signature. Dans six mois, ton cerveau sera retourné dans ses anciens automatismes. Et tu seras exactement au même point qu'aujourd'hui.`),
    p(`<strong style="color:#e0e0e0;">Chemin 2 :</strong> tu transformes cette curiosité naissante en action. Pas une grosse action. Juste quelques minutes par jour, dans une structure qui sait quoi te proposer, à quel moment, en fonction de qui tu es.`),
    p(`C'est ça, SOS Shine.`),
    goldDivider(),
    p(`À très vite.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu prends 30 secondes ce soir avant de dormir, pose-toi juste cette question : "Si rien ne change dans les 12 prochains mois, est-ce que la vie que je vivrai me ressemble vraiment ?" Tu n'as pas besoin de répondre maintenant. Laisse simplement la question s'installer.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
