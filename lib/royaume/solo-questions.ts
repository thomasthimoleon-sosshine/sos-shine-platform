import type { Question, Theme } from "./types";

/* ═══════════════════════════════════════════════════════════════
   PARCOURS SOLO — « Préparer le terrain »
   Sept chapitres. Chaque question est précédée d’une descente :
   deux à cinq phrases qui posent une image, pas une explication.
   On ne demande jamais « note-toi de 1 à 10 sur ta confiance ».
   On demande ce qu’on fait, à trois heures du matin, quand personne
   ne regarde.
═══════════════════════════════════════════════════════════════ */

export const SOLO_THEMES: Theme[] = [
  {
    id: "pret",
    numeral: "I",
    title: "Être prêt",
    epigraph: "On ne devient pas prêt. On devient disponible.",
  },
  {
    id: "confiance",
    numeral: "II",
    title: "La confiance",
    epigraph: "Ce n’est pas se croire capable. C’est ne pas se lâcher la main.",
  },
  {
    id: "amour-propre",
    numeral: "III",
    title: "L’amour propre",
    epigraph: "Se respecter, ça se voit à ce qu’on refuse.",
  },
  {
    id: "dependance",
    numeral: "IV",
    title: "Le besoin",
    epigraph: "Aimer, ce n’est pas avoir besoin. C’est choisir encore.",
  },
  {
    id: "solitude",
    numeral: "V",
    title: "La solitude",
    epigraph: "Qui sait rester seul ne mendie plus.",
  },
  {
    id: "ouverture",
    numeral: "VI",
    title: "L’ouverture",
    epigraph: "Ce que tu appelles chance s’appelle souvent perméabilité.",
  },
  {
    id: "corps",
    numeral: "VII",
    title: "Le corps",
    epigraph: "Le désir ne ment pas. C’est nous qui n’écoutons plus.",
  },
];

export const SOLO_QUESTIONS: Question[] = [
  /* ── I. ÊTRE PRÊT ────────────────────────────────────────── */
  {
    id: "pret-1",
    themeId: "pret",
    narrative:
      "Il y a une pièce, chez toi, dont tu ne pousses plus la porte. Tu passes devant chaque jour, tu connais la poignée par cœur, et tu continues ton chemin. Ce n’est plus de la peur depuis longtemps — c’est une habitude, et les habitudes sont confortables.",
    prompt: "Si la vie posait aujourd’hui quelque chose d’immense devant toi, tu serais",
    kind: "scale",
    poles: ["Pris de court", "Disponible"],
  },
  {
    id: "pret-2",
    themeId: "pret",
    narrative:
      "Tu attends depuis longtemps. Assez longtemps pour que l’attente soit devenue un métier : tu sais l’organiser, la meubler, la raconter. On finit par confondre attendre et vivre.",
    prompt: "Ton attente ressemble le plus à",
    kind: "choice",
    options: [
      { id: "a", label: "Une salle d’attente. Je patiente, je ne fais rien d’autre.", value: 2 },
      { id: "b", label: "Un refus déguisé. J’attends pour ne pas avoir à choisir.", value: 1 },
      { id: "c", label: "Une veille. Je vis, mais une part de moi guette.", value: 4 },
      { id: "d", label: "Une préparation. Je construis quelque chose pendant ce temps.", value: 6 },
      { id: "e", label: "Rien. Je n’attends plus, et ce n’est pas de la résignation.", value: 7 },
    ],
  },
  {
    id: "pret-3",
    themeId: "pret",
    narrative:
      "On dit souvent « je suis prêt » comme on dit « ça va ». Vite, pour passer à autre chose. Ici personne ne te lit par-dessus l’épaule.",
    prompt: "Qu’est-ce qui, en toi, n’est pas encore prêt ? Nomme-le sans l’excuser.",
    kind: "text",
    placeholder: "Écris-le comme ça vient. La phrase maladroite est souvent la vraie.",
  },

  /* ── II. LA CONFIANCE ────────────────────────────────────── */
  {
    id: "confiance-1",
    themeId: "confiance",
    narrative:
      "Tu entres dans une pièce pleine. Pendant une seconde et demie, avant toute pensée, quelque chose se décide dans ton corps : tu prends la place, ou tu la demandes.",
    prompt: "Dans cette seconde et demie, ton corps",
    kind: "scale",
    poles: ["Se fait petit", "Prend sa place"],
  },
  {
    id: "confiance-2",
    themeId: "confiance",
    narrative:
      "Trois jours sans réponse. Le message a été lu. Rien. Entre le deuxième et le troisième jour, il se passe quelque chose dans ta tête — et ce quelque chose parle rarement de l’autre.",
    prompt: "Pendant ces trois jours, la voix qui parle en toi dit surtout",
    kind: "choice",
    options: [
      { id: "a", label: "« J’ai dû faire quelque chose de mal. » Je repasse tout en boucle.", value: 1 },
      { id: "b", label: "« Je savais bien. » Je me retire avant d’être retiré.", value: 2 },
      { id: "c", label: "« C’est désagréable. » Ça m’occupe, mais ça ne me dévore pas.", value: 5 },
      { id: "d", label: "« Il ou elle a sa vie. » J’attends sans me raconter d’histoire.", value: 7 },
    ],
  },
  {
    id: "confiance-3",
    themeId: "confiance",
    narrative:
      "Il y a une différence entre se tromper et se trahir. La première fait mal une soirée. La seconde laisse une odeur pendant des années.",
    prompt: "Quand tu as tort, tu",
    kind: "scale",
    reverse: true,
    poles: ["Le reconnais et passes", "T’effondres un peu"],
  },

  /* ── III. L’AMOUR PROPRE ─────────────────────────────────── */
  {
    id: "amour-propre-1",
    themeId: "amour-propre",
    narrative:
      "Le matin, devant le miroir, il y a un instant très court, avant le café, avant les autres. Un instant où tu te regardes sans public. C’est là que ça se joue, pas dans les phrases qu’on se répète.",
    prompt: "Dans cet instant-là, ce que tu ressens ressemble à",
    kind: "choice",
    options: [
      { id: "a", label: "Un inventaire. Je vois d’abord ce qui ne va pas.", value: 1 },
      { id: "b", label: "Une négociation. Certains jours oui, d’autres non.", value: 3 },
      { id: "c", label: "Une indifférence polie. Je ne m’attarde pas.", value: 4 },
      { id: "d", label: "Une reconnaissance. C’est moi, et ça me va.", value: 6 },
      { id: "e", label: "Une tendresse. Franche, sans condition.", value: 7 },
    ],
  },
  {
    id: "amour-propre-2",
    themeId: "amour-propre",
    narrative:
      "On sait exactement où l’on se respecte : c’est la liste de ce qu’on refuse. Elle est courte chez ceux qui ont peur de rester seuls.",
    prompt: "Ce que tu acceptes aujourd’hui et que tu n’accepterais pas d’un ami",
    kind: "multi",
    options: [
      { id: "a", label: "Qu’on me fasse attendre sans explication" },
      { id: "b", label: "Qu’on me touche sans que j’en aie envie" },
      { id: "c", label: "Qu’on parle de moi avec ironie devant les autres" },
      { id: "d", label: "Qu’on ne réponde jamais vraiment à mes questions" },
      { id: "e", label: "Qu’on me préfère disponible plutôt qu’entier" },
      { id: "f", label: "Rien de tout cela. Je pose mes limites." },
    ],
  },
  {
    id: "amour-propre-3",
    themeId: "amour-propre",
    narrative:
      "Il y a une phrase que tu te dis quand tu es seul et que la journée a été mauvaise. Pas celle que tu montres. L’autre.",
    prompt: "Écris cette phrase, mot pour mot.",
    kind: "text",
    placeholder: "Les mots exacts. Pas leur version présentable.",
  },

  /* ── IV. LE BESOIN ───────────────────────────────────────── */
  {
    id: "dependance-1",
    themeId: "dependance",
    narrative:
      "Quelqu’un quitte la pièce. Rien de grave, il va chercher de l’eau. Et pourtant, dans les dix secondes qui suivent, quelque chose se resserre dans ta poitrine, très discrètement.",
    prompt: "Ce resserrement, tu le connais",
    kind: "scale",
    reverse: true,
    poles: ["Presque jamais", "Presque toujours"],
  },
  {
    id: "dependance-2",
    themeId: "dependance",
    narrative:
      "Quand l’autre s’éloigne, même d’un pas, chacun a sa manœuvre. Personne ne l’a choisie ; on l’a apprise très tôt, souvent avant de savoir parler.",
    prompt: "Quand l’autre se retire, tu",
    kind: "multi",
    options: [
      { id: "a", label: "Deviens plus disponible, plus gentil, plus utile" },
      { id: "b", label: "Écris, appelles, cherches un signe" },
      { id: "c", label: "Te retires plus fort et plus vite" },
      { id: "d", label: "Cherches ce que tu as fait de travers" },
      { id: "e", label: "Te remplis : travail, écran, corps d’un autre" },
      { id: "f", label: "Restes. Tu ne fais rien. Tu laisses venir." },
    ],
  },
  {
    id: "dependance-3",
    themeId: "dependance",
    narrative:
      "Il y a une question simple et désagréable : de quoi ta journée dépend-elle ? Pas ce que tu voudrais répondre — ce qui est vrai.",
    prompt: "Ton état intérieur dépend surtout",
    kind: "scale",
    reverse: true,
    poles: ["De moi", "Du regard des autres"],
  },

  /* ── V. LA SOLITUDE ──────────────────────────────────────── */
  {
    id: "solitude-1",
    themeId: "solitude",
    narrative:
      "Un vendredi soir. Personne. Pas de plan, pas de message à venir. La soirée entière est à toi, et c’est justement le problème — ou justement le luxe.",
    prompt: "Cette soirée, elle est",
    kind: "scale",
    poles: ["Un trou à combler", "Un lieu où je vis"],
  },
  {
    id: "solitude-2",
    themeId: "solitude",
    narrative:
      "Il y a une différence entre être seul et être en manque. La première tient debout. La seconde cherche quelqu’un pour la tenir.",
    prompt: "Quand tu es seul depuis plusieurs jours, ce qui arrive le plus souvent",
    kind: "choice",
    options: [
      { id: "a", label: "Je descends. Le silence me tombe dessus.", value: 1 },
      { id: "b", label: "Je m’étourdis pour ne pas l’entendre.", value: 2 },
      { id: "c", label: "Ça va, mais je compte les jours.", value: 4 },
      { id: "d", label: "Je me retrouve. C’est là que je pense le mieux.", value: 6 },
      { id: "e", label: "J’y prends un plaisir presque physique.", value: 7 },
    ],
  },
  {
    id: "solitude-3",
    themeId: "solitude",
    narrative:
      "On croit souvent chercher quelqu’un. On cherche parfois seulement à ne plus être avec soi.",
    prompt: "Qu’est-ce que tu évites, quand tu évites d’être seul ?",
    kind: "text",
    placeholder: "Une pensée, un souvenir, une sensation. Sois précis.",
  },

  /* ── VI. L’OUVERTURE ─────────────────────────────────────── */
  {
    id: "ouverture-1",
    themeId: "ouverture",
    narrative:
      "Imagine : demain, ce que tu attends depuis des années arrive. Pas dans dix ans. Demain. La plupart des gens, à cet instant précis, ressentent d’abord un mouvement de recul — et ils en ont honte.",
    prompt: "Ta première réaction, honnêtement",
    kind: "choice",
    options: [
      { id: "a", label: "La panique. Je ne suis pas prêt, il me faut du temps.", value: 1 },
      { id: "b", label: "La méfiance. Je cherche le piège.", value: 2 },
      { id: "c", label: "Un vertige, puis l’envie.", value: 5 },
      { id: "d", label: "Un oui immédiat, dans le ventre.", value: 7 },
    ],
  },
  {
    id: "ouverture-2",
    themeId: "ouverture",
    narrative:
      "Toute grande chose demande un prix, et ce prix n’est jamais l’effort. C’est toujours quelque chose qu’il faut lâcher — un confort, une histoire qu’on se raconte, une identité qui tenait chaud.",
    prompt: "Ce que ça te coûterait, et que tu n’as pas encore accepté de perdre",
    kind: "multi",
    options: [
      { id: "a", label: "Mon contrôle sur mon temps et mon espace" },
      { id: "b", label: "Mon histoire de personne qui s’en sort seule" },
      { id: "c", label: "Mes fuites : écrans, travail, corps de passage" },
      { id: "d", label: "Ma colère contre quelqu’un que je n’ai pas pardonné" },
      { id: "e", label: "L’idée précise que je me fais de qui devrait m’aimer" },
      { id: "f", label: "Rien. J’ai déjà lâché." },
    ],
  },
  {
    id: "ouverture-3",
    themeId: "ouverture",
    narrative:
      "Recevoir est un geste actif. On l’oublie parce qu’il ressemble à de la passivité — alors qu’il demande plus de courage que de prendre.",
    prompt: "Recevoir quelque chose de grand, sans le mériter, sans le rendre",
    kind: "scale",
    poles: ["M’est insupportable", "M’est possible"],
  },

  /* ── VII. LE CORPS ───────────────────────────────────────── */
  {
    id: "corps-1",
    themeId: "corps",
    narrative:
      "Une main se pose sur ta nuque. Pas dans le désir, pas dans l’urgence — juste posée. Le corps répond avant toi : il s’ouvre, ou il vérifie.",
    prompt: "Ton corps, sous cette main",
    kind: "scale",
    poles: ["Se met en alerte", "Se relâche"],
  },
  {
    id: "corps-2",
    themeId: "corps",
    narrative:
      "Il y a des gens qui habitent leur corps comme une maison, et d’autres qui le conduisent comme une voiture. La différence se voit à la façon dont ils s’assoient.",
    prompt: "Ton corps, la plupart du temps, tu",
    kind: "choice",
    options: [
      { id: "a", label: "L’ignore. Je le remarque quand il fait mal.", value: 1 },
      { id: "b", label: "Le surveille. Je le juge plus que je ne le sens.", value: 2 },
      { id: "c", label: "L’utilise. Il fait le travail, ça suffit.", value: 3 },
      { id: "d", label: "L’écoute par moments, quand je me pose.", value: 5 },
      { id: "e", label: "L’habite. Il me dit des choses avant ma tête.", value: 7 },
    ],
  },
  {
    id: "corps-3",
    themeId: "corps",
    narrative:
      "Le désir n’est pas une performance ni une preuve. C’est un renseignement. Il dit ce qui est vivant en toi, et vers quoi tu penches quand plus personne ne juge.",
    prompt: "Ton désir, aujourd’hui",
    kind: "scale",
    poles: ["Est en sommeil", "Est vivant et le sait"],
  },
  {
    id: "corps-4",
    themeId: "corps",
    narrative:
      "Dernière question de la descente. Celle-là, garde-la : dans quelques semaines, tu la reliras et tu verras le chemin.",
    prompt:
      "Si ton corps pouvait parler à ta place, ce soir, qu’est-ce qu’il demanderait ?",
    kind: "text",
    placeholder: "Laisse-le dire. Ne corrige pas.",
  },
];

/** Ordre de traversée : thème par thème, jamais mélangé. */
export const SOLO_ORDER: string[] = SOLO_THEMES.flatMap((t) =>
  SOLO_QUESTIONS.filter((q) => q.themeId === t.id).map((q) => q.id)
);
