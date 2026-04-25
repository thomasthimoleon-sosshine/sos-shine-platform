export type ProfileKey = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10';

export interface Answer {
  text: string;
  scores: Partial<Record<ProfileKey, number>>;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export interface Profile {
  key: ProfileKey;
  title: string;
  archetype: string;
  subtitle: string;
  essence: string;
  lumiere: string;
  ombre: string;
  protocole: string;
  color: string;
  icon: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Lorsque vous traversez une période difficile, quel est votre premier réflexe ?",
    answers: [
      { text: "J'analyse la situation sous tous les angles pour comprendre ce qui se passe", scores: { P1: 3, P7: 1 } },
      { text: "Je me lance dans une activité ou un projet pour ne pas rester immobile", scores: { P2: 3, P10: 1 } },
      { text: "Je m'assure que mes proches vont bien avant de penser à moi", scores: { P3: 3, P9: 1 } },
      { text: "Je prends de la distance et je gère seul(e)", scores: { P4: 3, P5: 1 } },
    ]
  },
  {
    id: 2,
    question: "Face à un conflit avec un proche, quelle est votre réaction instinctive ?",
    answers: [
      { text: "Je cherche à comprendre la logique derrière le désaccord", scores: { P1: 3, P5: 1 } },
      { text: "Je fais tout pour apaiser les tensions et retrouver l'harmonie", scores: { P9: 3, P6: 1 } },
      { text: "Je m'adapte à l'autre pour éviter que la situation ne dégénère", scores: { P6: 3, P3: 1 } },
      { text: "Je ressens une montée d'énergie intense et j'ai besoin de m'exprimer", scores: { P10: 3, P8: 1 } },
    ]
  },
  {
    id: 3,
    question: "Qu'est-ce qui vous épuise le plus au quotidien ?",
    answers: [
      { text: "Ne pas comprendre pourquoi les choses arrivent", scores: { P1: 3, P7: 1 } },
      { text: "Être obligé(e) de rester immobile ou dans la routine", scores: { P2: 3, P10: 1 } },
      { text: "Sentir que les gens autour de moi ne vont pas bien", scores: { P3: 3, P8: 1 } },
      { text: "Devoir dépendre de quelqu'un d'autre", scores: { P4: 3, P5: 1 } },
    ]
  },
  {
    id: 4,
    question: "Comment gérez-vous l'incertitude dans votre vie ?",
    answers: [
      { text: "Je planifie et j'anticipe tous les scénarios possibles", scores: { P7: 3, P5: 1 } },
      { text: "Je m'adapte en temps réel, en me fondant dans le contexte", scores: { P6: 3, P2: 1 } },
      { text: "Je cherche du sens profond dans ce qui m'arrive", scores: { P8: 3, P1: 1 } },
      { text: "Je provoque un changement radical pour reprendre le contrôle", scores: { P10: 3, P4: 1 } },
    ]
  },
  {
    id: 5,
    question: "Dans vos relations, quel rôle endossez-vous le plus souvent ?",
    answers: [
      { text: "Le conseiller ou la conseillère : on vient me voir pour ma lucidité", scores: { P1: 3, P9: 1 } },
      { text: "Le pilier : je suis celui ou celle sur qui tout le monde s'appuie", scores: { P3: 3, P5: 1 } },
      { text: "Le médiateur : je fais le lien entre les gens et j'apaise les tensions", scores: { P9: 3, P6: 1 } },
      { text: "L'électron libre : je suis le moteur qui entraîne les autres", scores: { P2: 3, P10: 1 } },
    ]
  },
  {
    id: 6,
    question: "Quelle est votre plus grande peur inconsciente ?",
    answers: [
      { text: "Perdre le contrôle de la situation ou de moi-même", scores: { P5: 3, P7: 1 } },
      { text: "Être abandonné(e) ou devenir invisible aux yeux des autres", scores: { P3: 3, P6: 1 } },
      { text: "Ne jamais trouver quelqu'un qui me comprenne vraiment", scores: { P8: 3, P4: 1 } },
      { text: "Être trahi(e) et regretter d'avoir fait confiance", scores: { P4: 3, P7: 1 } },
    ]
  },
  {
    id: 7,
    question: "Quand une émotion forte vous submerge, que faites-vous ?",
    answers: [
      { text: "J'essaie de la décortiquer mentalement pour la comprendre", scores: { P1: 3, P7: 1 } },
      { text: "Je la canalise dans une action concrète ou un mouvement", scores: { P2: 3, P10: 1 } },
      { text: "Je la garde pour moi et je me referme", scores: { P4: 3, P9: 1 } },
      { text: "Je la vis intensément, quitte à être submergé(e)", scores: { P8: 3, P10: 1 } },
    ]
  },
  {
    id: 8,
    question: "Qu'est-ce qui vous redonne de l'énergie quand vous êtes à plat ?",
    answers: [
      { text: "Avoir un nouveau projet ou une nouvelle direction à explorer", scores: { P2: 3, P10: 2 } },
      { text: "Une conversation profonde et authentique avec quelqu'un", scores: { P8: 3, P3: 1 } },
      { text: "Un moment de solitude où je peux tout remettre en ordre", scores: { P5: 3, P4: 1 } },
      { text: "Sentir que je suis utile et que mes proches vont bien", scores: { P3: 3, P9: 1 } },
    ]
  },
  {
    id: 9,
    question: "Comment réagissez-vous lorsque quelqu'un vous déçoit profondément ?",
    answers: [
      { text: "Je coupe le lien et je me protège immédiatement", scores: { P4: 3, P10: 1 } },
      { text: "Je cherche à comprendre ses raisons avant de juger", scores: { P1: 2, P9: 2 } },
      { text: "Je fais comme si de rien n'était pour préserver la relation", scores: { P6: 3, P9: 1 } },
      { text: "Je ressens une blessure intense et je remets tout en question", scores: { P8: 3, P3: 1 } },
    ]
  },
  {
    id: 10,
    question: "Dans un groupe, quelle posture adoptez-vous naturellement ?",
    answers: [
      { text: "J'observe et j'analyse les dynamiques avant de m'impliquer", scores: { P7: 3, P1: 1 } },
      { text: "Je m'ajuste au ton du groupe pour que tout se passe bien", scores: { P6: 3, P9: 1 } },
      { text: "Je prends les rênes si personne ne le fait", scores: { P5: 3, P2: 1 } },
      { text: "Je recherche les échanges vrais et profonds, pas le superficiel", scores: { P8: 3, P4: 1 } },
    ]
  },
  {
    id: 11,
    question: "Quel type de silence vous met le plus mal à l'aise ?",
    answers: [
      { text: "Le silence après un conflit non résolu", scores: { P9: 3, P3: 1 } },
      { text: "Le silence de l'inactivité, quand rien ne se passe", scores: { P2: 3, P10: 1 } },
      { text: "Le silence intérieur, quand je n'ai pas de réponse à mes questions", scores: { P1: 3, P8: 1 } },
      { text: "Le silence des autres, quand je ne sais pas ce qu'ils pensent", scores: { P7: 3, P6: 1 } },
    ]
  },
  {
    id: 12,
    question: "Que pensez-vous de la vulnérabilité ?",
    answers: [
      { text: "C'est une force, mais je préfère la montrer uniquement à ceux qui la méritent", scores: { P4: 3, P8: 1 } },
      { text: "J'y aspire mais j'ai peur de perdre le contrôle si je m'y abandonne", scores: { P5: 3, P1: 1 } },
      { text: "Je la montre surtout quand l'autre en a besoin, rarement pour moi", scores: { P3: 3, P6: 1 } },
      { text: "Je la contourne en passant à l'action ou au changement", scores: { P2: 3, P10: 1 } },
    ]
  },
  {
    id: 13,
    question: "Face à un changement majeur et imprévu dans votre vie, vous avez tendance à :",
    answers: [
      { text: "Anticiper toutes les conséquences et préparer un plan B", scores: { P7: 3, P5: 2 } },
      { text: "Voir ça comme une opportunité de tout réinventer", scores: { P10: 3, P2: 1 } },
      { text: "M'adapter rapidement pour rassurer mon entourage", scores: { P6: 2, P3: 2 } },
      { text: "Me replier pour digérer le choc à mon rythme", scores: { P4: 3, P1: 1 } },
    ]
  },
  {
    id: 14,
    question: "Quelle phrase résonne le plus en vous ?",
    answers: [
      { text: "\"Si je comprends pourquoi, je peux tout supporter\"", scores: { P1: 3, P7: 1 } },
      { text: "\"Je préfère plier que de demander de l'aide\"", scores: { P4: 2, P5: 2 } },
      { text: "\"Si les gens autour de moi vont bien, alors je vais bien\"", scores: { P3: 3, P6: 1 } },
      { text: "\"La vie est trop courte pour la médiocrité\"", scores: { P8: 3, P10: 1 } },
    ]
  },
  {
    id: 15,
    question: "Si vous deviez décrire votre mode de survie en un mot, ce serait :",
    answers: [
      { text: "La compréhension — tout analyser pour ne plus souffrir", scores: { P1: 3, P7: 1 } },
      { text: "L'harmonie — tout apaiser pour que personne ne souffre", scores: { P9: 3, P3: 1 } },
      { text: "Le mouvement — avancer pour ne pas sombrer", scores: { P2: 3, P10: 1 } },
      { text: "L'adaptation — me transformer pour ne pas être rejeté(e)", scores: { P6: 3, P9: 1 } },
    ]
  },
];

export const PROFILES: Record<ProfileKey, Profile> = {
  P1: {
    key: 'P1',
    title: "L'Analyste — L'Architecture Mentale",
    archetype: "L'Analyste",
    subtitle: "L'Architecture Mentale",
    essence: "Face à la tempête, {firstName}, votre intelligence est votre premier bouclier. Votre système nerveux privilégie la compréhension : face à l'incertitude ou à l'épreuve, vous avez un besoin viscéral d'analyser, de décortiquer et de trouver du sens.",
    lumiere: "Cette architecture fait de vous une personne dotée d'une résilience intellectuelle hors norme. Vous êtes capable de lire entre les lignes et de structurer le chaos. On vient souvent chercher vos conseils pour votre clarté d'esprit et votre objectivité.",
    ombre: "Cependant, {firstName}, ce super-pouvoir a un coût énergétique massif. Lorsque la charge émotionnelle devient trop forte, votre machinerie analytique s'emballe. Vous refaites les conversations en boucle et essayez de \"penser\" vos émotions au lieu de les ressentir, ce qui crée un épuisement profond.",
    protocole: "Votre enjeu actuel n'est pas de comprendre davantage, mais d'apprendre à faire redescendre la pression vers votre corps. Sur SOS Shine, nous allons cibler les pratiques d'ancrage somatique (cohérence cardiaque, scans corporels) pour mettre votre cerveau sur pause, en toute sécurité.",
    color: '#74C0FC',
    icon: '🧠',
  },
  P2: {
    key: 'P2',
    title: "L'Électron Libre — L'Architecture en Mouvement",
    archetype: "L'Électron Libre",
    subtitle: "L'Architecture en Mouvement",
    essence: "Votre énergie vitale est tournée vers l'action, {firstName}. Quand l'inconfort s'installe, votre instinct de survie vous pousse vers le mouvement, les projets ou l'extérieur. L'immobilité vous est insupportable lorsque vous êtes sous tension.",
    lumiere: "C'est une force motrice impressionnante. Vous possédez une résilience active qui vous empêche de stagner ou de sombrer dans la complaisance. Vous êtes souvent le moteur de vos groupes, capable de rebondir à une vitesse fascinante.",
    ombre: "Le revers de cette médaille, {firstName}, c'est la fuite en avant. En saturant votre emploi du temps ou votre esprit pour ne pas ressentir le vide, vous risquez le burn-out émotionnel. Vous courez pour ne pas entendre ce qui fait mal.",
    protocole: "Votre véritable défi aujourd'hui n'est pas d'avancer plus vite, mais de vous autoriser de micro-pauses sans angoisser. Votre programme SOS Shine va se concentrer sur l'apprivoisement du silence et la micro-exposition émotionnelle pour apprendre à votre corps que s'arrêter n'est pas dangereux.",
    color: '#FF8C42',
    icon: '⚡',
  },
  P3: {
    key: 'P3',
    title: "Le Pilier — L'Architecture Symbiotique",
    archetype: "Le Pilier",
    subtitle: "L'Architecture Symbiotique",
    essence: "Vous possédez un cœur doté d'une antenne ultra-sensible, {firstName}. Face à l'incertitude, votre réflexe naturel est de chercher l'ancrage dans le soin à l'autre. Vous ressentez les variations d'humeur et cherchez instinctivement à harmoniser votre environnement.",
    lumiere: "Cette immense empathie fait de vous un repère incontournable. Vous savez créer des espaces de sécurité pour les autres et votre capacité de dévouement est d'une rare noblesse. Vous êtes le ciment de vos relations.",
    ombre: "Mais dans la tempête, cette hyper-vigilance tournée vers l'extérieur vous fait oublier vos propres limites. Vous avez tendance à endosser le rôle du \"sauveur\" pour vous assurer qu'on ne vous abandonnera pas, au point de vous vider de votre propre énergie.",
    protocole: "L'objectif pour vous, {firstName}, est d'apprendre à devenir votre propre point de gravité. Vos exercices SOS Shine cibleront la restauration de vos frontières personnelles et la réappropriation de votre propre valeur, indépendamment de ce que vous faites pour les autres.",
    color: '#E879A8',
    icon: '💗',
  },
  P4: {
    key: 'P4',
    title: "La Citadelle — L'Architecture Citadelle",
    archetype: "La Citadelle",
    subtitle: "L'Architecture Citadelle",
    essence: "Votre sanctuaire intérieur est extrêmement bien gardé, {firstName}. Face à la blessure, la trahison ou la déception, votre réflexe est l'autonomie absolue : vous relevez les ponts-levis et prenez de la distance.",
    lumiere: "Cette souveraineté vous dote d'une grande solidité apparente. Vous êtes capable de traverser des tempêtes redoutables en totale indépendance. Vous ne vous effondrez pas publiquement et savez protéger votre noyau dur.",
    ombre: "Cependant, à force de couper les vannes émotionnelles pour garantir votre sécurité, votre armure s'épaissit. Ce repli stratégique peut se transformer en isolement profond. La forteresse vous protège des ennemis, mais elle empêche aussi la chaleur d'entrer.",
    protocole: "Votre chemin, {firstName}, ne consiste pas à détruire vos murs d'un coup, mais à apprendre à en ouvrir la porte. Vos exercices SOS Shine se focaliseront sur l'autorisation de la vulnérabilité en milieu sécurisé, pour réapprendre à faire confiance.",
    color: '#8B9DC3',
    icon: '🏰',
  },
  P5: {
    key: 'P5',
    title: "Le Gardien du Cadre — L'Architecture du Contrôle",
    archetype: "Le Gardien du Cadre",
    subtitle: "L'Architecture du Contrôle",
    essence: "Pour vous, {firstName}, la sécurité réside dans la structure. Face au chaos émotionnel, relationnel ou professionnel, votre premier réflexe est de rétablir des règles, de l'ordre, et des processus clairs.",
    lumiere: "Cette exigence fait de vous une personne d'une immense fiabilité. Vous êtes le gardien du temple, celui ou celle qui maintient le cap quand tout vacille. Votre sens de la responsabilité et de l'organisation force le respect de votre entourage.",
    ombre: "Le prix à payer est une tension nerveuse constante. L'imprévu, l'échec ou le désordre (le vôtre ou celui des autres) vous sont intolérables. Ce besoin de tout maîtriser peut vous rendre rigide et vous empêcher de vivre la spontanéité des relations.",
    protocole: "Le travail sur SOS Shine ne consistera pas à vous faire perdre le contrôle, mais à vous enseigner la souplesse. Vos protocoles cibleront le relâchement de la pression de perfection, pour découvrir qu'on peut parfois plier sans se briser.",
    color: '#A3BE8C',
    icon: '🛡️',
  },
  P6: {
    key: 'P6',
    title: "Le Caméléon — L'Architecture Adaptative",
    archetype: "Le Caméléon",
    subtitle: "L'Architecture Adaptative",
    essence: "Votre mécanisme de survie est d'une fluidité fascinante, {firstName}. Face à l'inconnu ou au risque de conflit, vous avez développé la capacité d'adapter instantanément vos besoins, votre humeur et vos envies à ceux qui vous entourent.",
    lumiere: "Vous possédez une intelligence sociale et une agilité émotionnelle hors norme. Vous savez naviguer dans n'importe quel environnement en mettant les gens à l'aise. Vous êtes le maître de la synchronisation relationnelle.",
    ombre: "À force de fusionner avec les attentes des autres pour éviter le rejet, le risque est de perdre la trace de votre propre identité. Vous finissez par ne plus savoir ce que vous voulez vraiment, et cette sur-adaptation génère un épuisement silencieux.",
    protocole: "Votre parcours de guérison, {firstName}, consistera à réapprendre à dire \"je\". Vos exercices SOS Shine travailleront sur l'affirmation de soi, la tolérance à la déception de l'autre, et la reconnexion avec vos désirs authentiques.",
    color: '#C4A0E8',
    icon: '🦎',
  },
  P7: {
    key: 'P7',
    title: "La Vigie — L'Architecture d'Anticipation",
    archetype: "La Vigie",
    subtitle: "L'Architecture d'Anticipation",
    essence: "Votre esprit fonctionne comme un radar de pointe, {firstName}. Pour garantir votre sécurité émotionnelle, votre système nerveux scanne en permanence l'horizon pour anticiper le pire, afin de ne jamais être pris(e) au dépourvu.",
    lumiere: "Cette perspicacité fait de vous un stratège naturel. Vous avez toujours un temps d'avance et vos plans de secours sont infaillibles. Votre entourage bénéficie souvent de votre capacité à éviter les écueils invisibles pour la plupart des gens.",
    ombre: "Cette hyper-vigilance vous maintient dans un état d'alerte épuisant. En cherchant à contrôler le futur, vous vous coupez de la joie du présent. Vous traversez souvent les catastrophes émotionnellement avant même qu'elles n'arrivent dans le monde réel.",
    protocole: "L'enjeu de votre accompagnement sur SOS Shine sera de désarmer ce système d'alarme interne. Nous utiliserons des techniques de régulation du système nerveux central pour vous ramener dans l'ici et maintenant, là où vous êtes déjà en sécurité.",
    color: '#FFD93D',
    icon: '🔭',
  },
  P8: {
    key: 'P8',
    title: "L'Idéaliste — L'Architecture des Profondeurs",
    archetype: "L'Idéaliste",
    subtitle: "L'Architecture des Profondeurs",
    essence: "Vous évoluez dans un monde en très haute définition, {firstName}. Vous ne tolérez pas la superficialité. Votre quête est celle du sens, de l'authenticité absolue et de l'intensité, que ce soit dans vos relations ou vos projets.",
    lumiere: "Votre profondeur d'âme et votre capacité d'émerveillement sont magnifiques. Vous avez accès à un registre émotionnel et créatif d'une grande richesse, et vous êtes capable d'aimer et de vous engager avec une ferveur rare.",
    ombre: "Cette exigence d'absolu vous rend extrêmement vulnérable face aux déceptions du réel. Quand la vie ou les autres ne sont pas à la hauteur de vos idéaux, vous risquez de sombrer dans la mélancolie et de vous isoler dans un sentiment d'incompréhension.",
    protocole: "Sur SOS Shine, {firstName}, nous allons vous aider à ancrer cette intensité. Votre programme se concentrera sur l'acceptation de l'imperfection (le Kintsugi) et la transmutation de vos émotions fortes en force motrice, sans vous laisser submerger.",
    color: '#FF6B9D',
    icon: '✨',
  },
  P9: {
    key: 'P9',
    title: "Le Diplomate — L'Architecture de l'Harmonie",
    archetype: "Le Diplomate",
    subtitle: "L'Architecture de l'Harmonie",
    essence: "Votre priorité absolue est le maintien de la paix, {firstName}. Face à l'adversité ou aux tensions, vous avez appris à arrondir les angles et à neutraliser rapidement toute escalade agressive.",
    lumiere: "Vous êtes un médiateur né. Votre tolérance et votre douceur font de vous un espace de repos pour les autres. Vous savez désamorcer les bombes émotionnelles avec un tact exceptionnel, créant des ponts là où d'autres construisent des murs.",
    ombre: "En fuyant le conflit à tout prix, vous taisez souvent vos propres frustrations et limites. La colère non exprimée s'accumule à l'intérieur sous forme de ressentiment ou d'anxiété. En voulant protéger la relation, vous vous sacrifiez.",
    protocole: "Votre défi majeur, {firstName}, sera d'apprendre que le conflit sain n'est pas une menace. SOS Shine vous guidera à travers des exercices de communication assertive pour vous apprendre à prendre votre juste place, même si cela doit faire des vagues.",
    color: '#88D8B0',
    icon: '🕊️',
  },
  P10: {
    key: 'P10',
    title: "Le Catalyseur — L'Architecture de l'Intensité",
    archetype: "Le Catalyseur",
    subtitle: "L'Architecture de l'Intensité",
    essence: "Vous fonctionnez sur des cycles énergétiques puissants, {firstName}. Face à l'apathie ou à l'épreuve, votre réflexe est de chercher une décharge forte (changement radical, passion, nouveau défi) pour relancer la machine.",
    lumiere: "Votre capacité à renaître de vos cendres est fascinante. Vous êtes une force de transformation pure, capable de bouleverser les statu quo et de générer une énergie colossale pour surmonter les obstacles les plus massifs.",
    ombre: "Les montagnes russes épuisent votre système à long terme. Le tiède, la routine et le calme plat peuvent vous angoisser, vous poussant parfois à provoquer des micro-crises inconscientes juste pour vous sentir vivant(e) et ressentir l'adrénaline.",
    protocole: "Votre objectif n'est pas d'éteindre votre feu, {firstName}, mais d'apprendre à tolérer la paix. Vos exercices sur SOS Shine viseront à stabiliser vos pics d'énergie et à trouver de la satisfaction dans la constance, sans avoir l'impression de vous éteindre.",
    color: '#FF5E5B',
    icon: '🔥',
  },
};

export function calculateResult(answers: Record<number, number>): ProfileKey {
  const totals: Record<ProfileKey, number> = {
    P1: 0, P2: 0, P3: 0, P4: 0, P5: 0,
    P6: 0, P7: 0, P8: 0, P9: 0, P10: 0,
  };

  for (const [questionIdStr, answerIndex] of Object.entries(answers)) {
    const questionId = parseInt(questionIdStr, 10);
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question || answerIndex < 0 || answerIndex >= question.answers.length) continue;

    const selectedAnswer = question.answers[answerIndex];
    for (const [profileKey, score] of Object.entries(selectedAnswer.scores)) {
      totals[profileKey as ProfileKey] += score;
    }
  }

  let maxKey: ProfileKey = 'P1';
  let maxScore = -1;
  for (const [key, score] of Object.entries(totals)) {
    if (score > maxScore) {
      maxScore = score;
      maxKey = key as ProfileKey;
    }
  }

  return maxKey;
}
