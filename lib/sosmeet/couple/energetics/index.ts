/**
 * SOS Meet Couple — la lecture énergétique.
 * ---------------------------------------------------------------------------
 * SON BUT, ET RIEN D'AUTRE : montrer en quoi ces deux personnes sont
 * COMPLÉMENTAIRES, et quels points demandent de l'ATTENTION.
 *
 * Elle ne diagnostique jamais. Les failles viennent des réponses au
 * questionnaire, toujours. Ici on éclaire des tempéraments, on nomme ce qui
 * s'emboîte et ce qui frotte, et on s'arrête là.
 *
 * Chaque observation dit d'où elle vient et à quel point elle est fiable,
 * parce qu'une lecture énergétique qui masque ses approximations ne vaut rien.
 */
import { numerologieCouple, type NumerologieCouple } from './numerology'
import { synastrie, type Synastrie, type Naissance } from './astro'
import { humanDesignCouple, type HDCouple } from './humandesign'

export type Source = 'numérologie' | 'astrologie' | 'human design'
export type Fiabilite = 'exacte' | 'approchée' | 'partielle'

export type Observation = {
  source: Source
  fiabilite: Fiabilite
  titre: string
  texte: string
}

export type Energetique = {
  /** Ce qui vous emboîte. Toujours présenté en premier. */
  complementarites: Observation[]
  /** Ce qui demande de l'attention. Jamais formulé comme un défaut. */
  attentions: Observation[]
  /** Une phrase qui dit ce que ce couple est, ensemble. */
  ensemble: string
  /** Le détail technique, pour qui veut le voir. */
  detail: { numerologie: NumerologieCouple; astrologie: Synastrie; humanDesign: HDCouple }
  limites: string[]
}

export type { Naissance }

export function buildEnergetique(a: Naissance, b: Naissance, annee = new Date().getFullYear()): Energetique {
  const num = numerologieCouple(a.date, b.date, annee)
  const syn = synastrie(a, b)
  const hd = humanDesignCouple(a.date, a.heure, b.date, b.heure)

  const complementarites: Observation[] = []
  const attentions: Observation[] = []
  const heuresConnues = !!a.heure && !!b.heure
  const fiabAstro: Fiabilite = heuresConnues ? 'approchée' : 'partielle'

  // ── Numérologie : les deux chemins ──────────────────────────────────────
  const ecart = Math.abs(num.cheminA - num.cheminB)
  if (num.cheminA === num.cheminB) {
    complementarites.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Vous marchez du même pas',
      texte: `Vous suivez le même chemin, celui ${num.labelA}. Vous n’avez pas besoin de vous expliquer vos priorités : elles sont les mêmes.`,
    })
    attentions.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Les mêmes angles morts',
      texte: 'Ce qui vous unit vous prive aussi d’un contrepoids. Là où l’un ne voit pas, l’autre ne verra pas non plus. Cherchez volontairement l’avis d’un tiers sur les décisions importantes.',
    })
  } else if (ecart >= 5) {
    complementarites.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Deux forces qui se complètent',
      texte: `L’un avance par ${num.labelA}, l’autre par ${num.labelB}. Vous couvrez ensemble un terrain qu’aucun des deux ne couvrirait seul.`,
    })
    attentions.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Deux rythmes à accorder',
      texte: 'Des chemins aussi éloignés demandent une traduction permanente. Ce qui va de soi pour l’un ne va pas de soi pour l’autre, et la fatigue vient de là plus que des désaccords eux-mêmes.',
    })
  } else {
    complementarites.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Des chemins voisins',
      texte: `${num.labelA.charAt(0).toUpperCase() + num.labelA.slice(1)} d’un côté, ${num.labelB} de l’autre. Assez proche pour se comprendre vite, assez distinct pour apprendre l’un de l’autre.`,
    })
  }

  if (!num.memeAnnee) {
    attentions.push({
      source: 'numérologie', fiabilite: 'exacte', titre: 'Vous n’êtes pas au même moment',
      texte: `Cette année, l’un traverse une année personnelle ${num.anneeA}, l’autre une année ${num.anneeB}. Vous n’avez ni la même énergie ni les mêmes besoins en ce moment, et cela suffit à créer des malentendus sur l’envie de bouger ou de se poser.`,
    })
  }

  // ── Astrologie : éléments, aspect des Soleils ───────────────────────────
  const ea = syn.themeA.soleil.element, eb = syn.themeB.soleil.element
  if (syn.elementsAccordes) {
    complementarites.push({
      source: 'astrologie', fiabilite: fiabAstro, titre: `${ea} et ${eb} se nourrissent`,
      texte: 'Vos deux natures parlent la même langue. Vous vous comprenez sans avoir à traduire, et l’ambiance entre vous se rétablit d’elle-même après une tension.',
    })
  } else {
    attentions.push({
      source: 'astrologie', fiabilite: fiabAstro, titre: `${ea} et ${eb} ne parlent pas la même langue`,
      texte: 'Ce n’est pas un obstacle, c’est un travail de traduction permanent. Ce que l’un vit comme de l’élan, l’autre peut le vivre comme de la précipitation, et inversement.',
    })
    complementarites.push({
      source: 'astrologie', fiabilite: fiabAstro, titre: 'Ce que l’autre a et que vous n’avez pas',
      texte: `L’un apporte du ${ea}, l’autre du ${eb}. Chacun tient un bout que l’autre ne tient pas, et c’est exactement ce qui vous a attirés.`,
    })
  }

  const asp = syn.aspectSoleils
  if (asp) {
    const doux = asp.nom === 'trigone' || asp.nom === 'sextile'
    const dur = asp.nom === 'carré'
    const face = asp.nom === 'opposition'
    if (doux) {
      complementarites.push({
        source: 'astrologie', fiabilite: fiabAstro, titre: 'Une fluidité naturelle',
        texte: `Vos Soleils sont en ${asp.nom}. Les choses circulent facilement entre vous. Le risque est le confort : ce qui vient sans effort finit parfois par ne plus avancer.`,
      })
    } else if (face) {
      complementarites.push({
        source: 'astrologie', fiabilite: fiabAstro, titre: 'Face à face, et complémentaires',
        texte: 'Vos Soleils s’opposent. Chacun porte précisément ce qui manque à l’autre. C’est la configuration la plus complémentaire, et la plus exigeante : elle demande de regarder l’autre plutôt que de vouloir le ramener à soi.',
      })
    } else if (dur) {
      attentions.push({
        source: 'astrologie', fiabilite: fiabAstro, titre: 'Une tension qui pousse',
        texte: 'Vos Soleils sont en carré. C’est ce qui vous met en mouvement, et c’est aussi ce qui frotte. Cette tension est utile tant qu’elle sert un projet commun, épuisante quand elle tourne à vide.',
      })
    } else {
      complementarites.push({
        source: 'astrologie', fiabilite: fiabAstro, titre: 'Vos natures se superposent',
        texte: 'Vos Soleils sont en conjonction. Il y a entre vous une évidence immédiate, et peu de recul l’un sur l’autre : vous voyez le monde depuis le même endroit.',
      })
    }
  }

  // ── Human Design : portes partagées ─────────────────────────────────────
  if (hd.portesCommunes.length) {
    complementarites.push({
      source: 'human design', fiabilite: 'partielle', titre: 'Un terrain commun',
      texte: `Vous partagez ${hd.portesCommunes.length === 1 ? 'une porte' : `${hd.portesCommunes.length} portes`} (${hd.portesCommunes.join(', ')}). Ce qui passe par là se comprend entre vous sans être expliqué.`,
    })
    attentions.push({
      source: 'human design', fiabilite: 'partielle', titre: 'Là où vous vous renforcez',
      texte: 'Un terrain partagé amplifie. Sur ces thèmes, vous vous confirmez l’un l’autre au lieu de vous nuancer, et une erreur commune devient difficile à voir.',
    })
  } else {
    complementarites.push({
      source: 'human design', fiabilite: 'partielle', titre: 'Deux portes d’entrée différentes',
      texte: 'Vos activations solaires ne se recoupent pas. Vous abordez la vie par des angles distincts, ce qui vous donne beaucoup à apprendre l’un de l’autre.',
    })
    attentions.push({
      source: 'human design', fiabilite: 'partielle', titre: 'Rien ne va de soi',
      texte: 'Sans terrain commun, l’évidence n’existe pas entre vous : tout doit se dire. C’est plus exigeant au quotidien, et plus solide sur la durée quand vous acceptez de tout expliciter.',
    })
  }

  // Profils : deux profils identiques se reconnaissent, deux profils opposés se complètent.
  if (hd.a.profil === hd.b.profil) {
    complementarites.push({
      source: 'human design', fiabilite: 'partielle', titre: 'Le même profil',
      texte: `Vous portez tous les deux un profil ${hd.a.profil}, ${hd.a.profilNom}. Vous fonctionnez de la même manière, ce qui rend la vie commune fluide et le regard extérieur rare.`,
    })
  }

  const ensemble = `${syn.lectureComposite} ${num.labelCouple ? `En numérologie, vous formez ${num.labelCouple}.` : ''}`.trim()

  return {
    complementarites, attentions, ensemble,
    detail: { numerologie: num, astrologie: syn, humanDesign: hd },
    limites: [...new Set([...syn.limites, ...hd.indetermine])],
  }
}
