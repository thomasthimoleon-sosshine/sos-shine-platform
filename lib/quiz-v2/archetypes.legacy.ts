// DEPRECATED — Conservé pour archive. Remplacé par génération via Claude API à venir.

/**
 * SOS Shine — Quiz V2 Archetype Layer
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
  reconnaissance: string   // Mirror — immediate recognition, short lines
  verite: string           // Uncomfortable hidden truth
  mecanique: string        // Deep mechanism — nervous system / blessure / survival
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
    reconnaissance: `Tu aides.
Tu portes.
Tu rassures.
Mais personne ne voit
à quel point tu es fatigué(e).`,
    verite: `Tu ne donnes pas seulement par amour.
Tu donnes aussi
pour éviter d'être oublié(e).`,
    mecanique: `Ton système nerveux a appris
que ta valeur dépendait
de ce que tu apportais aux autres.

Le contrôle = la sécurité.
Le lâcher-prise = le danger.

Ce n'est pas un choix que tu as fait.
C'est une conclusion que ton corps a tirée
pour toi.`,
    consequence: `Et à force de porter tout le monde,
tu t'éloignes lentement de toi-même.

Un jour, tu te retournes
et tu ne te reconnais plus.`,
    transition: `Il existe une façon de reposer le poids.
Pas d'un coup.
Progressivement.
Sans tout perdre.

C'est ce que le protocole te propose.`,
  },

  hyper_vigilant: {
    key: 'hyper_vigilant',
    name: 'L\'HYPER-VIGILANT(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Couple',
    reconnaissance: `Un message sans réponse.
Et déjà — quelque chose en toi s'emballe.
Tu cherches des signes.
Tu surveilles sans le vouloir.
Tu n'arrives pas à couper l'alerte.`,
    verite: `Ce n'est pas de la jalousie.
Ce n'est pas du contrôle.
C'est une alarme d'enfant
qui n'a jamais été désactivée.`,
    mecanique: `Ton système nerveux a appris très tôt
que l'amour pouvait disparaître
d'une seconde à l'autre.

Alors il reste en veille. Toujours.
Ton corps continue à chercher la sécurité
là où, enfant, elle a manqué.`,
    consequence: `Cette alerte permanente
fatigue les gens que tu aimes.
Et te fatigue, toi, encore plus.

Et malgré tout, tu ne sais pas comment l'éteindre.`,
    transition: `Il est possible de désactiver cette alarme.
Pas en faisant semblant qu'elle n'existe pas.
En retournant à la source.

C'est le début du protocole.`,
  },

  invisible_lumineux: {
    key: 'invisible_lumineux',
    name: 'L\'INVISIBLE LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Honte',
    mode: 'Effacement',
    zone: 'Identité',
    reconnaissance: `Tu brilles.
Mais tu te fais petit(e)
avant même qu'on te le demande.

Tu as quelque chose à dire.
Mais tu attends toujours la permission.`,
    verite: `Tu ne manques pas de confiance.
Tu as peur d'exister.
Parce qu'exister,
c'est risquer d'être rejeté(e).`,
    mecanique: `Un jour, quelqu'un t'a fait sentir
que tu étais "en trop".

Ton être profond a entendu :
"je ne suis pas légitime."

Et depuis, tu te rends invisible
pour ne plus jamais entendre ça.`,
    consequence: `Mais à force de disparaître,
tu laisses ta propre vie se vivre sans toi.

Et la lumière que tu portes
reste enfermée.`,
    transition: `La lumière que tu portes
cherche juste la permission de sortir.

Le protocole ouvre cette porte.`,
  },

  volcan_contenu: {
    key: 'volcan_contenu',
    name: 'LE VOLCAN CONTENU',
    blessure: 'Humiliation',
    emotion: 'Colère rentrée',
    mode: 'Somatisation',
    zone: 'Corps',
    reconnaissance: `Mâchoire serrée.
Épaules coincées.
Ventre noué.

Ton corps parle
quand ta voix se tait.`,
    verite: `Il y a une colère en toi
que tu n'as pas le droit d'exprimer.
Alors elle s'installe dans tes muscles.

Et ton corps paye ce que ta voix ne peut pas dire.`,
    mecanique: `On t'a appris que la colère était dangereuse.
Alors tu l'as avalée.

Mais l'énergie d'une émotion ne disparaît jamais.
Elle se loge dans les tissus.
Elle attend.`,
    consequence: `Et les tensions chroniques,
les migraines,
les douleurs sans raison apparente —

ce ne sont pas des hasards.
C'est une mémoire que ton corps garde.`,
    transition: `Ce que tu portes dans le corps
peut être libéré.
Pas en explosion.
En douceur, en sécurité.

C'est ce que propose le protocole.`,
  },

  explorateur_perdu: {
    key: 'explorateur_perdu',
    name: 'L\'EXPLORATEUR(RICE) PERDU(E)',
    blessure: 'Trahison',
    emotion: 'Vide',
    mode: 'Fuite',
    zone: 'Sens',
    reconnaissance: `Tu repars. Encore.
Nouveau projet.
Nouvelle ville.
Nouvelle relation.

Le calme t'angoisse plus que le chaos.`,
    verite: `Tu ne cherches pas un sens.
Tu fuis un endroit
où tu as été trahi(e).

Ce que tu cherches dehors
n'est pas là-bas.`,
    mecanique: `Quelqu'un a trahi la confiance
de l'enfant que tu étais.

Depuis, rester = risquer d'être blessé à nouveau.
Alors tu pars avant.
Toujours avant.`,
    consequence: `Et à force de fuir,
tu n'arrives jamais
là où tu voudrais être.

Un beau jour, tu te rends compte
que tu fuis depuis des années.`,
    transition: `Rester n'est pas dangereux.
Tu peux apprendre ça.
Pas seul(e).
Avec le protocole.`,
  },

  loup_solitaire: {
    key: 'loup_solitaire',
    name: 'LA LOUVE / LE LOUP SOLITAIRE',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Couple',
    reconnaissance: `Tu n'as besoin de personne.
Ou c'est ce que tu te dis.

Mais parfois, la nuit,
tu aimerais juste
être rejoint(e).`,
    verite: `Ce n'est pas de l'indépendance.
C'est une protection.

Tu t'es retiré(e) avant d'être abandonné(e).
Parce que l'abandon fait trop mal.`,
    mecanique: `Tu as appris que compter sur quelqu'un,
c'est risquer d'être laissé(e).

Alors tu as transformé ta blessure en philosophie :
"je me suffis."

Mais ton corps sait que l'humain
n'est pas fait pour être seul.`,
    consequence: `Et cette tristesse de fond ne ment pas.
Elle est là, même dans les bons moments.
Même entouré(e) de gens.

Parce que tu ne les laisses pas vraiment entrer.`,
    transition: `Tu peux rouvrir la porte.
Pas d'un coup.
Juste un peu.

Le protocole commence là.`,
  },

  chevalier_masque: {
    key: 'chevalier_masque',
    name: 'LE CHEVALIER / LA GUERRIÈRE MASQUÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Peur',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu réussis.
Tu performes.
Tu es irréprochable.

Et tu trembles à l'idée
qu'on te voie fragile.`,
    verite: `Ton armure, c'est la compétence.
Ton bouclier, c'est l'excellence.

Mais derrière,
il y a quelqu'un qui a peur
d'être rabaissé(e).`,
    mecanique: `On t'a humilié(e) quand tu étais vulnérable.
Alors plus jamais.

Tu as construit une armure si solide
que même ceux qui t'aiment
n'arrivent plus à te toucher.`,
    consequence: `Et cette armure te protège.
Mais elle t'isole aussi.

Et au fond, tu voudrais juste
être vu(e) sans avoir à performer.`,
    transition: `La vulnérabilité ne te détruira pas.
Tu peux apprendre à retirer l'armure
cinq minutes à la fois.

C'est par là que commence le protocole.`,
  },

  accordeur_perpetuel: {
    key: 'accordeur_perpetuel',
    name: 'L\'ACCORDEUR(SE) PERPÉTUEL(LE)',
    blessure: 'Rejet',
    emotion: 'Culpabilité',
    mode: 'Sacrifice',
    zone: 'Couple',
    reconnaissance: `Tu dis oui.
Avant même d'avoir vérifié
si tu en avais envie.

Tu t'adaptes.
Tu arrondis.
Tu souris.`,
    verite: `Ce n'est pas de la gentillesse.
C'est une stratégie.

Plaire pour ne pas être rejeté(e).

Et ça te coûte ton identité.`,
    mecanique: `Ton "non" a été puni ou ignoré.
Alors il a disparu.

Et tu as appris que tu étais aimé(e)
seulement quand tu étais arrangeant(e),
utile, agréable.`,
    consequence: `Et à force de t'adapter à tout le monde,
tu ne sais plus
qui tu es quand tu es seul(e).

Et cette solitude-là est la plus dure.`,
    transition: `Retrouver ton "non",
c'est retrouver toi-même.

Le protocole commence par là.`,
  },

  scientifique_glace: {
    key: 'scientifique_glace',
    name: 'LE/LA SCIENTIFIQUE GLACÉ(E)',
    blessure: 'Trahison',
    emotion: 'Peur',
    mode: 'Évitement',
    zone: 'Couple',
    reconnaissance: `Tu analyses.
Tout.

Tes émotions.
Celles des autres.
Comme si comprendre
pouvait remplacer ressentir.`,
    verite: `Ce n'est pas de la froideur.
C'est une paroi de verre.

Que tu as construite
pour ne plus jamais être blessé(e)
de cette façon-là.`,
    mecanique: `On t'a trahi(e) alors que tu étais ouvert(e).

Ton cerveau a conclu : "ressentir = danger."

Il a construit une anesthésie très sophistiquée.
Pour te protéger.
Mais sous la glace, tout est encore là.
Intact.`,
    consequence: `Et en relation,
tu es là sans être vraiment là.

Les autres le sentent.
Et toi aussi.`,
    transition: `Il est possible de décongeler doucement.
Pas d'un coup.
En sécurité.

C'est ce que propose le protocole.`,
  },

  enfant_perdu: {
    key: 'enfant_perdu',
    name: 'L\'ENFANT PERDU(E)',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Gel',
    zone: 'Sens',
    reconnaissance: `Tu es là.
Mais pas vraiment.

Tu regardes les autres vivre
comme depuis l'autre côté d'une vitre.`,
    verite: `Ce flottement que tu ressens,
ce n'est pas un vide.

C'est une absence.
Une partie de toi qui a quitté le corps
pour ne pas souffrir.`,
    mecanique: `Quand on est abandonné(e) émotionnellement enfant,
une partie de soi "sort" du corps.

C'est un mécanisme de protection.
Brillant. Automatique.
Et difficile à défaire seul(e).`,
    consequence: `Et pendant ce temps,
ta vie se passe sans toi.

Tu fonctionnes.
Mais tu ne vis pas vraiment.`,
    transition: `Cette partie qui s'est absentée
attend qu'on aille la chercher.
Avec douceur.

Le protocole est ce chemin-là.`,
  },

  architecte_obsessionnel: {
    key: 'architecte_obsessionnel',
    name: 'L\'ARCHITECTE OBSESSIONNEL(LE)',
    blessure: 'Injustice',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu planifies.
Tu anticipes.
Tu vérifies.

Et ça ne suffit jamais.
L'imprévu te coûte trop cher.`,
    verite: `Ce n'est pas de la rigueur.
C'est de l'anxiété de survie
qui s'est professionnalisée.`,
    mecanique: `Tu as vécu, jeune,
un environnement où tout pouvait basculer
sans prévenir.

Ton cerveau a tiré une conclusion :
"si je prévois tout,
rien ne peut me surprendre."

Le contrôle est devenu ton oxygène.`,
    consequence: `Mais ce contrôle permanent t'épuise.
Et ne t'empêche pas de souffrir
quand l'imprévu arrive quand même.

Et il arrive toujours.`,
    transition: `Tu peux apprendre à autoriser l'imprévu.
Pas à te laisser submerger par lui.
Pas à perdre ta rigueur.

Juste à respirer entre les lignes.`,
  },

  rebelle_blesse: {
    key: 'rebelle_blesse',
    name: 'LE/LA REBELLE BLESSÉ(E)',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Agression',
    zone: 'Famille',
    reconnaissance: `Tu exploses.
Ensuite tu regrettes.

Tu as une rage que tu portes depuis longtemps.
Elle te fatigue
autant qu'elle te défend.`,
    verite: `Ta colère n'est pas un défaut.
C'est la trace d'une injustice
qui n'a jamais été réparée.

Et personne ne te l'a encore dit.`,
    mecanique: `Personne n'a jamais dit :
"ce qui t'est arrivé n'était pas juste."

Alors la colère monte la garde pour toi.
Elle protège un(e) enfant
qui attend encore sa reconnaissance.`,
    consequence: `Mais cette colère non traitée
te coûte les relations
que tu veux le plus garder.

Et au fond, tout ce que tu veux
c'est qu'on reconnaisse
que c'était injuste.`,
    transition: `Honorer la colère,
ce n'est pas l'éteindre.
C'est lui donner sa juste place.

Le protocole commence par cette reconnaissance.`,
  },

  donneur_sans_retour: {
    key: 'donneur_sans_retour',
    name: 'LE/LA DONNEUR(SE) SANS RETOUR',
    blessure: 'Rejet',
    emotion: 'Épuisement',
    mode: 'Sacrifice',
    zone: 'Couple',
    reconnaissance: `Tu donnes.
Tout le temps.
À tout le monde.

Et recevoir te met mal à l'aise.
Comme si tu ne le méritais pas.`,
    verite: `Tu ne donnes pas seulement par générosité.
Tu donnes par peur.

Peur d'être abandonné(e)
si tu t'arrêtes.`,
    mecanique: `Tu as appris que ta valeur
se mesurait à ce que tu pouvais offrir.
Pas à ce que tu es.

Alors donner est devenu ta monnaie d'existence.

Et personne ne peut remplir un puits
qui n'a jamais été rempli à la base.`,
    consequence: `Tu es entouré(e).
Mais seul(e) sur l'essentiel.

Parce que personne ne te voit vraiment.
Ils voient ce que tu fais.`,
    transition: `Ta valeur ne dépend pas de ce que tu donnes.
Tu peux commencer à le croire.

Le protocole commence par là.`,
  },

  cherchant_fatigue: {
    key: 'cherchant_fatigue',
    name: 'LE CHERCHANT / LA CHERCHANTE FATIGUÉ(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Fuite',
    zone: 'Sens',
    reconnaissance: `Tu cherches.
Encore les livres.
Les formations.
Les thérapeutes.
Les retraites.

Et quelque chose manque toujours.`,
    verite: `Tu ne cherches pas une vérité.
Tu cherches quelqu'un
en qui tu pourrais avoir confiance
sans finir par être déçu(e).`,
    mecanique: `Quelqu'un a trahi quelque chose d'important
quand tu étais ouvert(e).

Depuis, tu cherches dehors
ce que tu as peur de ne pas trouver dedans.

Et tu accumules le savoir
sans jamais te transformer en profondeur.`,
    consequence: `Parce que la transformation
demande de s'arrêter de chercher.

Et s'arrêter de chercher
te terrife.`,
    transition: `Tout est déjà là.
Le protocole est une invitation à rentrer.
Pas à en apprendre plus.
À habiter ce que tu sais déjà.`,
  },

  emotionnel_noye: {
    key: 'emotionnel_noye',
    name: 'L\'ÉMOTIONNEL(LE) NOYÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Honte',
    mode: 'Somatisation',
    zone: 'Corps',
    reconnaissance: `Tu ressens trop.
Ou c'est ce qu'on t'a dit.

Tes larmes arrivent trop vite.
Ton corps réagit avant ta tête.
Et ça te met mal à l'aise.`,
    verite: `Tu n'es pas trop sensible.
On t'a humilié(e) pour ta sensibilité.

Et depuis,
tu as honte de ce que tu es.

La honte n'est pas la tienne.`,
    mecanique: `Ton système nerveux a appris
que ressentir = être moqué(e).

Mais il continue à ressentir.
Parce que c'est sa nature.

Et ce que tu vis comme un défaut
est en réalité un don
mal accueilli.`,
    consequence: `Et à force d'avoir honte de ce que tu es,
tu t'éloignes d'une sensibilité
qui est pourtant une force réelle.`,
    transition: `La honte ne t'appartient pas.
Tu peux la rendre.

Le protocole commence par cette restitution.`,
  },

  guerrier_fatigue: {
    key: 'guerrier_fatigue',
    name: 'LE/LA GUERRIER(ÈRE) FATIGUÉ(E)',
    blessure: 'Injustice',
    emotion: 'Épuisement',
    mode: 'Contrôle',
    zone: 'Travail',
    reconnaissance: `Tu te bats.
Depuis si longtemps.

Et tu ne sais même plus
ce que ce serait
de ne pas combattre.`,
    verite: `Ce n'est pas de la force.
C'est de l'épuisement
qui ne s'est jamais autorisé
à s'arrêter.`,
    mecanique: `Tu as porté, jeune, une charge
qui n'était pas la tienne.

Tu as tenu parce qu'il fallait tenir.
Et ton système de survie
n'a jamais appris le mode "pause".

Tu ne manques pas de volonté.
Tu es en dette chronique de repos.`,
    consequence: `Ton corps te supplie d'arrêter.
Mais tu n'entends plus le signal.

Et le jour où tu t'arrêteras
ce sera peut-être parce que ton corps
t'y aura obligé.`,
    transition: `Déposer les armes n'est pas perdre.
C'est survivre différemment.

Le protocole t'apprend ce que "s'arrêter" veut dire
sans que tout s'effondre.`,
  },

  amoureux_vide: {
    key: 'amoureux_vide',
    name: 'L\'AMOUREUX(SE) VIDE',
    blessure: 'Abandon',
    emotion: 'Vide',
    mode: 'Fusion',
    zone: 'Couple',
    reconnaissance: `Sans l'autre —
un vide immense.

Tu tombes fort et vite.
Tu te perds dans la relation.
Et seul(e), tu ne sais plus qui tu es.`,
    verite: `Ce n'est pas de l'amour seul.
C'est un vide d'enfant
que tu essaies de combler
par l'autre.

Et aucun partenaire
ne peut remplir un vide d'enfant.`,
    mecanique: `Un grand vide s'est creusé
quand tu avais besoin d'une présence constante
et qu'elle a manqué.

Depuis, ton système cherche
à combler ce trou.

Mais ce trou-là n'est pas dehors.`,
    consequence: `Et tu passes de relation en relation
avec l'espoir que l'une d'elles
comblera enfin ce creux.

En attendant, tu te perds.`,
    transition: `Apprendre à être ton propre refuge.
C'est possible.
C'est le vrai début.

C'est ce que propose le protocole.`,
  },

  gardien_secrets: {
    key: 'gardien_secrets',
    name: 'LE/LA GARDIEN(NE) DES SECRETS',
    blessure: 'Trahison',
    emotion: 'Méfiance',
    mode: 'Gel',
    zone: 'Couple',
    reconnaissance: `Tu ne dis jamais tout.
Même à ceux qui t'aiment le plus.

Il y a un jardin secret
où personne n'entre.
Jamais vraiment.`,
    verite: `Ce n'est pas de la réserve.
C'est de la mémoire.

Quelqu'un t'a trahi(e) sur quelque chose d'intime.
Et depuis, tu gardes tout sous clé.`,
    mecanique: `Ta vulnérabilité est verrouillée
à double tour.

Ta méfiance t'a protégé(e).
Elle est précieuse.

Mais elle peut aussi apprendre
à distinguer le passé du présent.`,
    consequence: `Tu es entouré(e).
Mais seul(e) à l'intérieur.

Parce que personne ne peut vraiment entrer.
Et quelque part, tu en souffres.`,
    transition: `Tu peux apprendre à rouvrir.
Pas à tout livrer.
Juste à distinguer
ceux qui méritent ta confiance aujourd'hui.`,
  },

  ombre_silencieuse: {
    key: 'ombre_silencieuse',
    name: 'L\'OMBRE SILENCIEUSE',
    blessure: 'Rejet',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Identité',
    reconnaissance: `Tu es discret(ète).
On t'oublie facilement.
Et ça te convient.
Presque.

Mais il y a une vie intérieure riche
que personne ne voit jamais.`,
    verite: `Tu n'es pas introverti(e) par nature.
Tu l'es devenu(e) par blessure.

Être vu(e), c'est risquer d'être rejeté(e).
Alors tu as choisi l'ombre.`,
    mecanique: `Tu as compris très tôt
qu'être vu(e), c'était dangereux.

Alors tu as disparu.
Cette stratégie t'a protégé(e)
de beaucoup de blessures.

Mais elle t'a aussi coupé(e)
d'une partie de ta vie.`,
    consequence: `Et pendant ce temps,
tu passes à côté
de ce que tu as à offrir.

Et la tristesse de fond
n'est pas un hasard.`,
    transition: `Sortir de l'ombre d'un centimètre.
Pas plus. Pour commencer.

C'est tout ce que demande le protocole.`,
  },

  funambule_anxieux: {
    key: 'funambule_anxieux',
    name: 'LE/LA FUNAMBULE ANXIEUX(SE)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Hypervigilance',
    zone: 'Travail',
    reconnaissance: `Tu marches sur un fil.
Toujours.

Une critique, une hésitation —
et tu as l'impression
que tout va s'effondrer.`,
    verite: `Ce n'est pas de la fragilité.
C'est une intelligence de survie
qui n'a jamais eu de filet.`,
    mecanique: `Tu as appris tôt
que la stabilité pouvait disparaître.

Alors tu vis en équilibre constant,
prêt(e) à rattraper la chute.

Mais ton corps ne peut pas
tenir le funambule à vie.`,
    consequence: `Et ton système nerveux est en alerte
même quand tout va bien.

Même quand il n'y a rien à surveiller.
Même quand tu es en sécurité.`,
    transition: `Le protocole n'est pas un filet.
C'est un sol.
Solide. Sous tes pieds.

C'est ce que tu n'as jamais eu.`,
  },

  exile_du_soi: {
    key: 'exile_du_soi',
    name: 'L\'EXILÉ(E) DU SOI',
    blessure: 'Humiliation',
    emotion: 'Vide',
    mode: 'Gel',
    zone: 'Identité',
    reconnaissance: `Tu fonctionnes.
Tu t'occupes.
Tu joues ton rôle.

Mais tu as l'impression
d'être étranger(ère) à toi-même.`,
    verite: `Une partie de toi
n'est pas partie en fuite.
Elle est partie en exil.

Pour ne plus être attaquée.`,
    mecanique: `Tu as été humilié(e) sur ce que tu étais,
profondément.

Alors une partie de toi s'est absentée.
Elle a préféré partir
plutôt que d'être attaquée à nouveau.

Elle attend. Quelque part en toi.`,
    consequence: `Et tu vis une vie
qui ressemble à la tienne
mais ne te ressemble pas vraiment.

Et ce vide que tu ressens
n'est pas un défaut.
C'est une invitation.`,
    transition: `L'exilé(e) n'est pas loin.
Il/elle est en toi.

Et il est possible d'aller le/la chercher.
Avec douceur. Sans forcer.`,
  },

  gardien_clan: {
    key: 'gardien_clan',
    name: 'LE/LA GARDIEN(NE) DU CLAN',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Sacrifice',
    zone: 'Famille',
    reconnaissance: `Tu défends les tiens.
Même quand ils te blessent.
Tu portes quelque chose
qui dépasse ta propre vie.`,
    verite: `Tu essaies de réparer
une injustice qui n'est pas la tienne.

Elle appartient à ton histoire.
Pas à ta mission.`,
    mecanique: `Tu portes une transmission transgénérationnelle.
Une injustice vécue par les tiens
que personne n'a réparée.

Et ta loyauté inconsciente
la porte pour eux.

C'est magnifique. Et épuisant.`,
    consequence: `Et à force de te sacrifier
pour une histoire qui n'est pas la tienne,
tu n'écris jamais la tienne.

Ta vie attend.`,
    transition: `Tu as le droit de déposer
ce qui ne t'appartient pas.

Ce n'est pas une trahison.
C'est de la liberté.`,
  },

  saboteur_lumineux: {
    key: 'saboteur_lumineux',
    name: 'LE/LA SABOTEUR(SE) LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Peur',
    mode: 'Fuite',
    zone: 'Travail',
    reconnaissance: `Tu as un talent.
Tu le sais.

Et dès que ça prend forme,
quelque chose "tombe".
Tu recommences à zéro.`,
    verite: `Tu n'as pas peur d'échouer.
Tu as peur de réussir.

Parce que réussir, c'est être vu(e).
Et être vu(e),
c'est risquer d'être rejeté(e).`,
    mecanique: `Enfant, briller = être puni(e) ou rejeté(e).
Alors briller est devenu dangereux.

Et une partie de toi
éteint ta lumière à chaque fois
qu'elle risque de t'exposer.

Ton talent est là. Intact.
En attente d'une permission.`,
    consequence: `Et cette permission,
tu ne te l'accordes pas encore.

Et les années passent.
Et ton talent reste enfermé.`,
    transition: `Briller peut être sécurisé.
Pas seul(e).
Accompagné(e).

C'est ce que propose le protocole.`,
  },

  hyperactif_epuise: {
    key: 'hyperactif_epuise',
    name: 'L\'HYPERACTIF(VE) ÉPUISÉ(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Fuite en avant',
    zone: 'Corps',
    reconnaissance: `Tu ne t'arrêtes jamais.
Sport. Travail. Enfants. Projets.
Tout à la fois.

Et dès que tu ralentis —
tu tombes malade.`,
    verite: `Le mouvement est ton anesthésie.
Tant que tu cours,
tu ne sens pas le vide.`,
    mecanique: `Tant que tu courais,
tu n'entendais pas le vide
d'abandon de ton enfance.

Mais ton corps, lui, accumule.
Et il présente la facture
dès que tu t'arrêtes.

Tu n'es pas dynamique.
Tu es en fuite.`,
    consequence: `Et un jour, ton corps t'arrêtera
si tu ne le fais pas toi-même.

Ce jour-là, le vide sera là.
Inaltenable.`,
    transition: `Ralentir ne te détruira pas.
Tu peux apprendre à habiter le calme
sans en avoir peur.

Le protocole commence dans ce silence-là.`,
  },

  pelerin: {
    key: 'pelerin',
    name: 'LE/LA PÈLERIN(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Retrait',
    zone: 'Sens',
    reconnaissance: `Tu es en chemin.
Depuis toujours.

Une mélancolie profonde t'accompagne.
Quelque chose de beau et de triste
à la fois.`,
    verite: `Tu ne cherches pas une destination.
Tu cherches un monde
qui t'aurait accueilli
comme tu méritais de l'être.`,
    mecanique: `Une trahison ancienne
t'a fait perdre confiance dans le monde.

Alors tu as choisi le retrait sage.
Ni fuite ni combat.
Une sorte de marche parallèle.

Et tu portes une sagesse réelle.
Mais tu marches seul(e).`,
    consequence: `Et cette solitude,
tu n'as pas vraiment choisi de la porter.

Elle s'est imposée
le jour où tu as perdu confiance.`,
    transition: `Tu n'as pas besoin d'arriver quelque part.
Tu as besoin d'être accompagné(e)
sur la route.

Le protocole marche avec toi.`,
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
