import type { Band } from "./scoring";

/* ═══════════════════════════════════════════════════════════════
   Lecture du parcours Solo.
   Trois températures par chapitre. Jamais de diagnostic, jamais de
   « tu devrais ». On décrit ce qui est, et on donne un geste.
═══════════════════════════════════════════════════════════════ */

export type Reading = { verdict: string; geste: string };

export const SOLO_READINGS: Record<string, Record<Band, Reading>> = {
  pret: {
    contracte: {
      verdict:
        "Tu n’attends pas : tu patientes. Ce n’est pas la même chose. Patienter protège, attendre expose — et seul ce qui est exposé peut être trouvé.",
      geste:
        "Cette semaine, ouvre une porte que tu évites depuis des mois. Une seule. Peu importe laquelle.",
    },
    "en-chemin": {
      verdict:
        "Une part de toi s’est remise en mouvement, une autre garde la main sur la poignée. C’est l’état le plus honnête, et le plus inconfortable.",
      geste:
        "Écris ce que tu ferais demain si c’était déjà arrivé. Puis fais-en une chose aujourd’hui.",
    },
    disponible: {
      verdict:
        "Tu es disponible. Pas guéri, pas parfait : disponible. C’est la seule condition qui compte, et la plus rare.",
      geste:
        "Ne remplis pas cette disponibilité. Garde-la vide, exprès, pendant un mois.",
    },
  },
  confiance: {
    contracte: {
      verdict:
        "Ta valeur est encore négociée à l’extérieur. Chaque silence devient un verdict, chaque retard une preuve. Ce n’est pas de la faiblesse — c’est une habitude ancienne qui n’a jamais été mise à jour.",
      geste:
        "La prochaine fois qu’un silence te tord, note l’heure et ce que tu t’es dit. Rien d’autre. Regarde la liste dans dix jours.",
    },
    "en-chemin": {
      verdict:
        "Tu tiens debout, mais tu vérifies. La confiance est là ; elle n’est pas encore silencieuse.",
      geste:
        "Une fois cette semaine, ne te justifie pas. Dis ce que tu veux, point, sans la phrase d’explication qui suit toujours.",
    },
    disponible: {
      verdict:
        "Tu ne te lâches pas la main. Ça se voit dans le corps avant les mots, et les autres le sentent avant de le comprendre.",
      geste:
        "Sers-t’en : va vers ce qui t’intimide encore. La confiance non employée s’atrophie.",
    },
  },
  "amour-propre": {
    contracte: {
      verdict:
        "Tu acceptes des choses que tu n’accepterais d’aucun de tes proches. C’est là qu’on lit l’amour propre : pas dans les affirmations, dans les refus.",
      geste:
        "Choisis une seule chose de ta liste et refuse-la cette semaine. Une phrase suffit : « Non, pas comme ça. »",
    },
    "en-chemin": {
      verdict:
        "Tu te respectes par intermittence — solide quand tu vas bien, négociable quand tu as peur de perdre.",
      geste:
        "Relis la phrase que tu te dis les mauvais soirs. Écris-la à la troisième personne. Vois si tu la dirais à quelqu’un.",
    },
    disponible: {
      verdict:
        "Tu t’habites avec tendresse. C’est ce qui te rend difficile à abîmer — et lisible pour ceux qui savent regarder.",
      geste:
        "Nomme une chose que tu ne céderas jamais, quelle que soit la personne en face. Écris-la et garde-la.",
    },
  },
  dependance: {
    contracte: {
      verdict:
        "Ton équilibre est branché sur quelqu’un d’autre. Quand il bouge, tu bouges. Ce n’est pas de l’amour : c’est un système nerveux qui n’a jamais appris qu’on pouvait rester.",
      geste:
        "La prochaine fois que l’autre se retire, ne fais rien pendant vingt-quatre heures. Pas de message, pas de réparation. Reste avec la sensation.",
    },
    "en-chemin": {
      verdict:
        "Tu sens le besoin, tu le vois venir, tu ne t’y jettes plus systématiquement. C’est déjà une liberté considérable.",
      geste:
        "Repère ta manœuvre habituelle — devenir utile, écrire, disparaître — et remplace-la une fois par une phrase directe.",
    },
    disponible: {
      verdict:
        "Tu peux aimer sans t’accrocher. Tu choisis au lieu d’avoir besoin, et c’est exactement ce qui rend un lien respirable.",
      geste:
        "Vérifie que ce calme n’est pas une distance déguisée. Va vers quelqu’un cette semaine, sans motif.",
    },
  },
  solitude: {
    contracte: {
      verdict:
        "La solitude est un trou, et tu passes beaucoup d’énergie à le combler. Ce que tu cherches dans les autres n’y est pas — sinon tu l’aurais déjà trouvé.",
      geste:
        "Un soir cette semaine : seul, sans écran, sans alcool, sans appel. Trois heures. Note ce qui monte.",
    },
    "en-chemin": {
      verdict:
        "Tu supportes la solitude, tu ne l’habites pas encore. Tu comptes les jours au lieu de les vivre.",
      geste:
        "Fais seul une chose que tu réserves d’habitude à deux : un restaurant, un film, un voyage court.",
    },
    disponible: {
      verdict:
        "Tu es un lieu habitable pour toi-même. C’est précisément ce qui te rendra habitable pour quelqu’un d’autre — dans cet ordre-là, jamais l’inverse.",
      geste:
        "Garde cet endroit. Une soirée par semaine, à toi, même quand quelqu’un arrivera.",
    },
  },
  ouverture: {
    contracte: {
      verdict:
        "Quelque chose en toi recule devant ce que tu dis vouloir. Ce n’est pas de l’incohérence : ce que tu attends coûte quelque chose, et tu n’as pas encore accepté de payer.",
      geste:
        "Écris ce que tu perdrais si ça arrivait demain. Ne cherche pas la réponse noble — cherche la vraie.",
    },
    "en-chemin": {
      verdict:
        "Tu veux, avec un vertige. Le vertige n’est pas un obstacle : c’est le signe que la chose est à ta taille.",
      geste:
        "Dis oui à une seule invitation qui te fait peur ce mois-ci. N’importe laquelle.",
    },
    disponible: {
      verdict:
        "Tu es perméable. Tu sais recevoir sans devoir rendre aussitôt — ce qui est une forme de courage assez rare.",
      geste:
        "Reçois quelque chose cette semaine sans compenser. Dis merci, et ne fais rien d’autre.",
    },
  },
  corps: {
    contracte: {
      verdict:
        "Ton corps est un outil, pas un lieu. Tu le remarques quand il fait mal. Le désir, lui, ne s’adresse jamais à un outil.",
      geste:
        "Dix minutes par jour, sans but : marcher lentement, respirer, poser une main sur ton sternum. Rendre au corps l’usage de l’inutile.",
    },
    "en-chemin": {
      verdict:
        "Tu reviens dans ton corps par moments, souvent quand tu es enfin seul. Le désir est là, il attend un peu d’espace.",
      geste:
        "Repère un moment de la journée où tu te sens vraiment dans ton corps. Double sa durée cette semaine.",
    },
    disponible: {
      verdict:
        "Tu habites ton corps, et il parle avant ta tête. C’est de là que vient la présence — celle qu’on remarque dans une pièce sans savoir pourquoi.",
      geste:
        "Écoute-le sur une décision importante ce mois-ci. Suis-le, même si la tête proteste.",
    },
  },
};
