import type { Question, Theme } from "./types";

/* ═══════════════════════════════════════════════════════════════
   PARCOURS COUPLE — « Se redécouvrir »
   Chacun répond seul, sur son propre compte. Rien n’est visible
   avant que les deux aient terminé.

   La clé du croisement est l’angle (`lens`) :
     · "self"  — ce que je vis
     · "other" — ce que je crois que l’autre vit
     · "us"    — ce que je vois de nous
   Comparer le "self" de l’un au "other" de l’autre, c’est là que
   se trouve la vraie information : l’écart entre ce qu’on croit
   montrer et ce qui arrive de l’autre côté.
═══════════════════════════════════════════════════════════════ */

export type Lens = "self" | "other" | "us";

export type DuoQuestion = Question & { lens: Lens };

export const DUO_THEMES: Theme[] = [
  {
    id: "eteint",
    numeral: "I",
    title: "Ce qui s’est éteint",
    epigraph: "Ça ne s’est pas cassé. Ça s’est refroidi, un soir après l’autre.",
  },
  {
    id: "non-dits",
    numeral: "II",
    title: "Les non-dits",
    epigraph: "Ce qu’on ne dit pas finit par occuper toute la place.",
  },
  {
    id: "desir",
    numeral: "III",
    title: "Le désir",
    epigraph: "Le désir ne meurt pas d’usure. Il meurt d’inattention.",
  },
  {
    id: "presence",
    numeral: "IV",
    title: "La présence",
    epigraph: "Être là n’est pas être présent. L’autre sait faire la différence.",
  },
  {
    id: "redecouverte",
    numeral: "V",
    title: "Se redécouvrir",
    epigraph: "On ne retombe pas amoureux de l’autre. On redevient quelqu’un dont on peut tomber amoureux.",
  },
];

export const DUO_QUESTIONS: DuoQuestion[] = [
  /* ── I. CE QUI S’EST ÉTEINT ──────────────────────────────── */
  {
    id: "eteint-1",
    themeId: "eteint",
    lens: "us",
    narrative:
      "Personne n’a claqué de porte. Il y a eu une soirée, puis une autre, puis six cents. Le froid n’est pas arrivé : il s’est installé, poliment, pendant que vous étiez occupés à faire tourner une vie.",
    prompt: "Entre vous, aujourd’hui, la température est",
    kind: "scale",
    poles: ["Froide", "Brûlante"],
  },
  {
    id: "eteint-2",
    themeId: "eteint",
    lens: "self",
    narrative:
      "Il y a une chose que tu faisais au début et que tu ne fais plus. Tu sais très bien laquelle. Tu as arrêté sans décision, sans dispute — juste un jour, tu ne l’as pas fait, et c’est resté comme ça.",
    prompt: "Ce que tu as cessé de faire",
    kind: "multi",
    options: [
      { id: "a", label: "Le regarder vraiment, longtemps, sans raison" },
      { id: "b", label: "Le toucher en passant, sans que ça mène ailleurs" },
      { id: "c", label: "Raconter ma journée en entier" },
      { id: "d", label: "Faire des choses seul et revenir avec du neuf" },
      { id: "e", label: "Demander. J’attends qu’il ou elle devine." },
      { id: "f", label: "M’habiller, me préparer, pour lui ou pour elle" },
    ],
  },
  {
    id: "eteint-3",
    themeId: "eteint",
    lens: "other",
    narrative:
      "L’autre aussi a arrêté quelque chose. On le remarque toujours plus vite chez l’autre que chez soi — c’est ce qui rend cette question facile, et son résultat désagréable.",
    prompt: "Selon toi, ce qui manque le plus à l’autre en ce moment",
    kind: "choice",
    options: [
      { id: "a", label: "Être désiré", value: 3 },
      { id: "b", label: "Être écouté sans être conseillé", value: 3 },
      { id: "c", label: "Être admiré pour ce qu’il ou elle est devenu", value: 3 },
      { id: "d", label: "Être laissé tranquille, avoir de l’espace", value: 3 },
      { id: "e", label: "Être rassuré, savoir que je reste", value: 3 },
      { id: "f", label: "Je ne sais pas. Et ça me dérange de l’écrire.", value: 1 },
    ],
  },
  {
    id: "eteint-4",
    themeId: "eteint",
    lens: "self",
    narrative:
      "Cette réponse-là, l’autre la lira. Écris-la en sachant qu’elle sera lue — mais écris-la vraie quand même.",
    prompt: "Quel est le jour exact, ou la période, où quelque chose a changé ?",
    kind: "text",
    placeholder: "Un moment, une phrase, un silence. Ce que tu as en tête là, maintenant.",
  },

  /* ── II. LES NON-DITS ────────────────────────────────────── */
  {
    id: "non-dits-1",
    themeId: "non-dits",
    lens: "self",
    narrative:
      "Il y a une phrase que tu portes depuis des mois. Tu l’as répétée dans ta tête, dans la voiture, sous la douche. Elle n’est jamais sortie, et à force elle a pris du poids.",
    prompt: "Cette phrase pèse",
    kind: "scale",
    reverse: true,
    poles: ["Rien, ou presque", "Elle pèse sur tout"],
  },
  {
    id: "non-dits-2",
    themeId: "non-dits",
    lens: "self",
    narrative:
      "On se tait toujours pour une bonne raison. C’est ce qui rend le silence si durable.",
    prompt: "Si tu ne dis pas, c’est surtout parce que",
    kind: "choice",
    options: [
      { id: "a", label: "J’ai peur de ce que ça déclencherait.", value: 2 },
      { id: "b", label: "Je l’ai déjà dit et rien n’a changé.", value: 2 },
      { id: "c", label: "Je protège l’autre. Ou je me le raconte.", value: 3 },
      { id: "d", label: "Je n’arrive pas à trouver les mots justes.", value: 4 },
      { id: "e", label: "Je dis les choses. C’est l’accueil qui manque.", value: 5 },
      { id: "f", label: "Je ne me tais pas. On se parle vraiment.", value: 7 },
    ],
  },
  {
    id: "non-dits-3",
    themeId: "non-dits",
    lens: "other",
    narrative:
      "L’autre, lui aussi, garde quelque chose. Tu le sens à un pli du visage, à une façon de couper court sur un sujet précis.",
    prompt: "Ce que l’autre ne te dit pas, tu",
    kind: "scale",
    poles: ["N’en as aucune idée", "Le sais précisément"],
  },
  {
    id: "non-dits-4",
    themeId: "non-dits",
    lens: "self",
    narrative:
      "Voilà l’endroit. Une seule phrase. Celle que tu n’as jamais dite. Elle sera montrée à l’autre à la fin, en même temps que la sienne — jamais avant.",
    prompt: "Dis-la.",
    kind: "text",
    placeholder: "Une phrase. Pas un paragraphe d’explication : la phrase elle-même.",
  },

  /* ── III. LE DÉSIR ───────────────────────────────────────── */
  {
    id: "desir-1",
    themeId: "desir",
    lens: "self",
    narrative:
      "Le désir ne s’use pas à force d’être utilisé. Il s’endort quand plus personne ne le regarde. Comme un animal, il revient si on lui laisse de la place et du silence.",
    prompt: "Ton désir, pour l’autre, aujourd’hui",
    kind: "scale",
    poles: ["Dort profondément", "Est bien réveillé"],
  },
  {
    id: "desir-2",
    themeId: "desir",
    lens: "other",
    narrative:
      "Se sentir désiré et être désiré sont deux choses différentes. Beaucoup de couples brûlent en silence, chacun persuadé d’être le seul à brûler.",
    prompt: "Selon toi, l’autre te désire",
    kind: "scale",
    poles: ["Plus vraiment", "Autant qu’avant"],
  },
  {
    id: "desir-3",
    themeId: "desir",
    lens: "us",
    narrative:
      "Entre vos deux corps, il y a un espace. Il a une texture précise — et vous la connaissez tous les deux, même si personne ne la nomme.",
    prompt: "Entre vos corps, ce qu’il y a maintenant",
    kind: "choice",
    options: [
      { id: "a", label: "De l’habitude. Les gestes sont là, la présence non.", value: 3 },
      { id: "b", label: "De la gêne. On ne sait plus trop comment s’y prendre.", value: 2 },
      { id: "c", label: "De la distance. On ne se touche presque plus.", value: 1 },
      { id: "d", label: "De la tendresse, mais peu de feu.", value: 4 },
      { id: "e", label: "Du feu, mais peu de tendresse.", value: 4 },
      { id: "f", label: "Les deux. C’est vivant.", value: 7 },
    ],
  },
  {
    id: "desir-4",
    themeId: "desir",
    lens: "self",
    narrative:
      "On demande rarement, parce que demander, c’est avouer qu’on n’a pas. Et pourtant rien ne revient sans être demandé.",
    prompt:
      "Ce que tu voudrais qu’on te fasse, ou qu’on te dise, et que tu n’as jamais osé demander",
    kind: "text",
    placeholder: "Précis. Le vague ne se donne pas.",
  },

  /* ── IV. LA PRÉSENCE ─────────────────────────────────────── */
  {
    id: "presence-1",
    themeId: "presence",
    lens: "self",
    narrative:
      "Vous êtes dans la même pièce depuis deux heures. La question n’est pas de savoir si tu étais là. C’est de savoir où tu étais.",
    prompt: "Quand vous êtes ensemble, tu es",
    kind: "scale",
    poles: ["Ailleurs, souvent", "Vraiment là"],
  },
  {
    id: "presence-2",
    themeId: "presence",
    lens: "other",
    narrative:
      "L’autre sait toujours quand tu n’es pas là. Il ne le dit pas, mais il ajuste : il raconte moins, il demande moins, il attend moins.",
    prompt: "L’autre, quand vous êtes ensemble, est",
    kind: "scale",
    poles: ["Ailleurs, souvent", "Vraiment là"],
  },
  {
    id: "presence-3",
    themeId: "presence",
    lens: "self",
    narrative:
      "Être présent à l’autre demande d’abord d’être présent à soi. On ne peut pas offrir un lieu qu’on n’habite pas.",
    prompt: "En ce moment, avec toi-même, tu es",
    kind: "choice",
    options: [
      { id: "a", label: "En fuite. Je me remplis pour ne pas me sentir.", value: 1 },
      { id: "b", label: "En apnée. Je tiens, je verrai plus tard.", value: 2 },
      { id: "c", label: "En surface. Je fonctionne bien, je m’habite peu.", value: 3 },
      { id: "d", label: "En chemin. Je reviens vers moi par moments.", value: 5 },
      { id: "e", label: "Chez moi. Je sais ce que je ressens quand je le ressens.", value: 7 },
    ],
  },
  {
    id: "presence-4",
    themeId: "presence",
    lens: "us",
    narrative:
      "Il y a une chose que l’autre fait, minuscule, et qui te ramène. Un geste, un son, une manière. Tu ne lui as probablement jamais dit.",
    prompt: "Ce petit geste de l’autre qui te ramène toujours",
    kind: "text",
    placeholder: "Décris-le. C’est peut-être ce qu’il ou elle a besoin d’entendre le plus.",
  },

  /* ── V. SE REDÉCOUVRIR ───────────────────────────────────── */
  {
    id: "redecouverte-1",
    themeId: "redecouverte",
    lens: "self",
    narrative:
      "On croit qu’il faut retrouver l’autre. C’est faux. On tombe amoureux de quelqu’un qui est en train de devenir. Quand plus personne ne devient, il n’y a plus rien vers quoi tomber.",
    prompt: "Depuis un an, est-ce que tu es devenu quelqu’un ?",
    kind: "scale",
    poles: ["Je me suis figé", "Je me suis transformé"],
  },
  {
    id: "redecouverte-2",
    themeId: "redecouverte",
    lens: "self",
    narrative:
      "Il y a une partie de toi que la vie commune a rangée dans un tiroir. Pas par cruauté — par organisation. Elle n’est pas morte, elle est pliée.",
    prompt: "Ce que tu as mis de côté depuis que vous êtes ensemble",
    kind: "multi",
    options: [
      { id: "a", label: "Mon corps : le sport, la danse, le soin, le plaisir" },
      { id: "b", label: "Mes amitiés, ma vie à moi" },
      { id: "c", label: "Une ambition, un projet, une création" },
      { id: "d", label: "Ma capacité à être seul et à en jouir" },
      { id: "e", label: "Une part sexuelle de moi que je ne montre plus" },
      { id: "f", label: "Rien. Je suis entier dans cette relation." },
    ],
  },
  {
    id: "redecouverte-3",
    themeId: "redecouverte",
    lens: "other",
    narrative:
      "Regarde l’autre comme si tu ne le connaissais pas. Pas le partenaire : la personne. Elle a changé pendant que tu regardais ailleurs.",
    prompt: "Ce qui a changé chez l’autre cette année et que tu n’as jamais nommé",
    kind: "text",
    placeholder: "Quelque chose de vrai. Une qualité nouvelle, une fatigue, une force.",
  },
  {
    id: "redecouverte-4",
    themeId: "redecouverte",
    lens: "self",
    narrative:
      "Dernière question. Elle décide de la suite : ce parcours ne répare pas les couples qui veulent être réparés sans bouger.",
    prompt: "Ce que tu es prêt à faire, toi, dans les trente jours",
    kind: "choice",
    options: [
      { id: "a", label: "Écouter, sans me défendre, une fois par semaine.", value: 5 },
      { id: "b", label: "Reprendre une chose que j’ai rangée pour nous.", value: 6 },
      { id: "c", label: "Dire la phrase que je n’ai jamais dite.", value: 7 },
      { id: "d", label: "Retoucher l’autre sans que ça mène au sexe.", value: 6 },
      { id: "e", label: "Je ne sais pas encore. Mais je suis là.", value: 4 },
    ],
  },
];

export const DUO_ORDER: string[] = DUO_THEMES.flatMap((t) =>
  DUO_QUESTIONS.filter((q) => q.themeId === t.id).map((q) => q.id)
);
