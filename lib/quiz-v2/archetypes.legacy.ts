// DEPRECATED - Conservé pour archive. Remplacé par génération via Claude API à venir.

/**
 * SOS Shine - Quiz V2 Archetype Layer
 *
 * 25 emotional archetypes as identity layer above the existing scoring engine.
 * Each archetype has a 6-part psychological structure designed to create
 * recognition, emotional shock, relief, and desire to continue.
 */

export type Blessure = 'Rejet' | 'Abandon' | 'Humiliation' | 'Trahison' | 'Injustice'

export type Archetype = {
  key: string
  name: string
  blessure: Blessure
  emotion: string
  mode: string
  zone: string
  // 6-part psychological structure
  reconnaissance: string   // Mirror - immediate recognition, short lines
  verite: string           // Uncomfortable hidden truth
  mecanique: string        // Deep mechanism - nervous system / blessure / survival
  consequence: string      // Future cost if nothing changes
  transition: string       // Natural bridge to the protocol
}

export const ARCHETYPES: Record<string, Archetype> = {
  gardien_epuise: {
    key: 'gardien_epuise',
    name: 'LE GARDIEN ÉPUISÉ',
    blessure: 'Injustice',
    emotion: 'Colère rentrée',
    mode: 'Contrôle',
    zone: 'Famille',
    reconnaissance: `Tu aides. Tu portes. Tu rassures.
Quand quelqu'un a un problème, tu es là avant même qu'on te le demande.
Tu anticipes les besoins des autres avec une précision presque douloureuse.
Et le soir, quand tout le monde est couché, tu restes seul(e) avec une fatigue que tu ne montres à personne.
Pas parce que tu ne veux pas — mais parce que tu ne sais pas comment.
Demander de l'aide, c'est presque physiquement impossible pour toi.
Alors tu continues. Tu portes encore. Et tu espères qu'un jour quelqu'un remarquera.`,
    verite: `Ce que tu donnes aux autres, tu ne te l'accordes pas.
Tu peux passer des heures à soutenir quelqu'un dans sa douleur, et te sentir coupable si tu prends dix minutes pour toi.
La vérité inconfortable, c'est que tu ne donnes pas seulement par amour.
Tu donnes aussi pour ne pas être oublié(e). Pour rester indispensable. Pour que ta place dans la vie des gens soit garantie.
Quelque part, tu as peur que si tu arrêtes de te rendre utile, tu deviendras invisible.
Et cette peur-là, personne ne la voit, parce que tu la caches derrière ta générosité.`,
    mecanique: `Très tôt, ton système nerveux a tiré une conclusion : ta valeur dépend de ce que tu apportes aux autres.
Peut-être parce qu'on t'a aimé(e) conditionnellement. Peut-être parce que tu as appris à t'effacer pour maintenir la paix. Peut-être parce que quelqu'un dans ta famille portait trop et que tu as repris le flambeau sans qu'on te le demande.
Le résultat, c'est que contrôler et donner sont devenus synonymes de sécurité.
Lâcher prise, c'est risquer que tout s'effondre. Que les gens partent. Que tu ne vales plus rien.
Ce n'est pas un choix conscient que tu as fait.
C'est une programmation que ton corps a installée pour survivre.`,
    consequence: `Et à force de porter tout le monde, tu t'éloignes lentement de toi-même.
Tu oublies ce que tu aimes. Ce dont tu as besoin. Qui tu es en dehors de ce que tu fais pour les autres.
Un jour, tu te retournes et tu ne te reconnais plus.
Pas dans le mauvais sens — juste dans le sens où tu t'es construit(e) pour les autres, et que toi, tu n'es nulle part dans l'équation.
Et cette colère sourde qui monte parfois — cette irritabilité, cette fatigue de fond — c'est ton être profond qui frappe à la porte et qui dit : "Assez. C'est mon tour."`,
    transition: `Il existe une façon de reposer le poids sans tout perdre.
Pas en abandonnant les gens que tu aimes. Pas en devenant égoïste. Juste en apprenant à être présent(e) pour toi avec la même qualité que tu l'es pour eux.
Ce n'est pas une trahison. C'est un retour à toi-même.
Et c'est exactement ce que le protocole propose de construire avec toi — pas à pas, sans tout casser.`,
  },

  hyper_vigilant: {
    key: 'hyper_vigilant',
    name: 'L\'HYPER-VIGILANT(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Couple',
    reconnaissance: `Un message qui tarde à arriver. Un ton légèrement différent. Un regard qui s'échappe.
Et déjà — quelque chose en toi se met en marche sans que tu l'aies décidé.
Tu cherches des signes. Tu relis des messages. Tu interprètes des silences.
Tu surveilles sans le vouloir, et tu ne sais pas comment couper l'alerte.
Parfois tu te détestes pour ça. Tu te dis que tu exagères, que tu es "trop", que tu vas faire fuir les gens que tu aimes.
Mais l'alarme ne répond pas à la raison. Elle continue à tourner, même quand tu sais objectivement qu'il n'y a rien.`,
    verite: `Ce que tu vis n'est pas de la jalousie. Ce n'est pas du contrôle. Ce n'est pas un défaut de caractère.
C'est une alarme d'enfant qui n'a jamais été désactivée.
À un moment de ta vie — peut-être très tôt — quelqu'un qui comptait pour toi est parti. Ou s'est éloigné sans explication. Ou était là physiquement mais absent émotionnellement.
Et ton système nerveux a retenu la leçon : l'amour peut disparaître d'une seconde à l'autre. Alors il faut surveiller en permanence pour ne pas être pris(e) par surprise.
Ce que tu vis aujourd'hui, c'est ce mécanisme de survie qui tourne encore. Pas parce que tu es "fou/folle". Parce que tu as été blessé(e).`,
    mecanique: `Ton système nerveux est resté figé dans le temps.
Il croit encore qu'il vit dans cet environnement où la sécurité affective n'était pas garantie.
Alors il scanne. Il anticipe. Il cherche les signes avant-coureurs d'un abandon pour pouvoir les éviter cette fois-ci.
Et dans les relations adultes, cette vigilance se retourne contre toi : elle épuise les gens que tu aimes, qui ne comprennent pas pourquoi tu as besoin de tant de réassurance. Et ça crée exactement ce que tu cherches à éviter.
Ce n'est pas ta faute. C'est une boucle. Et les boucles peuvent être interrompues.`,
    consequence: `Cette alerte permanente te coûte une énergie considérable.
Elle t'empêche d'être vraiment présent(e) dans tes relations — parce qu'une partie de toi est toujours en train de surveiller, d'analyser, de se préparer au pire.
Et les personnes que tu aimes finissent par se sentir étouffées, incomprises, ou épuisées par tes besoins de réassurance. Ce qui alimente ta peur d'être abandonné(e).
Tu tournes dans une boucle que tu n'as pas choisie. Et ça te fatigue profondément.`,
    transition: `Cette alarme peut être désactivée.
Pas en faisant semblant qu'elle n'existe pas. Pas en te forçant à "faire confiance". En retournant à la source de cette blessure et en aidant ton système nerveux à comprendre qu'il n'est plus en danger.
C'est un travail en profondeur. Et c'est exactement ce que le protocole a été conçu pour faire — avec toi, pas contre toi.`,
  },

  invisible_lumineux: {
    key: 'invisible_lumineux',
    name: 'L\'INVISIBLE LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Honte',
    mode: 'Effacement',
    zone: 'Identité',
    reconnaissance: `Tu as des choses à dire. Des idées qui méritent d'être entendues. Une façon de voir le monde qui est unique.
Mais tu attends. Toujours la permission. Toujours le bon moment. Toujours que quelqu'un d'autre le dise d'abord.
Tu te mets en retrait dans les groupes, même quand tu as la meilleure idée dans la pièce.
Tu minimises tes réussites. Tu te fais petit(e) avant même qu'on te le demande.
Et parfois, tu vois quelqu'un recevoir les éloges pour quelque chose que tu avais pensé en premier — et tu te demandes pourquoi tu n'as pas osé.
La réponse, tu la connais quelque part. Mais tu ne l'as peut-être jamais nommée clairement.`,
    verite: `Tu ne manques pas de confiance en toi. Pas vraiment.
Le problème est plus profond que ça : tu as peur d'exister.
Exister pleinement — prendre de la place, être vu(e), avoir de l'impact — ça signifie risquer d'être rejeté(e).
Et le rejet, tu l'as déjà vécu. Dans un regard moqueur. Dans une remarque qui t'a cloué(e) sur place. Dans un moment où tu t'es montré(e) et où quelqu'un a détourné les yeux.
Ton être profond a conclu : "si je me rends visible, je risque de souffrir encore."
Alors tu disparais avant. Préventivment. Pour ne plus jamais entendre ce silence.`,
    mecanique: `À un moment donné, quelqu'un — un parent, un groupe, une figure d'autorité — t'a fait sentir que tu étais "en trop".
Trop intense. Trop sensible. Trop enthousiaste. Trop toi.
Et tu as intégré ce message comme une vérité sur toi-même, pas comme l'opinion blessée d'une personne qui ne savait pas t'accueillir.
Depuis, tu te rends invisible pour éviter de revivre ça. Tu effaces la lumière que tu portes avant même qu'on puisse te la reprocher.
C'est une stratégie de protection brillante. Et c'est aussi ce qui t'empêche de vivre pleinement.`,
    consequence: `À force de disparaître, tu laisses ta propre vie se vivre sans toi.
Les opportunités passent. Les connexions profondes ne se créent pas. Les gens ne savent pas qui tu es vraiment.
Et la lumière que tu portes — cette façon unique que tu as de voir les choses, de ressentir, de comprendre — reste enfermée à l'intérieur.
Ce n'est pas une vie à moitié que tu mérites. Tu mérites de prendre toute la place qui est la tienne.`,
    transition: `La lumière que tu portes ne demande pas à exploser. Elle demande juste la permission de sortir — doucement, à ton rythme.
Et cette permission, tu peux apprendre à te la donner.
Le protocole commence exactement là : en reconstruisant la sécurité intérieure dont tu as besoin pour exister pleinement, sans avoir peur.`,
  },

  volcan_contenu: {
    key: 'volcan_contenu',
    name: 'LE VOLCAN CONTENU',
    blessure: 'Humiliation',
    emotion: 'Colère rentrée',
    mode: 'Somatisation',
    zone: 'Corps',
    reconnaissance: `Mâchoire serrée dès le matin. Épaules remontées jusqu'aux oreilles. Un ventre qui se noue chaque fois qu'une certaine personne parle.
Il y a des choses que tu n'as jamais dites. Des réponses que tu as ravalées. Des moments où tu aurais voulu exploser — et tu t'es contenu(e).
Les gens autour de toi te voient comme quelqu'un de calme, de posé(e), de maîtrisé(e).
Ce qu'ils ne voient pas, c'est le feu en dessous. Ni comment ton corps paye le prix de ce contrôle permanent.
Parce que ton corps, lui, ne ment pas. Il enregistre tout ce que ta voix n'a pas le droit de dire.`,
    verite: `Il y a une colère légitime en toi que tu n'as pas le droit d'exprimer.
Peut-être qu'on t'a dit que la colère était dangereuse. Laide. Inadmissible. Que les "gens bien" ne se mettent pas en colère.
Alors tu l'as avalée. Encore et encore. Tu l'as transformée en tension musculaire, en maux de tête, en douleurs chroniques qui n'ont "aucune raison médicale".
Mais la vérité, c'est que l'énergie d'une émotion ne disparaît jamais. Elle se loge quelque part. Et ton corps est devenu le gardien de tout ce que ta voix n'a pas pu dire.`,
    mecanique: `Quelque part dans ton histoire, exprimer ta colère a été humiliant, dangereux, ou inutile.
Peut-être qu'on t'a ridiculisé(e) quand tu t'es emporté(e). Peut-être que ta colère n'a jamais changé quoi que ce soit. Peut-être qu'on t'a appris que te mettre en colère, c'était "faire une scène", "être dramatique", "manquer de maturité".
Alors ton système nerveux a trouvé une solution élégante : garder la colère, l'embouteiller, la stocker dans les tissus.
Résultat : tu es l'une des personnes les plus "zen" que les gens connaissent. Et l'une des plus tendues intérieurement.`,
    consequence: `Les tensions chroniques que tu portes dans le corps ne sont pas des hasards.
Les migraines récurrentes. Les douleurs dans le dos ou les épaules. La mâchoire qui grince la nuit. La fatigue inexpliquée.
Ce ne sont pas des faiblesses. Ce sont des messages. Ton corps essaie de te parler depuis longtemps.
Et si tu continues à l'ignorer, il finira par parler plus fort.`,
    transition: `Ce que tu portes dans le corps peut être libéré.
Pas en explosion — ça, ton corps ne le demande pas. Il demande à être entendu. Progressivement. En sécurité.
Il y a une façon de donner à cette colère sa juste expression sans tout détruire autour de toi.
Le protocole commence par apprendre à entendre ce que ton corps dit — pour qu'il n'ait plus besoin de crier.`,
  },

  explorateur_perdu: {
    key: 'explorateur_perdu',
    name: 'L\'EXPLORATEUR(RICE) PERDU(E)',
    blessure: 'Trahison',
    emotion: 'Vide',
    mode: 'Fuite',
    zone: 'Sens',
    reconnaissance: `Tu repars. Encore.
Nouveau projet qui redémarre tout à zéro. Nouvelle ville qui va peut-être changer quelque chose. Nouvelle relation qui a l'air différente des autres — au début.
Le calme t'angoisse plus que le chaos. L'agitation, c'est ta zone de confort.
Quand les choses commencent à se stabiliser, à devenir routinières, une partie de toi se réveille et cherche la sortie.
Et tu n'arrives pas vraiment à t'expliquer pourquoi tu sabotes toujours au moment où ça commencerait à marcher.`,
    verite: `Tu ne cherches pas un sens. Tu fuis un endroit.
Un endroit émotionnel — celui où tu as été trahi(e). Où quelqu'un ou quelque chose a trahi ta confiance à un moment où tu t'étais ouvert(e) complètement.
Ce que tu cherches dans chaque nouveau départ, ce n'est pas une aventure. C'est un endroit où ça ne fera plus aussi mal.
Et ce que tu n'as pas encore trouvé, c'est que cet endroit n'est pas dehors. Il est en toi.`,
    mecanique: `Quelqu'un — une figure d'attachement, un ami proche, une institution — a trahi la confiance de l'enfant ou du jeune adulte que tu étais.
Et ton système nerveux a tiré une conclusion logique : "rester, c'est risquer d'être blessé(e) à nouveau."
Alors tu pars avant. Avant que les choses se dégradent. Avant que les gens te déçoivent. Avant d'être trop attaché(e) pour que ça fasse trop mal.
C'est un mécanisme de survie intelligent. Et il te prive de profondeur, de continuité, de racines.`,
    consequence: `À force de fuir, tu n'arrives jamais là où tu voudrais être.
Parce que ce que tu cherches ne se trouve pas dans un lieu géographique, une relation ou un projet. Ça se trouve dans une relation apaisée avec ta propre histoire.
Et un jour — peut-être ce jour-là — tu réalises que tu fuis depuis des années. Que tu es épuisé(e). Que tu veux juste pouvoir rester quelque part sans avoir peur.`,
    transition: `Rester n'est pas dangereux. Mais ton système nerveux ne le sait pas encore.
Apprendre à rester — à laisser les choses se construire, à tolérer la stabilité sans la saboter — c'est un travail réel et profond.
Pas seul(e). Avec un accompagnement qui comprend ce qui s'est passé.
C'est ce que le protocole propose : reconstruire la sécurité intérieure qui rend le repos possible.`,
  },

  loup_solitaire: {
    key: 'loup_solitaire',
    name: 'LA LOUVE / LE LOUP SOLITAIRE',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Couple',
    reconnaissance: `Tu n'as besoin de personne. Ou c'est ce que tu te dis.
Tu gères. Tu t'organises. Tu traverses les choses seul(e).
Quand on te propose de l'aide, tu déclinas poliment. Quand quelqu'un s'approche trop, tu trouves un prétexte pour garder de la distance.
Tu te sens plus à l'aise seul(e) que dans la plupart des relations. Moins de risques. Moins de désillusions.
Mais parfois, la nuit, quand tout est silencieux — il y a cette chose. Ce pincement. Cette tristesse douce et persistante que tu n'arrives pas vraiment à nommer.
Tu aimerais juste être rejoint(e). Vraiment. Profondément.`,
    verite: `Ce n'est pas de l'indépendance que tu vis. C'est une protection déguisée en indépendance.
À un moment de ta vie, compter sur quelqu'un s'est retourné contre toi. Cette personne est partie. Ou t'a laissé(e) tomber. Ou était là sans vraiment être là.
Et la douleur de cet abandon était si grande que ton psychisme a décidé : "plus jamais."
Tu t'es retiré(e) avant d'être abandonné(e). Tu t'es blindé(e) avant d'être blessé(e).
Et tu as construit autour de toi un espace où personne ne peut vraiment entrer — et où tu ne peux pas vraiment sortir.`,
    mecanique: `Compter sur quelqu'un, c'est risquer d'être laissé(e). Ton système nerveux l'a appris à ses dépens.
Alors il a trouvé une solution : transformer cette blessure en philosophie. "Je me suffis." "Les gens décevront toujours." "Je suis mieux seul(e)."
Ces croyances te protègent. Elles sont aussi la cage qui t'empêche de recevoir ce dont tu as besoin.
Et ton corps sait la vérité, même si ta tête la refuse : l'humain n'est pas fait pour être seul.`,
    consequence: `Cette tristesse de fond qui ne t'abandonne jamais — même dans les bons moments, même entouré(e) — elle ne ment pas.
Elle est là parce que tu ne laisses pas les gens vraiment entrer. Tu es présent(e) en surface et absent(e) en profondeur.
Et les relations que tu as restent à une certaine distance, comme derrière une vitre.
Tu voudrais quelque chose de vrai. Mais la vrai-itude demande une vulnérabilité que tu n'as pas pu te permettre depuis longtemps.`,
    transition: `Tu peux rouvrir la porte. Pas d'un coup. Pas à n'importe qui.
Juste un millimètre. Juste assez pour commencer à distinguer ce qui est dangereux aujourd'hui de ce qui l'était autrefois.
Le protocole ne te demande pas de faire confiance aveuglément. Il t'apprend à reconstruire cette capacité — en sécurité, à ton rythme.`,
  },

  chevalier_masque: {
    key: 'chevalier_masque',
    name: 'LE CHEVALIER / LA GUERRIÈRE MASQUÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Peur',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu réussis. Tu livres. Tu es fiable, compétent(e), irréprochable.
Les gens t'admirent pour ta rigueur, ta capacité à gérer les situations complexes, ton calme apparent.
Mais derrière cette armure — parce que c'est bien une armure — il y a quelqu'un qui tremble à l'idée d'être vu(e) comme insuffisant(e).
Tu travailles deux fois plus que les autres non par ambition, mais par peur.
Peur que si tu baisses la garde, si tu montres ta fatigue, si tu fais une erreur — quelqu'un le verra. Et tu seras rabaissé(e) comme tu l'as déjà été.`,
    verite: `Ton armure, c'est l'excellence. Ton bouclier, c'est la compétence.
Et derrière, il y a quelqu'un qui a peur d'être humilié(e) comme avant.
La vérité inconfortable : tu n'es pas en train de performer pour réussir. Tu performes pour ne jamais être dans la position de celui ou celle qui peut être rabaissé(e).
L'excellence comme protection — c'est brillant. Et c'est épuisant. Et ça t'isole.
Parce que personne ne peut vraiment te rejoindre derrière une armure aussi solide.`,
    mecanique: `À un moment de ta vie, tu as été humilié(e) dans ta vulnérabilité.
Quelqu'un t'a rabaissé(e) quand tu t'es montré(e) tel/telle que tu étais. T'a moqué(e) dans ta faiblesse. T'a fait sentir que ne pas être parfait(e), c'était être indigne.
Ton système nerveux a tiré la seule conclusion logique : "plus jamais de vulnérabilité."
Tu as construit une armure si efficace que même les gens qui t'aiment n'arrivent plus à te toucher vraiment.
Et quelque part, tu en souffres. Parce que tu veux être vu(e) — pas ta performance, toi.`,
    consequence: `L'armure te protège. Elle t'isole aussi.
Tu vis des relations où tu es apprécié(e) pour ce que tu fais, jamais vraiment pour ce que tu es.
Et quand tu es seul(e), la question revient : "Si j'enlevais tout ça — la réussite, la compétence, la maîtrise — est-ce que je vaudrais encore quelque chose ?"
Cette question mérite une vraie réponse. Pas une performance.`,
    transition: `La vulnérabilité ne te détruira pas. Pas avec les bonnes personnes, dans le bon contexte.
Tu peux apprendre à retirer l'armure — cinq minutes à la fois, en sécurité.
Pas pour être "faible". Pour être réel(le). Pour te laisser enfin connaître par quelqu'un — y compris par toi-même.
C'est ce que le protocole rend possible.`,
  },

  accordeur_perpetuel: {
    key: 'accordeur_perpetuel',
    name: 'L\'ACCORDEUR(SE) PERPÉTUEL(LE)',
    blessure: 'Rejet',
    emotion: 'Culpabilité',
    mode: 'Sacrifice',
    zone: 'Couple',
    reconnaissance: `Tu dis oui avant d'avoir vérifié si tu en avais envie.
Tu t'adaptes au ton de la pièce, à l'humeur des gens, à ce qu'on semble attendre de toi — avec une fluidité presque automatique.
Tu évites les conflits avec une habileté que les gens autour de toi admirent. "Tu es tellement facile à vivre."
Mais dans ces moments où tu aimerais dire non, ou exprimer quelque chose qui dérange, ou simplement être en désaccord — quelque chose te bloque.
Une peur diffuse. Une anticipation de rejet. Une voix qui dit : "si tu fais ça, ils vont ne plus t'aimer."`,
    verite: `Ce n'est pas de la gentillesse. Enfin, pas seulement.
C'est une stratégie de survie affective : plaire pour ne pas être rejeté(e).
Et cette stratégie, elle fonctionne — les gens t'apprécient. Mais à quel prix ?
Le prix de ton identité. Tu t'adaptes tellement aux autres que tu ne sais plus qui tu es quand tu es seul(e). Ce que tu veux. Ce que tu penses vraiment. Ce qui t'importe à toi.
Tu as construit une vie entière autour de la validation des autres. Et quelque part, tu t'es perdu(e) en chemin.`,
    mecanique: `Ton "non" a été puni, ignoré ou a provoqué une réaction suffisamment douloureuse pour que tu le supprimes.
Peut-être qu'on t'a rejeté(e) quand tu affirmais quelque chose. Peut-être que l'amour dans ta famille était conditionnel à ton agréabilité. Peut-être qu'on t'a appris très tôt que les gens qui dérangent finissent seuls.
Alors le "non" a disparu. Et avec lui, une part de toi.
Ce n'est pas un défaut de caractère. C'est une adaptation brillante à un environnement où ton authenticité n'était pas la bienvenue.`,
    consequence: `À force de t'adapter à tout le monde, tu ne sais plus qui tu es quand personne ne regarde.
Cette solitude intérieure — être entouré(e) mais ne jamais être vraiment soi — est une des solitudes les plus dures qui soit.
Et les relations que tu construis sur cette base finissent souvent par te laisser insatisfait(e). Parce que les gens ne t'aiment pas, toi. Ils aiment la version de toi que tu leur sers.`,
    transition: `Retrouver ton "non", c'est retrouver toi-même.
Pas en devenant agressif(ve) ou impossible. En apprenant progressivement que tu as le droit d'exister tellement que tu en occupes l'espace.
Que ton désaccord ne détruit pas les relations. Que ton authenticité attire les bonnes personnes.
Le protocole commence exactement là : reconstruire ton identité propre, à l'abri du regard des autres.`,
  },

  scientifique_glace: {
    key: 'scientifique_glace',
    name: 'LE/LA SCIENTIFIQUE GLACÉ(E)',
    blessure: 'Trahison',
    emotion: 'Peur',
    mode: 'Évitement',
    zone: 'Couple',
    reconnaissance: `Tu analyses. Tout.
Tes émotions, tu les observes de l'extérieur comme si elles appartenaient à quelqu'un d'autre.
Tu peux décrire avec une précision remarquable ce que tu ressens théoriquement — mais le ressentir vraiment, dans le corps, dans le présent — c'est une autre histoire.
Dans les relations, tu es là. Tu écoutes. Tu comprends. Mais quelque chose ne passe pas. Une présence complète qui manque. Une chaleur qui s'arrête juste avant d'arriver.
Les gens qui t'aiment le plus finissent souvent par te dire : "j'ai l'impression de ne pas pouvoir t'atteindre vraiment."`,
    verite: `Ce n'est pas de la froideur. Ce n'est pas un manque d'amour.
C'est une paroi de verre que tu as construite pour te protéger.
À un moment de ta vie, tu t'es ouvert(e) complètement — et on t'a trahi(e). Pas nécessairement de façon dramatique. Parfois c'est juste quelqu'un qui a utilisé ta vulnérabilité contre toi. Qui a partagé ce que tu lui avais confié. Qui a ri de ce que tu avais montré.
Et ton cerveau a conclu : "ressentir pleinement, c'est dangereux."
Alors il a installé une vitre entre toi et le monde. Pour protéger. Et tout est là, derrière — intact, intact, intact.`,
    mecanique: `L'analyse est devenue ton mode de survie.
Tant que tu comprends, tu n'as pas à ressentir. Tant que tu intellectualises, tu restes en contrôle. Tant que tu observes, tu ne peux pas être surpris(e) dans ta vulnérabilité.
C'est une anesthésie très sophistiquée. Et elle fonctionne tellement bien que parfois tu te demandes si tu ressens vraiment quelque chose — ou si tu simules juste la bonne réponse émotionnelle.
Sous la glace, tout est encore là. La sensibilité. La tendresse. La capacité d'être touché(e). Elle attend. Elle n'a nulle part où aller.`,
    consequence: `En relation, tu es là sans être vraiment là.
Les autres le sentent, même quand ils ne peuvent pas le nommer. Et toi aussi tu le sens — ce décalage entre ce que tu voudrais vivre et ce que tu arrives à te permettre.
Tu passes à côté d'une intimité profonde que tu souhaites peut-être sans te l'avouer.
Et avec le temps, cette distance devient de plus en plus difficile à traverser — même quand tu le veux.`,
    transition: `Il est possible de décongeler.
Pas d'un coup — le corps ne supporte pas les ruptures brutales. Mais progressivement, en sécurité, avec quelqu'un qui comprend ce qui s'est passé.
Reapprendre à ressentir sans être en danger. C'est exactement ce que le protocole propose.`,
  },

  enfant_perdu: {
    key: 'enfant_perdu',
    name: 'L\'ENFANT PERDU(E)',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Gel',
    zone: 'Sens',
    reconnaissance: `Tu es là. Mais pas vraiment.
Tu te lèves, tu fais les choses, tu réponds aux gens. Mais il y a une distance entre toi et ta propre vie que tu n'arrives pas à combler.
Tu regardes les autres qui semblent habiter leur vie — avec envie, avec enthousiasme, avec élan. Et toi tu observes depuis l'autre côté d'une vitre.
Ce n'est pas de la dépression, pas exactement. C'est plus comme un flottement. Une impression d'être en mode pilote automatique.
Et personne autour de toi ne le voit vraiment, parce que tu fonctionnes. Tu t'en sors. Tu souris.`,
    verite: `Ce flottement que tu ressens n'est pas un vide. C'est une absence.
Une partie de toi a quitté le corps à un moment donné — pour ne pas souffrir. Pour ne pas ressentir quelque chose d'insupportable.
Ce mécanisme s'appelle la dissociation. Il se produit quand une douleur émotionnelle dépasse ce qu'on peut traiter. Particulièrement dans l'enfance, quand on est abandonné(e) émotionnellement — physiquement présent mais seul(e), sans que personne ne vienne vraiment.
Cette partie qui est partie n'a pas disparu. Elle attend.`,
    mecanique: `Quand on est abandonné(e) émotionnellement dans l'enfance — que la présence qui nous était nécessaire n'était pas là — une partie de soi "sort" du corps.
C'est un mécanisme de protection brillant. Automatique. Qui a sauvé quelque chose d'essentiel en toi.
Mais il est difficile à défaire seul(e), parce que la partie qui est partie est aussi celle qui sait comment revenir. Et elle a besoin d'un accompagnement pour sentir que c'est sécurisé de le faire.`,
    consequence: `Et pendant ce temps, ta vie se passe sans toi.
Tu fonctionnes. Tu accomplis des choses. Mais tu ne les vis pas vraiment de l'intérieur.
Les moments de joie n'atterrissent pas complètement. Les connexions restent en surface. Il y a quelque chose d'imperméable entre toi et l'expérience de ta propre existence.
Et cette tristesse douce, persistante, que tu portes depuis si longtemps — ce n'est pas qui tu es. C'est le signe que quelque chose attend d'être retrouvé.`,
    transition: `Cette partie qui s'est absentée attend qu'on aille la chercher. Avec douceur, sans forcer, dans un espace qui est sécurisé.
C'est le travail le plus profond qui soit — et l'un des plus libérateurs.
Le protocole est précisément ce chemin-là : retrouver le chemin vers toi-même, une étape à la fois.`,
  },

  architecte_obsessionnel: {
    key: 'architecte_obsessionnel',
    name: 'L\'ARCHITECTE OBSESSIONNEL(LE)',
    blessure: 'Injustice',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu planifies. Tu anticipes. Tu vérifies.
Tes listes sont impeccables. Ton organisation impressionne les gens autour de toi.
Mais ce qu'ils ne voient pas, c'est le coût intérieur de ce contrôle. L'énergie mentale dépensée à anticiper chaque scénario possible. L'anxiété qui monte quand quelque chose sort du cadre prévu.
Un imprévu — même mineur — peut ruiner une journée entière.
Et la question qui ne te quitte pas : "qu'est-ce qui va mal tourner ?"
Pas parce que tu es pessimiste. Parce que ton système nerveux est en alerte permanente.`,
    verite: `Ce n'est pas de la rigueur. C'est de l'anxiété de survie qui s'est professionnalisée.
Quelque part, ton cerveau a conclu que si tu prévois tout, rien ne peut te surprendre — et te faire du mal.
Cette conclusion n'est pas venue de nulle part. Elle vient d'un environnement où les choses basculaient sans prévenir. Où la stabilité n'était pas garantie. Où il fallait être vigilant pour s'en sortir.
Le contrôle, c'est devenu ton oxygène. Ton mode de sécurité. Ta façon d'exister.
Et ça fonctionne — jusqu'au moment où ça épuise tout.`,
    mecanique: `Très tôt, tu as vécu dans un contexte où l'imprévu avait des conséquences réelles et douloureuses.
Alors ton cerveau a développé une capacité exceptionnelle à anticiper, à prévoir, à verrouiller les variables.
Ce qui était une intelligence de survie est devenu un mode de vie.
Et maintenant, même dans des contextes sécurisés, même quand il n'y a objectivement rien à craindre — le système d'alarme reste allumé. Il ne sait pas comment s'éteindre. Il n'a jamais appris.`,
    consequence: `Ce contrôle permanent t'épuise d'une façon que les gens autour de toi ne voient pas, parce que tu continues à fonctionner parfaitement.
Et quand l'imprévu arrive quand même — et il arrive toujours — tu ne souffres pas moins. Tu souffres autant, et tu es épuisé(e) en plus.
Tu passes à côté de la légèreté. De l'improvisation. Des moments où laisser les choses se faire naturellement est plus riche que de les avoir planifiés.`,
    transition: `Tu peux apprendre à autoriser l'imprévu.
Pas à perdre ta rigueur. Pas à devenir désorganisé(e). Juste à tolérer une part d'incontrôlable sans que ton système nerveux ne parte en alarme.
C'est possible. Et ça commence par comprendre d'où vient cette vigilance — et lui apprendre que le danger d'autrefois n'est plus là.
Le protocole commence exactement là.`,
  },

  rebelle_blesse: {
    key: 'rebelle_blesse',
    name: 'LE/LA REBELLE BLESSÉ(E)',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Agression',
    zone: 'Famille',
    reconnaissance: `Tu exploses. Parfois sans vraiment savoir pourquoi la réaction est si forte.
Ensuite tu regrettes. Pas ce que tu as ressenti — ça, tu le comprends — mais la façon dont ça est sorti.
Tu portes une rage ancienne. Une colère qui n'appartient pas qu'à aujourd'hui.
Les autres la vivent comme de l'agressivité. Toi tu sais que c'est quelque chose de plus profond que ça. Quelque chose qui attend depuis longtemps d'être entendu.
Et au fond de tout ça — derrière les mots durs et les portes qui claquent — il y a quelqu'un qui veut juste qu'on reconnaisse que ce n'était pas juste.`,
    verite: `Ta colère n'est pas un défaut. C'est la trace fidèle d'une injustice qui n'a jamais été réparée.
Quelque chose de profondément injuste s'est passé. Et personne n'a dit : "ce qui t'est arrivé n'était pas normal. Tu avais raison d'être en colère."
Personne. Jamais.
Alors cette colère monte la garde. Elle protège un(e) enfant qui attend encore sa reconnaissance.
Et tant que cette reconnaissance ne viendra pas — de quelqu'un, d'une façon ou d'une autre — elle continuera à chercher des endroits où s'exprimer.`,
    mecanique: `La colère non traitée cherche toujours une sortie.
Elle s'infiltre dans les petits conflits du quotidien, dans les réactions disproportionnées, dans les moments où tu t'emportes sur quelque chose de mineur et tu sais que ce n'est pas vraiment ça.
C'est l'injustice originelle qui parle. À travers le présent.
Et le problème avec la colère non nommée, c'est qu'elle ne discrimine pas. Elle frappe là où elle peut — souvent sur les personnes qui comptent le plus.`,
    consequence: `Cette colère non traitée te coûte exactement les relations que tu veux le plus garder.
Elle éloigne les gens qui t'aiment. Elle te fait passer pour quelqu'un que tu n'es pas — ou pas entièrement.
Et au fond, derrière toute cette intensité, tout ce que tu veux c'est qu'on te regarde et qu'on dise : "oui. C'était injuste. Tu n'as pas imaginé. Tu avais le droit d'être blessé(e)."
Cette phrase — si simple — tu l'attends depuis trop longtemps.`,
    transition: `Honorer la colère, ce n'est pas l'éteindre. C'est lui donner une juste place — et lui permettre enfin de se déposer.
Le protocole commence par cette reconnaissance que tu attends : nommer l'injustice, la valider, et construire quelque chose au-delà d'elle.
Tu mérites cette réparation.`,
  },

  donneur_sans_retour: {
    key: 'donneur_sans_retour',
    name: 'LE/LA DONNEUR(SE) SANS RETOUR',
    blessure: 'Rejet',
    emotion: 'Épuisement',
    mode: 'Sacrifice',
    zone: 'Couple',
    reconnaissance: `Tu donnes. Ton temps, ton énergie, ton attention, ta présence.
À tout le monde. Avant toi. Toujours.
Et recevoir — vraiment recevoir — te met mal à l'aise. Tu déflectes, tu minimises, tu changes de sujet.
Quelqu'un qui s'occupe de toi, qui te pose des questions sur toi, qui veut prendre soin de toi — ça provoque quelque chose d'inconfortable. Presque de la culpabilité.
Comme si tu ne le méritais pas. Comme si tu n'étais autorisé(e) à exister que dans le donner.`,
    verite: `Tu ne donnes pas seulement par générosité. Tu donnes par peur.
Peur d'être rejeté(e) si tu t'arrêtes. Si tu n'es plus utile. Si tu n'as plus rien à offrir.
Quelque part dans ton histoire, tu as intégré que ta valeur se mesure à ce que tu peux apporter — pas à ce que tu es.
Et du coup, donner est devenu ta monnaie d'existence. Ta façon de justifier ta place dans la vie des gens.
Mais personne ne peut remplir un puits qui n'a jamais été rempli à la base. Et tu t'épuises à essayer.`,
    mecanique: `Tu as appris très tôt — peut-être dans ta famille, peut-être dans des relations qui ont forgé qui tu es — que ta valeur dépendait de ce que tu faisais pour les autres.
L'amour conditionnel. La présence méritée. L'affection comme récompense.
Et tu as intégré cette logique si profondément qu'elle est devenue ta façon naturelle d'exister.
Ce n'est pas égoïste d'avoir des besoins. Ce n'est pas un luxe d'être pris(e) en charge.
Mais ton système nerveux ne le sait pas encore. Il attend d'être reprogrammé.`,
    consequence: `Tu es entouré(e). Mais seul(e) sur l'essentiel.
Parce que les gens ne te voient pas vraiment. Ils voient ce que tu fais pour eux.
Et tu passes ta vie à t'occuper des besoins des autres sans jamais vraiment regarder les tiens.
Un jour, la fatigue devient impossible à ignorer. Et avec elle, la question : "et moi ?"
Cette question, tu la mérites depuis longtemps.`,
    transition: `Ta valeur ne dépend pas de ce que tu donnes. Elle existe indépendamment de toute utilité.
Apprendre à recevoir. À exister sans justifier. À se donner à soi ce qu'on donne aux autres.
C'est le travail le plus contre-intuitif qui soit pour toi. Et c'est exactement ce que le protocole propose d'explorer.`,
  },

  cherchant_fatigue: {
    key: 'cherchant_fatigue',
    name: 'LE CHERCHANT / LA CHERCHANTE FATIGUÉ(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Fuite',
    zone: 'Sens',
    reconnaissance: `Encore un livre. Encore une formation. Encore un thérapeute, une retraite, un séminaire.
Tu cherches depuis longtemps. Et chaque fois que tu trouves quelque chose — un outil, une approche, une révélation — ça aide un peu. Et puis ça ne suffit plus.
Alors tu repars chercher ailleurs.
Les gens de ton entourage admirent ta quête. Certains te demandent des conseils. Tu en sais énormément sur le développement personnel, la psychologie, la spiritualité.
Et pourtant — au fond — quelque chose manque toujours. Une paix que tu n'arrives pas à atteindre. Un "ça y est" qui ne vient jamais vraiment.`,
    verite: `Tu ne cherches pas une vérité. Tu cherches quelqu'un en qui tu pourrais avoir confiance sans finir par être déçu(e).
Un guide qui ne te trahira pas. Un système qui tiendra sa promesse. Une certitude qui restera.
Parce qu'à un moment de ta vie, quelque chose ou quelqu'un d'important t'a trahi profondément. Une figure de confiance. Une croyance fondamentale. Une promesse qui n'a pas été tenue.
Et depuis, tu cherches à l'extérieur une sécurité que tu n'arrives pas à trouver à l'intérieur.`,
    mecanique: `La recherche est devenue une façon de rester en mouvement sans s'arrêter.
Et s'arrêter, c'est risquer de se retrouver face à ce qu'il y a vraiment en dessous — la douleur de la trahison, la méfiance profonde, la peur de s'abandonner à quoi que ce soit.
Alors tu accumules le savoir. Tu collectionnes les outils. Tu multiplies les approches.
Sans jamais vraiment te transformer en profondeur — parce que la transformation demande d'aller là où ça fait encore mal.`,
    consequence: `Parce que la transformation demande de s'arrêter de chercher.
Et s'arrêter de chercher, ça terrife. Parce que si tu t'arrêtes et que la paix n'est toujours pas là — qu'est-ce qu'il reste ?
Mais la vérité que tu pressens peut-être : tout est déjà là. En toi. Sous la recherche.
Tu n'as pas besoin d'en apprendre plus. Tu as besoin de descendre dans ce que tu sais déjà.`,
    transition: `Le protocole n'est pas une formation de plus. Ce n'est pas un outil de plus.
C'est une invitation à rentrer. À habiter ce que tu sais déjà. À t'arrêter de chercher dehors ce qui n'attend que toi dedans.
Ça demande du courage. Et un accompagnement qui comprend cette fatigue-là.`,
  },

  emotionnel_noye: {
    key: 'emotionnel_noye',
    name: 'L\'ÉMOTIONNEL(LE) NOYÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Honte',
    mode: 'Somatisation',
    zone: 'Corps',
    reconnaissance: `Tu ressens tout. Profondément, complètement, sans filtre.
Une musique, une image, un regard — et quelque chose en toi est touché avant que tu aies eu le temps de le décider.
Les larmes arrivent trop vite parfois. Ton corps réagit avant ta tête. Dans des réunions, dans des conversations, dans des moments où tu voudrais juste ne pas être "trop".
Et tu as tellement entendu cette phrase — directement ou dans un regard — que tu l'as finie par la croire toi-même.
"Tu es trop sensible."`,
    verite: `Tu n'es pas trop sensible. Tu n'as jamais été trop sensible.
On t'a humilié(e) pour ta sensibilité. On t'a fait honte de ce que tu ressens.
Et depuis ce moment-là, tu portes une honte qui ne t'appartient pas.
La honte d'être trop. D'avoir trop de sensations. De ne pas pouvoir te contrôler comme les autres semblent le faire.
La vérité : ce don de percevoir le monde avec cette intensité est précieux. Il a juste été mal accueilli par des gens qui n'avaient pas les outils pour le recevoir.`,
    mecanique: `Ton système nerveux a appris une association douloureuse : ressentir = être moqué(e), invalidé(e), jugé(e).
Mais il continue à ressentir. Parce que c'est sa nature profonde. Tu ne peux pas éteindre ça.
Alors tu as développé des stratégies — t'excuser de tes émotions avant même qu'on te les reproche, minimiser ce que tu ressens, te couper de toi-même dans les moments d'intensité.
Et quelque part entre vouloir ressentir et avoir honte de ressentir, tu t'épuises.`,
    consequence: `À force d'avoir honte de ce que tu es, tu t'éloignes d'une sensibilité qui est pourtant l'une de tes plus grandes forces.
Tu passes à côté de toi-même. De ta capacité à connecter profondément, à créer, à comprendre ce que les autres ne perçoivent pas.
Et cette honte qui s'est déposée — elle t'alourdit d'une façon qui n'a rien à voir avec qui tu es vraiment.`,
    transition: `La honte ne t'appartient pas. Tu peux la rendre.
Pas à une personne en particulier. La rendre au passé. À l'endroit où elle a été créée. Pour ne plus en avoir à la porter.
Le protocole commence par cette restitution — et par apprendre à accueillir enfin ce don qu'on t'a appris à rejeter.`,
  },

  guerrier_fatigue: {
    key: 'guerrier_fatigue',
    name: 'LE/LA GUERRIER(ÈRE) FATIGUÉ(E)',
    blessure: 'Injustice',
    emotion: 'Épuisement',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu te bats. Depuis si longtemps que tu ne te souviens plus de ce que c'était avant.
Tu gères. Tu tiens. Tu avances même quand tu n'en peux plus.
Les gens autour de toi admirent ta force. Certains te disent "tu es tellement courageux(se)."
Et toi tu sais — en privé, dans les rares moments où tu poses ton bouclier — que tu es épuisé(e). Profondément. Pas juste fatigué(e) — épuisé(e) dans les os.
Mais tu ne sais pas comment t'arrêter. Parce que s'arrêter, dans ta logique intérieure, c'est risquer que tout s'effondre.`,
    verite: `Ce n'est pas de la force. Enfin, pas seulement.
C'est de l'épuisement qui s'est déguisé en force parce qu'il n'avait pas d'autre choix.
À un moment de ta vie — peut-être très tôt — tu as dû tenir une charge qui n'était pas la tienne. Porter quelque chose de trop lourd pour ton âge, ta capacité, tes ressources.
Et tu as tenu. Parce qu'il le fallait.
Et ton système de survie n'a jamais appris la différence entre "fallait tenir" et "peut s'arrêter".`,
    mecanique: `Tu n'as jamais appris le mode "pause". Vraiment.
Les moments de repos que tu t'accordes sont souvent infiltrés par la culpabilité, la to-do list mentale, l'anxiété sourde de ne pas en faire assez.
Ton corps ne sait pas faire la distinction entre le danger réel et le simple fait d'être vivant. Il est en mode combat chronique.
Et tu ne manques pas de volonté. Tu n'es pas faible. Tu es en dette chronique de repos — une dette qui s'accumule depuis des années.`,
    consequence: `Ton corps te supplie d'arrêter. Mais tu n'entends plus le signal.
Les signaux d'alarme — les douleurs, la fatigue profonde, les petites maladies récurrentes, les moments où tu craques sur "rien" — tu les repousses.
Et le risque, c'est que ton corps s'arrête lui-même. D'une façon ou d'une autre. Parce qu'il n'y a qu'un certain temps qu'un système peut tenir sous pression maximale.`,
    transition: `Déposer les armes n'est pas perdre. C'est survivre autrement.
Apprendre ce que "s'arrêter" veut dire — sans que tout s'effondre, sans la culpabilité, sans perdre ton sens de qui tu es.
C'est le travail le plus difficile pour quelqu'un comme toi. Et l'un des plus nécessaires.
Le protocole t'accompagne exactement là-dedans.`,
  },

  amoureux_vide: {
    key: 'amoureux_vide',
    name: 'L\'AMOUREUX(SE) VIDE',
    blessure: 'Abandon',
    emotion: 'Vide',
    mode: 'Fusion',
    zone: 'Couple',
    reconnaissance: `Sans l'autre — il y a un vide immense. Presque physique.
Tu tombes fort et vite. Trop fort, trop vite — tu le sais. Mais tu ne peux pas t'en empêcher.
Dans la relation, tu te perds progressivement. Ses goûts deviennent les tiens. Son rythme devient le tien. Tu adaptes ta vie entière à sa présence.
Et seul(e) — vraiment seul(e) — tu ne sais plus trop qui tu es, ce que tu veux, où tu en es.
Chaque séparation, même temporaire, est vécue comme quelque chose d'insupportable.`,
    verite: `Ce n'est pas de l'amour seul. C'est un vide d'enfant que tu essaies de combler par l'autre.
Un vide qui s'est creusé quand tu avais besoin d'une présence stable, constante, inconditionnelle — et qu'elle n'était pas là. Ou qu'elle était là et puis elle est partie.
Et depuis, quelque chose en toi cherche cette présence. Cette sécurité. Ce sentiment que quelqu'un est là, vraiment, pour toi.
Mais aucun partenaire ne peut remplir un vide d'enfant. Pas parce qu'il ne t'aime pas assez — mais parce que ce n'est pas son rôle.`,
    mecanique: `Ton système nerveux cherche à régler une dette affective ancienne.
Chaque nouvelle relation porte le poids de cette quête — et finit souvent par s'effondrer sous ce poids.
Tu te perds dans l'autre parce que tu as besoin que l'autre soit tout — le parent, l'ami, le partenaire, la sécurité absolue.
Et quand inévitablement il ou elle ne peut pas l'être, la déception est profonde. Pas à cause d'eux. À cause de ce vide originel qui attend d'être comblé d'une façon différente.`,
    consequence: `Et tu passes de relation en relation avec l'espoir que l'une d'elles comblera enfin ce creux.
En attendant, tu te perds. Tu construis des relations asymétriques où tu donnes plus que tu ne reçois, où tu attends plus qu'on ne peut t'offrir.
Et cette dépendance affective ne te protège pas du manque — elle le perpétue.`,
    transition: `Apprendre à être ton propre refuge. C'est la clé — et la chose la plus difficile.
Pas pour ne plus avoir besoin de personne. Pour aimer depuis un endroit plein plutôt que depuis un endroit vide.
C'est un travail profond sur l'attachement, sur l'enfant intérieur, sur ce qui s'est passé quand tu étais trop petit(e) pour le comprendre.
C'est ce que le protocole propose de traverser avec toi.`,
  },

  gardien_secrets: {
    key: 'gardien_secrets',
    name: 'LE/LA GARDIEN(NE) DES SECRETS',
    blessure: 'Trahison',
    emotion: 'Méfiance',
    mode: 'Gel',
    zone: 'Couple',
    reconnaissance: `Tu ne dis jamais tout. Même à ceux qui t'aiment le plus.
Il y a un jardin intérieur — une partie de toi, de tes pensées, de tes histoires — où personne n'entre vraiment. Jamais.
Tu peux être chaleureux(se), présent(e), engagé(e). Mais il y a toujours une porte fermée. Une chose que tu gardes.
Et si quelqu'un s'approche trop près de ce que tu gardes — tu dévies, tu changes de sujet, tu mets de la distance sans que l'autre comprenne vraiment pourquoi.`,
    verite: `Ce n'est pas de la réserve. Ce n'est pas de la discrétion par nature.
C'est de la mémoire. Et de la prudence née d'une douleur réelle.
Quelqu'un t'a trahi(e) sur quelque chose d'intime. A utilisé ce que tu lui avais confié. A retourné ta vulnérabilité contre toi. A partagé ce qui était privé.
Et depuis ce jour-là, tu gardes tout sous clé. Pas parce que tu ne veux pas te connecter — mais parce que tu sais ce que ça peut coûter.`,
    mecanique: `Ta méfiance est une intelligence. Elle t'a protégé(e) de trahisons supplémentaires.
Mais elle a aussi appris une chose fausse : que tous les gens sont potentiellement dangereux. Que s'ouvrir équivaut à risquer.
Et du coup, tu appliques la même vigilance à tout le monde — y compris ceux qui méritent ta confiance, qui ne te trahiraient pas.
Ta méfiance ne distingue plus le passé du présent. Elle répond à un signal d'alarme qui est resté allumé bien après que le danger soit passé.`,
    consequence: `Tu es entouré(e). Mais seul(e) à l'intérieur.
Personne ne te connaît vraiment — et même si parfois tu le voudrais, les murs que tu as construits sont devenus une seconde nature.
Cette solitude-là est particulière. Pas la solitude de quelqu'un qui n'a personne. La solitude de quelqu'un qui a des gens autour mais ne peut pas les laisser entrer.
Et quelque part, tu en souffres. En silence, bien sûr.`,
    transition: `Tu n'as pas à tout livrer. Tu n'as pas à faire confiance aveuglément.
Mais tu peux apprendre à distinguer : ceux qui méritent une part de toi aujourd'hui, de ceux qui t'ont blessé(e) hier.
Le protocole t'apprend à rouvrir sélectivement. Prudemment. Sans trahir ce que tu as appris — en l'affinant.`,
  },

  ombre_silencieuse: {
    key: 'ombre_silencieuse',
    name: 'L\'OMBRE SILENCIEUSE',
    blessure: 'Rejet',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Identité',
    reconnaissance: `Tu passes souvent inaperçu(e). Et une partie de toi dit que ça te convient.
Tu observes plus que tu ne participes. Tu te mets dans les coins dans les groupes. Tu attends que la conversation vienne à toi plutôt que d'aller vers elle.
Les gens qui te connaissent bien savent qu'il y a quelque chose d'immense derrière ce silence. Une profondeur, une richesse intérieure, une façon de voir les choses qui est vraiment singulière.
Mais la plupart ne la verront jamais. Parce que tu ne la montres pas. Parce que tu as appris qu'il vaut mieux rester dans l'ombre.`,
    verite: `Tu n'es pas introverti(e) par nature — ou pas seulement.
Tu l'es devenu(e) par blessure.
Être vu(e), c'est risquer d'être rejeté(e). Et tu l'as déjà vécu. Ce moment où tu t'es montré(e) — où tu as proposé quelque chose de toi — et où le regard de l'autre t'a dit que ce n'était pas assez. Ou trop. Ou pas le bon truc au bon moment.
Alors tu as choisi l'ombre. L'ombre protège. L'ombre ne déçoit pas. Dans l'ombre, on ne peut pas te rejeter.`,
    mecanique: `Très tôt, tu as compris qu'être visible pouvait être dangereux.
Peut-être dans une famille où s'affirmer provocait des réactions. Peut-être dans un groupe où tu as été mis(e) à l'écart. Peut-être avec quelqu'un dont le regard te définissait et qui t'a manqué.
Cette stratégie — disparaître pour survivre — a fonctionné. Elle t'a protégé(e) de beaucoup de rejets potentiels.
Elle t'a aussi coupé(e) de ta propre vie. De ce que tu aurais pu créer, offrir, vivre, si tu avais osé prendre ta place.`,
    consequence: `Et pendant ce temps, tu passes à côté de ce que tu as à offrir au monde.
Et le monde passe à côté de toi.
Cette tristesse de fond — ce sentiment diffus de ne pas vraiment vivre, de regarder plutôt que d'habiter — n'est pas un hasard. C'est le coût de l'effacement.
Et tu mérites plus que ça.`,
    transition: `Sortir de l'ombre d'un centimètre. Pas plus. Pour commencer.
Juste montrer une chose. À une personne. Dans un moment sécurisé.
C'est tout ce que le protocole demande au départ — et c'est déjà un acte de courage immense.`,
  },

  funambule_anxieux: {
    key: 'funambule_anxieux',
    name: 'LE/LA FUNAMBULE ANXIEUX(SE)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Hypervigilance',
    zone: 'Travail',
    reconnaissance: `Tu marches sur un fil. Toujours.
Une critique, une hésitation dans la voix de quelqu'un, un silence un peu long — et tu as l'impression que tout va s'effondrer.
Tu travailles dur, tu gères bien, tu es fiable. Mais en dessous, il y a une anxiété permanente que les autres ne voient pas.
La peur que ça s'arrête. Que tout soit remis en question. Que le sol disparaisse sous tes pieds sans prévenir.
Et tu n'arrives pas à vraiment te poser, à profiter de ce qui marche — parce qu'une partie de toi surveille toujours le bord.`,
    verite: `Ce n'est pas de la fragilité. Ce n'est pas du catastrophisme.
C'est une intelligence de survie développée dans un environnement où il n'y avait pas de filet.
Quelqu'un — ou quelque chose — a disparu sans prévenir. La stabilité que tu croyais acquise s'est retirée.
Et ton système nerveux a retenu la leçon : "la stabilité est temporaire. Reste vigilant(e). Toujours."
Ce réflexe t'a peut-être sauvé(e) à l'époque. Aujourd'hui, il t'empêche de souffler.`,
    mecanique: `Ton système nerveux est resté en mode "survie" même dans des contextes qui ne le nécessitent plus.
Il continue à scanner les horizons pour détecter les signes d'une chute potentielle. Il ne sait pas faire confiance à la stabilité parce qu'il a appris qu'elle pouvait disparaître.
Et le résultat : même quand tout va objectivement bien, il y a cette tension. Cette surveillance. Cette incapacité à vraiment se détendre.
Ton corps ne te laisse pas reprendre ton souffle.`,
    consequence: `Et ton système nerveux est en alerte même quand tout va bien.
Même quand il n'y a rien à surveiller. Même quand tu es en sécurité, aimé(e), stable.
L'anxiété est là quand même. Elle cherche un danger à justifier sa présence. Et quand elle n'en trouve pas, elle en invente un.
Vivre dans cet état-là, c'est épuisant. Et tu mérites de connaître autre chose.`,
    transition: `Le protocole n'est pas un filet. C'est un sol.
Solide. Sous tes pieds. Qui ne disparaît pas.
Quelque chose que tu n'as pas connu assez tôt et que tu peux construire maintenant — intérieurement, dans ton propre système nerveux.
C'est le travail le plus fondateur qui soit.`,
  },

  exile_du_soi: {
    key: 'exile_du_soi',
    name: 'L\'EXILÉ(E) DU SOI',
    blessure: 'Humiliation',
    emotion: 'Vide',
    mode: 'Gel',
    zone: 'Identité',
    reconnaissance: `Tu fonctionnes. Tu t'occupes. Tu joues ton rôle.
De l'extérieur, ça a l'air d'aller. Tu fais ce qu'il faut. Tu réponds aux attentes.
Mais il y a quelque chose d'étrange — ce sentiment d'être étranger(ère) à ta propre vie. De la regarder de l'extérieur. De faire des choses sans vraiment les habiter.
Parfois tu te demandes : "c'est ça, ma vie ?" Non pas avec amertume — juste avec cette impression diffuse que quelque chose d'essentiel est absent.
Et tu ne sais pas vraiment ce que c'est.`,
    verite: `Une partie de toi n'est pas partie en fuite. Elle est partie en exil.
Pour ne plus être attaquée.
Tu as été humilié(e) sur ce que tu étais profondément. Pas ce que tu faisais — ce que tu étais. Ta nature. Ton essence. Ce qui rendait ta façon d'être unique.
Et quelqu'un ou quelque chose t'a fait comprendre que cette façon d'être n'était pas acceptable.
Alors une partie de toi s'est retirée. Elle a préféré l'exil à l'humiliation répétée.`,
    mecanique: `Cette partie exilée n'est pas loin. Elle est en toi.
Elle a juste appris à se cacher si bien que tu l'as perdue de vue.
Et le vide que tu ressens — ce sentiment de ne pas vraiment être là — c'est son absence. C'est la place qu'elle occupait et qui est maintenant vide.
Tu vis une vie qui ressemble à la tienne mais qui ne te ressemble pas vraiment. Parce que tu as construit une vie pour l'extérieur — ce qu'on attendait de toi, ce qui était acceptable, ce qui ne risquait pas d'être attaqué.`,
    consequence: `Et tu vis une vie qui ressemble à la tienne mais ne te ressemble pas vraiment.
Ce vide que tu ressens n'est pas un défaut de caractère. Ce n'est pas une dépression sans raison. C'est une invitation — profonde, persistante — à aller chercher la partie de toi qui attend.
La partie qui sait qui tu es vraiment. Sous tout ce que tu as construit pour survivre.`,
    transition: `L'exilé(e) n'est pas loin. Il/elle est en toi, à portée.
Et il est possible d'aller le/la chercher — avec douceur, sans forcer, dans un espace où cette partie peut enfin sentir qu'il est sécurisé de revenir.
C'est le chemin que le protocole propose : rentrer à toi-même.`,
  },

  gardien_clan: {
    key: 'gardien_clan',
    name: 'LE/LA GARDIEN(NE) DU CLAN',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Sacrifice',
    zone: 'Famille',
    reconnaissance: `Tu défends les tiens. Même quand ils te blessent. Même quand ça te coûte.
Il y a quelque chose qui te lie à ta famille, à ton histoire, à ton origine — d'une façon qui dépasse le simple attachement.
Tu te sens responsable. Pas seulement de toi-même — de eux. De leur bonheur, de leur équilibre, de quelque chose qui ne s'explique pas tout à fait.
Et parfois tu te demandes pourquoi tu portes quelque chose d'aussi lourd. Pourquoi tu ne peux pas juste vivre ta vie sans ce poids.`,
    verite: `Tu essaies de réparer une injustice qui n'est pas la tienne.
Pas consciemment. Mais quelque part dans ta loyauté, dans ton sens du sacrifice, dans ta façon de te mettre en dernier — il y a quelque chose qui appartient à ton histoire familiale, pas à ta propre vie.
Une injustice vécue par les tiens. Un trauma transmis. Une dette émotionnelle que personne n'a demandé à qui que ce soit de porter — et que tu portes quand même.`,
    mecanique: `Les transmissions transgénérationnelles sont réelles.
Les injustices non réparées, les traumas non traités, les patterns de sacrifice — ça se transmet. Pas par les gènes. Par l'atmosphère. Par l'exemple. Par les loyautés invisibles qui s'installent dans les familles.
Et ta loyauté inconsciente envers les tiens t'a fait porter ce qu'ils n'ont pas pu déposer.
C'est magnifique dans sa générosité. Et épuisant dans son poids.`,
    consequence: `Et à force de te sacrifier pour une histoire qui n'est pas la tienne, tu n'écris jamais la tienne.
Ta vie attend. Tes désirs propres attendent. Ce que tu voudrais pour toi — indépendamment de ce que le clan a besoin — attend.
Et les années passent. Et la question reste : "et moi, dans tout ça ?"`,
    transition: `Tu as le droit de déposer ce qui ne t'appartient pas.
Ce n'est pas une trahison. C'est de la liberté. Et peut-être la chose la plus courageuse que tu puisses faire — pour toi, et même pour les tiens.
Le protocole commence par distinguer ce qui t'appartient de ce que tu portes pour d'autres. Et par apprendre à ne garder que ce qui est le tien.`,
  },

  saboteur_lumineux: {
    key: 'saboteur_lumineux',
    name: 'LE/LA SABOTEUR(SE) LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Peur',
    mode: 'Fuite',
    zone: 'Travail',
    reconnaissance: `Tu as un talent réel. Profond. Quelque chose que les gens remarquent, qui te distingue.
Et tu le sais.
Mais dès que ça commence à prendre forme — dès que le projet avance, que la reconnaissance approche, que quelque chose pourrait vraiment décoller — quelque chose arrive.
Un prétexte. Un doute qui prend toute la place. Une autre direction qui semble soudainement plus urgente.
Et tu recommences à zéro. Encore.
Et tu ne comprends pas tout à fait pourquoi tu fais ça. Mais tu le fais.`,
    verite: `Tu n'as pas peur d'échouer. Tu as peur de réussir.
Parce que réussir, c'est être vu(e). Et être vu(e), c'est risquer d'être rejeté(e).
Réussir, c'est s'exposer. S'exposer, c'est risquer la critique, l'envie, le rejet — tout ce que tu as peut-être déjà vécu quand tu t'es montré(e) et que ça s'est retourné contre toi.
Alors une partie de toi préfère rester dans l'ombre du potentiel — où tu peux être prometteur(se) sans jamais être jugé(e).`,
    mecanique: `À un moment dans ton histoire, briller a provoqué quelque chose de douloureux.
Être vu(e) pour ton talent, ta différence, ton intensité — et être puni(e), jalousé(e), rejeté(e) pour ça.
Ton système nerveux a conclu : "briller = danger."
Et il a installé un garde-fou inconscient : chaque fois que tu approches du succès visible, il éteint la lumière pour te protéger.
Ton talent est intact. Il est là, entier, en attente. Pas détruit — juste retenu par une peur qui a fait son boulot trop zélé.`,
    consequence: `Et les années passent. Et les projets restent à moitié construits. Et ton talent reste enfermé.
Et tu le vis parfois comme de la flemme, du manque de discipline, du "pas encore prêt(e)".
Mais ce n'est pas ça. C'est une protection intelligente devenue trop grande.
Et quelque part, tu le sais. Parce que ça te fait mal de ne pas aller jusqu'au bout.`,
    transition: `Briller peut être sécurisé. Ça s'apprend.
Pas seul(e). Pas d'un coup. Mais progressivement, en recâblant l'association "visibilité = danger" pour la remplacer par "visibilité = possible".
Le protocole est l'accompagnement dont tu as besoin pour enfin aller jusqu'au bout.`,
  },

  hyperactif_epuise: {
    key: 'hyperactif_epuise',
    name: 'L\'HYPERACTIF(VE) ÉPUISÉ(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Fuite en avant',
    zone: 'Corps',
    reconnaissance: `Tu ne t'arrêtes jamais. Sport, travail, enfants, projets, amis, obligations — tout à la fois, en permanence.
Les gens autour de toi n'arrivent pas à suivre ton rythme. Certains t'admirent. D'autres s'inquiètent.
Et dès que tu ralentis — dès que le week-end devient calme, dès que le carnet est vide, dès qu'il n'y a plus rien à gérer — quelque chose d'inconfortable remonte.
Pas de la dépression. Plutôt un vide. Une inquiétude sans objet. Une agitation qui cherche quelque chose à faire.
Et parfois, c'est là que tu tombes malade. Comme si ton corps attendait la pause pour s'effondrer.`,
    verite: `Le mouvement est ton anesthésie.
Tant que tu cours, tu ne sens pas le vide.
Et ce vide — il vient de loin. Il s'est installé à un moment où tu avais besoin d'une présence, d'une sécurité, d'un ancrage — et où ils n'étaient pas là.
L'agitation permanente, c'est ta façon de ne pas entendre ce vide. De ne pas te retrouver face à face avec quelque chose que tu n'as jamais vraiment traversé.`,
    mecanique: `Ton cerveau a appris que bouger = être en sécurité. S'arrêter = faire face au vide.
Et le vide, c'était insupportable à un certain moment de ta vie. Alors ton système nerveux a trouvé la solution parfaite : ne jamais s'arrêter.
Résultat : tu es l'une des personnes les plus actives que les gens connaissent. Et intérieurement, tu fuis quelque chose que tu n'as pas encore regardé en face.
Tu n'es pas dynamique par nature. Tu es en fuite — organisée, productive, admirée. Mais en fuite.`,
    consequence: `Ton corps accumule. En silence, il note tout.
Et un jour — souvent lors d'une période qui devrait être joyeuse, un été calme, des vacances — il présente la facture.
Épuisement brutal. Maladie. Effondrement soudain qui surprend tout le monde. Sauf lui.
Et là, le vide est là. Sans l'agitation pour le couvrir.`,
    transition: `Ralentir ne te détruira pas. Le vide ne te détruira pas.
Tu peux apprendre à habiter le calme sans en avoir peur. À rester assis(e) avec toi-même sans que ça devienne insupportable.
C'est un apprentissage profond — et l'un des plus libérateurs que tu puisses faire.
Le protocole commence dans ce silence que tu évites depuis si longtemps.`,
  },

  pelerin: {
    key: 'pelerin',
    name: 'LE/LA PÈLERIN(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Retrait',
    zone: 'Sens',
    reconnaissance: `Tu es en chemin. Depuis toujours, il te semble.
Une mélancolie douce et profonde t'accompagne — pas de la tristesse exactement. Quelque chose de plus complexe. Comme porter quelque chose de beau et de lourd en même temps.
Tu as une vision du monde qui te distingue. Une profondeur que les conversations superficielles n'atteignent jamais.
Et tu marches un peu en marge — pas parce que tu rejettes les autres, mais parce que tu n'as pas vraiment trouvé l'endroit où tu appartiens complètement.`,
    verite: `Tu ne cherches pas une destination. Tu cherches un monde qui t'aurait accueilli comme tu mérites de l'être.
Quelqu'un ou quelque chose t'a trahi(e) profondément. Pas nécessairement de façon spectaculaire. Parfois c'est juste le monde qui n'a pas été à la hauteur de ce que tu espérais — une promesse implicite qui n'a pas été tenue.
Et depuis, tu marches en sage prudence. Ni vraiment dedans, ni vraiment dehors. Une sorte de distance mesurée par rapport à une confiance que tu n'accordes plus facilement.`,
    mecanique: `La trahison que tu as vécue t'a appris que s'abandonner — à une personne, à une cause, à une appartenance — c'était prendre le risque d'être blessé(e).
Alors tu as développé un retrait sage. Pas une fuite. Une marche parallèle.
Tu observes. Tu témoignes. Tu portes une sagesse réelle sur les choses humaines.
Mais tu marches souvent seul(e). Et cette solitude-là, tu ne l'as pas vraiment choisie — elle s'est imposée le jour où tu as perdu confiance.`,
    consequence: `Et cette solitude, tu la portes avec une noblesse qui t'honore. Mais elle te coûte aussi.
Tu passes à côté de connexions profondes. De l'expérience d'être vraiment compris(e), accompagné(e), rejoint(e) dans ce que tu vis.
Et la mélancolie persiste. Comme le signe que quelque chose d'essentiel attend encore.`,
    transition: `Tu n'as pas besoin d'arriver quelque part. Tu as besoin d'être accompagné(e) sur la route.
Pas de quelqu'un qui te demande de changer de direction — de quelqu'un qui marche avec toi, qui comprend ta façon d'avancer, qui ne trahit pas.
Le protocole marche avec toi. À ton rythme. Sans te demander de faire semblant d'être arrivé(e).`,
  },
}

/**
 * Lookup table: dominant_secondary → archetype key
 * Dominant dimension determines primary blessure family.
 * Secondary dimension refines the archetype within that family.
 * Falls back to 'default' when secondary not found.
 */
const ARCHETYPE_LOOKUP: Record<string, Record<string, string>> = {
  '1': { // Analyse mentale → Trahison/Injustice
    default: 'scientifique_glace',
    '2': 'cherchant_fatigue',
    '5': 'architecte_obsessionnel',
    '7': 'architecte_obsessionnel',
    '8': 'cherchant_fatigue',
    '4': 'cherchant_fatigue',
    '6': 'scientifique_glace',
    '9': 'scientifique_glace',
    '10': 'rebelle_blesse',
    '3': 'gardien_epuise',
  },
  '2': { // Fuite en action → Rejet/Abandon
    default: 'hyperactif_epuise',
    '4': 'hyperactif_epuise',
    '8': 'hyperactif_epuise',
    '6': 'saboteur_lumineux',
    '3': 'saboteur_lumineux',
    '9': 'saboteur_lumineux',
    '10': 'explorateur_perdu',
    '1': 'explorateur_perdu',
    '7': 'funambule_anxieux',
    '5': 'guerrier_fatigue',
  },
  '3': { // Care-taking → Rejet/Humiliation
    default: 'donneur_sans_retour',
    '6': 'accordeur_perpetuel',
    '9': 'accordeur_perpetuel',
    '5': 'gardien_epuise',
    '1': 'gardien_epuise',
    '2': 'donneur_sans_retour',
    '7': 'donneur_sans_retour',
    '4': 'donneur_sans_retour',
    '10': 'gardien_clan',
    '8': 'amoureux_vide',
  },
  '4': { // Autonomie forcée → Abandon
    default: 'loup_solitaire',
    '7': 'loup_solitaire',
    '9': 'loup_solitaire',
    '1': 'scientifique_glace',
    '5': 'loup_solitaire',
    '8': 'enfant_perdu',
    '2': 'hyperactif_epuise',
    '10': 'loup_solitaire',
    '6': 'ombre_silencieuse',
    '3': 'amoureux_vide',
  },
  '5': { // Contrôle → Injustice
    default: 'architecte_obsessionnel',
    '1': 'architecte_obsessionnel',
    '7': 'architecte_obsessionnel',
    '3': 'gardien_epuise',
    '9': 'gardien_epuise',
    '2': 'guerrier_fatigue',
    '10': 'guerrier_fatigue',
    '4': 'loup_solitaire',
    '6': 'chevalier_masque',
    '8': 'cherchant_fatigue',
  },
  '6': { // Adaptation/Masking → Rejet
    default: 'accordeur_perpetuel',
    '3': 'accordeur_perpetuel',
    '9': 'invisible_lumineux',
    '4': 'ombre_silencieuse',
    '7': 'ombre_silencieuse',
    '2': 'saboteur_lumineux',
    '10': 'saboteur_lumineux',
    '5': 'chevalier_masque',
    '1': 'scientifique_glace',
    '8': 'amoureux_vide',
  },
  '7': { // Hypervigilance → Abandon/Trahison
    default: 'hyper_vigilant',
    '6': 'hyper_vigilant',
    '3': 'hyper_vigilant',
    '5': 'funambule_anxieux',
    '8': 'funambule_anxieux',
    '4': 'gardien_secrets',
    '1': 'gardien_secrets',
    '9': 'gardien_secrets',
    '2': 'funambule_anxieux',
    '10': 'rebelle_blesse',
  },
  '8': { // Idéalisation → Abandon/Trahison
    default: 'pelerin',
    '2': 'explorateur_perdu',
    '10': 'explorateur_perdu',
    '6': 'amoureux_vide',
    '3': 'amoureux_vide',
    '1': 'cherchant_fatigue',
    '4': 'enfant_perdu',
    '9': 'pelerin',
    '7': 'pelerin',
    '5': 'cherchant_fatigue',
  },
  '9': { // Évitement du conflit → Humiliation
    default: 'volcan_contenu',
    '10': 'volcan_contenu',
    '3': 'volcan_contenu',
    '6': 'exile_du_soi',
    '4': 'exile_du_soi',
    '5': 'chevalier_masque',
    '1': 'chevalier_masque',
    '7': 'emotionnel_noye',
    '2': 'emotionnel_noye',
    '8': 'emotionnel_noye',
  },
  '10': { // Intensité/Drame → Trahison/Injustice
    default: 'rebelle_blesse',
    '9': 'volcan_contenu',
    '4': 'volcan_contenu',
    '7': 'rebelle_blesse',
    '5': 'rebelle_blesse',
    '3': 'gardien_clan',
    '6': 'gardien_clan',
    '1': 'explorateur_perdu',
    '2': 'explorateur_perdu',
    '8': 'amoureux_vide',
  },
}

export function getArchetype(dominant: string, secondary: string): Archetype {
  const dimMap = ARCHETYPE_LOOKUP[dominant]
  const key = dimMap?.[secondary] ?? dimMap?.['default'] ?? 'scientifique_glace'
  return ARCHETYPES[key] ?? ARCHETYPES['scientifique_glace']
}

const PROFILE_TO_DIM: Record<string, string> = {
  P1: '1', P2: '2', P3: '3', P4: '4', P5: '5',
  P6: '6', P7: '7', P8: '8', P9: '9', P10: '10',
}

export function getArchetypeForProfiles(dominant: string, secondary: string): Archetype {
  const d = PROFILE_TO_DIM[dominant] ?? dominant
  const s = PROFILE_TO_DIM[secondary] ?? secondary
  return getArchetype(d, s)
}

export const BLESSURE_COLORS: Record<Blessure, { bg: string; border: string; text: string }> = {
  Rejet:       { bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa' },
  Abandon:     { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  Humiliation: { bg: 'rgba(236,72,153,0.07)',  border: 'rgba(236,72,153,0.2)', text: '#f472b6' },
  Trahison:    { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
  Injustice:   { bg: 'rgba(201,169,97,0.07)',  border: 'rgba(201,169,97,0.2)', text: '#C9A961' },
}
