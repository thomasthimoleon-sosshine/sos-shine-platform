import { DUO_QUESTIONS, DUO_THEMES, type DuoQuestion } from "./duo-questions";
import { rawValue, scoreTheme } from "./scoring";
import type { AnswerMap } from "./types";

/* ═══════════════════════════════════════════════════════════════
   LECTURE CROISÉE
   Rien n’est calculé tant que les deux n’ont pas fini. La lecture
   ne désigne jamais un coupable : elle montre des écarts.

   Trois matières :
     · l’état de chaque axe (les deux notes, l’écart)
     · les miroirs — ce que l’un croit vivre vs ce que l’autre perçoit
     · les propositions — un geste par axe, concret, daté
═══════════════════════════════════════════════════════════════ */

export type AxisState =
  /** Les deux sont hauts et proches : c’est vivant, on l’entretient. */
  | "vivant"
  /** Les deux sont bas et proches : c’est endormi, et vous le savez tous les deux. */
  | "endormi"
  /** Écart important : vous ne vivez pas la même relation sur cet axe. */
  | "asymetrie";

export type AxisReading = {
  themeId: string;
  title: string;
  scoreA: number;
  scoreB: number;
  /** Écart absolu en points. */
  gap: number;
  state: AxisState;
  /** Formulation adressée aux deux, jamais à l’un contre l’autre. */
  verdict: string;
  /** Le geste des trente jours pour cet axe. */
  proposition: string;
};

export type Mirror = {
  themeId: string;
  /** Ce que A dit vivre. */
  selfQuestionId: string;
  /** Ce que B croit que A vit. */
  otherQuestionId: string;
  selfValue: number;
  otherValue: number;
  gap: number;
  reading: string;
};

export type Crossing = {
  axes: AxisReading[];
  mirrors: Mirror[];
  /** Les phrases jamais dites, révélées au même instant. */
  unsaid: { a: string; b: string };
  /** Axe le plus vivant et axe le plus endormi — pour ouvrir la lecture. */
  strongest: string;
  weakest: string;
};

const GAP_ASYMETRIE = 22;
const SEUIL_VIVANT = 62;

/* ── Verdicts : trois états × cinq axes ─────────────────────── */

const VERDICTS: Record<string, Record<AxisState, string>> = {
  eteint: {
    vivant:
      "La chaleur est encore là, et vous la voyez tous les deux. Ce n’est pas rien : la plupart des couples arrivent ici sans le savoir.",
    endormi:
      "Vous êtes d’accord sur le froid. C’est une bonne nouvelle déguisée : personne n’a à convaincre l’autre qu’il y a un problème.",
    asymetrie:
      "L’un de vous vit encore dans la chaleur, l’autre a déjà froid depuis un moment. Ce n’est pas un mensonge — c’est un décalage, et il n’a jamais été dit.",
  },
  "non-dits": {
    vivant:
      "Vous vous parlez vraiment. Gardez cet endroit : c’est lui qui tiendra le reste.",
    endormi:
      "Vous portez chacun quelque chose de lourd et de silencieux. Le silence n’est pas partagé : il est doublé.",
    asymetrie:
      "L’un parle et croit être entendu ; l’autre garde et croit protéger. Les deux ont raison, et c’est pour ça que ça dure.",
  },
  desir: {
    vivant:
      "Le désir est réveillé des deux côtés. Il demande de l’attention, pas de la performance.",
    endormi:
      "Le désir dort chez vous deux. Il n’est pas mort : il n’a plus d’espace, plus de faim, plus de surprise.",
    asymetrie:
      "L’un attend, l’autre ne sait pas qu’il est attendu. C’est l’écart le plus douloureux et le plus simple à réduire — il tient souvent à une demande jamais formulée.",
  },
  presence: {
    vivant:
      "Vous êtes là quand vous êtes là. C’est la ressource la plus rare de ce parcours.",
    endormi:
      "Vous cohabitez avec compétence. Personne n’habite plus vraiment la pièce.",
    asymetrie:
      "L’un se croit présent, l’autre reçoit une absence. La présence ne se mesure pas à l’intention : elle se mesure à ce qui arrive de l’autre côté.",
  },
  redecouverte: {
    vivant:
      "Vous êtes tous les deux en train de devenir quelqu’un. C’est exactement ce dont on tombe amoureux.",
    endormi:
      "Vous vous êtes rangés l’un pour l’autre. Il n’y a plus grand-chose de neuf à découvrir — et rien à désirer d’inconnu.",
    asymetrie:
      "L’un se transforme, l’autre s’est figé. Ce n’est pas une trahison : c’est le début d’une distance, et il est encore tôt.",
  },
};

const PROPOSITIONS: Record<string, Record<AxisState, string>> = {
  eteint: {
    vivant:
      "Une soirée par semaine, sans écran et sans logistique. Vous ne parlez ni des enfants, ni de l’argent, ni du planning.",
    endormi:
      "Chacun écrit trois choses qu’il faisait au début et qu’il a cessé. Vous en reprenez une chacun, cette semaine, sans prévenir l’autre.",
    asymetrie:
      "Celui qui a froid le dit à voix haute, une fois, sans reproche. L’autre écoute jusqu’au bout et ne répond pas le soir même.",
  },
  "non-dits": {
    vivant:
      "Gardez un rendez-vous fixe où l’on peut tout dire. Trente minutes, même quand tout va bien — surtout quand tout va bien.",
    endormi:
      "Les deux phrases jamais dites sont ci-dessous. Vous les lisez à voix haute, chacun la sienne, le même soir. Aucune réponse n’est autorisée avant le lendemain.",
    asymetrie:
      "Celui qui garde parle en premier. Celui qui parle beaucoup n’a le droit qu’à une seule question, et elle doit commencer par « qu’est-ce que ».",
  },
  desir: {
    vivant:
      "Continuez à demander. Une demande précise par semaine, formulée à voix haute, même si elle gêne.",
    endormi:
      "Quinze jours sans sexe et sans reproche, mais un contact peau à peau chaque soir, dix minutes, sans autre but. On rend au corps le droit d’exister sans mission.",
    asymetrie:
      "Vos deux réponses à « ce que je n’ai jamais osé demander » sont ci-dessous. Vous les lisez. Vous choisissez chacun celle de l’autre, et vous la réalisez dans les dix jours.",
  },
  presence: {
    vivant:
      "Nommez à l’autre, une fois par semaine, le moment précis où vous l’avez senti présent.",
    endormi:
      "Vingt minutes par jour, même pièce, sans téléphone, sans objectif. C’est inconfortable les trois premiers jours. C’est le prix.",
    asymetrie:
      "Celui qui reçoit l’absence décrit une scène précise, avec la date et l’heure. Pas un « tu n’es jamais là » : une scène. L’autre ne se défend pas.",
  },
  redecouverte: {
    vivant:
      "Chacun s’engage sur une chose qui lui appartient en propre, et la raconte à l’autre comme à un inconnu intéressant.",
    endormi:
      "Chacun reprend une chose rangée dans le tiroir — corps, ami, projet, création. Seul, sans l’autre, et pendant un mois. Le couple se nourrit de ce qui se passe hors du couple.",
    asymetrie:
      "Celui qui s’est figé choisit une chose, une seule, et la commence cette semaine. Celui qui se transforme cesse d’attendre que l’autre suive, et raconte.",
  },
};

function stateOf(a: number, b: number): AxisState {
  const gap = Math.abs(a - b);
  if (gap >= GAP_ASYMETRIE) return "asymetrie";
  return (a + b) / 2 >= SEUIL_VIVANT ? "vivant" : "endormi";
}

/* ── Miroirs : « ce que je vis » vs « ce que tu crois que je vis » ── */

const MIRROR_PAIRS: { themeId: string; self: string; other: string }[] = [
  // Ce que je désire / ce que tu crois que je désire.
  { themeId: "desir", self: "desir-1", other: "desir-2" },
  // Ma présence / la présence que tu reçois de moi.
  { themeId: "presence", self: "presence-1", other: "presence-2" },
];

function mirrorReading(gap: number, themeId: string): string {
  if (gap <= 12) {
    return themeId === "desir"
      ? "Ce que tu ressens arrive à l’autre presque intact. C’est rare."
      : "Ta présence est reçue telle que tu la donnes. Rien ne se perd en route.";
  }
  if (gap <= 28) {
    return themeId === "desir"
      ? "Une partie de ton désir n’arrive pas jusqu’à l’autre. Il ne se sent pas désiré autant que tu le désires."
      : "Une partie de ta présence se perd en route. Tu es là plus que l’autre ne le reçoit.";
  }
  return themeId === "desir"
    ? "Tu brûles et l’autre ne le sait pas. Vous êtes probablement deux à brûler en silence, chacun persuadé d’être le seul."
    : "Tu te crois présent, l’autre reçoit une absence. Ce n’est pas de la mauvaise foi : c’est le décalage le plus courant, et le plus coûteux.";
}

/* ── Point d’entrée ─────────────────────────────────────────── */

export function crossAnswers(
  answersA: AnswerMap,
  answersB: AnswerMap
): Crossing {
  const questions = DUO_QUESTIONS as unknown as DuoQuestion[];

  const axes: AxisReading[] = DUO_THEMES.map((theme) => {
    const scoreA = scoreTheme(theme.id, questions, answersA).score;
    const scoreB = scoreTheme(theme.id, questions, answersB).score;
    const state = stateOf(scoreA, scoreB);

    return {
      themeId: theme.id,
      title: theme.title,
      scoreA,
      scoreB,
      gap: Math.abs(scoreA - scoreB),
      state,
      verdict: VERDICTS[theme.id][state],
      proposition: PROPOSITIONS[theme.id][state],
    };
  });

  const mirrors: Mirror[] = [];
  for (const pair of MIRROR_PAIRS) {
    const qSelf = questions.find((q) => q.id === pair.self);
    const qOther = questions.find((q) => q.id === pair.other);
    if (!qSelf || !qOther) continue;

    // Deux miroirs par paire : A vu par B, puis B vu par A.
    for (const [me, you] of [
      [answersA, answersB],
      [answersB, answersA],
    ] as const) {
      const selfValue = rawValue(qSelf, me);
      const otherValue = rawValue(qOther, you);
      if (selfValue === null || otherValue === null) continue;

      const toPercent = (v: number) => Math.round(((v - 1) / 6) * 100);
      const s = toPercent(selfValue);
      const o = toPercent(otherValue);

      mirrors.push({
        themeId: pair.themeId,
        selfQuestionId: pair.self,
        otherQuestionId: pair.other,
        selfValue: s,
        otherValue: o,
        gap: Math.abs(s - o),
        reading: mirrorReading(Math.abs(s - o), pair.themeId),
      });
    }
  }

  const ranked = [...axes].sort(
    (x, y) => (y.scoreA + y.scoreB) / 2 - (x.scoreA + x.scoreB) / 2
  );

  return {
    axes,
    mirrors,
    unsaid: {
      a: answersA["non-dits-4"]?.text?.trim() ?? "",
      b: answersB["non-dits-4"]?.text?.trim() ?? "",
    },
    strongest: ranked[0]?.themeId ?? "",
    weakest: ranked[ranked.length - 1]?.themeId ?? "",
  };
}
