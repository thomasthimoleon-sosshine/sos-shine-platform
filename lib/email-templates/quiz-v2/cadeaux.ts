/**
 * Les cadeaux de la séquence Signature Émotionnelle
 *
 * Règle de dévoilement — à ne pas casser :
 * chaque email offre SON cadeau et le lien mène DIRECTEMENT au fichier.
 * On ne renvoie jamais vers une page qui listerait les cadeaux à venir :
 * la personne découvrirait au premier email ce qu'elle est censée recevoir
 * au cinquième, et toute la progression tombe à plat.
 *
 * La page de récapitulatif /mes-cadeaux n'apparaît qu'à la toute fin
 * (email 16, puis file C), une fois les quatre cadeaux donnés.
 */
import { ctaButton } from './wrapper'

const BRAND = '#C9A961'
const TEXT = '#d4d4d4'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const SITE = 'https://sosshine.com'

/** Page de récapitulatif — réservée au dernier email de la séquence. */
export const URL_RECAP_CADEAUX = `${SITE}/mes-cadeaux`

/**
 * Liens directs, un par cadeau.
 * `null` = fichier pas encore livré : l'email correspondant ne doit pas
 * promettre le téléchargement tant que la valeur n'est pas renseignée.
 */
export const CADEAUX = {
  /** Cadeau 1 sur 4 — offert dans l'email 02, rappelé dans l'email 03. */
  deconditionnement: {
    titre: 'Le Déconditionnement',
    url: `${SITE}/cadeaux/sos-shine-le-deconditionnement.pdf`,
  },
  /** Cadeau 2 sur 4 — offert dans l'email 04. */
  confiance: {
    titre: 'Cultiver la confiance en soi',
    url: `${SITE}/cadeaux/sos-shine-cultiver-la-confiance-en-soi.pdf`,
  },
  /** Cadeau 3 sur 4 — offert dans l'email 06. */
  amourPropre: {
    titre: "Cultiver l'amour propre",
    url: `${SITE}/cadeaux/sos-shine-cultiver-l-amour-propre.pdf`,
  },
  /**
   * Cadeau 4 sur 4 — offert dans l'email 07.
   * TODO : renseigner l'URL de l'audio dès que le fichier est livré, puis
   * réactiver l'encadré cadeau dans email-07-pratique.ts.
   */
  meditation: {
    titre: "La méditation guidée de l'enfant intérieur",
    url: null as string | null,
  },
  /** Bonus — offert dans l'email 16. PDF généré à la volée. */
  protocole5min: {
    titre: '5 minutes pour réaligner ta journée',
    url: `${SITE}/api/download/5min-protocol`,
  },
} as const

/**
 * Les cadeaux réellement livrables aujourd'hui, dans l'ordre où ils sont offerts.
 * Le récapitulatif de l'email 16 s'appuie dessus : tant que la méditation n'a
 * pas d'URL, elle n'est pas annoncée comme reçue.
 */
export function cadeauxLivres(): Array<{ titre: string; url: string }> {
  const tous: Array<{ titre: string; url: string | null }> = [
    CADEAUX.deconditionnement,
    CADEAUX.confiance,
    CADEAUX.amourPropre,
    CADEAUX.meditation,
  ]
  return tous.flatMap((c) => (c.url ? [{ titre: c.titre, url: c.url }] : []))
}

/**
 * Comment nommer les cadeaux déjà offerts, en toutes lettres, dans le corps
 * d'un email de la deuxième semaine (« je t'ai offert … »). La formule suit
 * ce qui est réellement livrable : inutile de promettre une méditation que
 * personne n'a reçue.
 */
export function resumeCadeaux(): string {
  const livres = cadeauxLivres()
  const ebooks = livres.filter((c) => c.url.endsWith('.pdf')).length
  const avecMeditation = livres.some((c) => c.titre === CADEAUX.meditation.titre)
  const motsEbooks =
    ebooks === 1 ? 'un ebook' : ebooks === 2 ? 'deux ebooks' : `${ebooks === 3 ? 'trois' : ebooks} ebooks`
  return avecMeditation ? `${motsEbooks} et une méditation` : motsEbooks
}

/**
 * L'encadré doré « CADEAU N SUR 4 » : un bloc à part dans le fil de l'email,
 * pour que le don se distingue nettement du reste du propos.
 */
export function giftBox(opts: {
  eyebrow: string
  titre: string
  paragraphes: string[]
  cta: string
  url: string
  email?: string
  apres?: string
}): string {
  const { eyebrow, titre, paragraphes, cta, url, email, apres } = opts

  const corps = paragraphes
    .map(
      (texte) =>
        `<p style="font-size:15px;line-height:1.75;color:${TEXT};margin:0 0 14px 0;font-family:${SANS};">${texte}</p>`
    )
    .join('')

  const pied = apres
    ? `<p style="font-size:13px;line-height:1.7;color:#8a8a8a;margin:4px 0 0 0;font-family:${SANS};">${apres}</p>`
    : ''

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 4px 0;">
<tr><td style="padding:28px 26px;border:1px solid rgba(201,169,97,0.35);background:rgba(201,169,97,0.05);border-radius:14px;">
<p style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND};margin:0 0 10px 0;font-family:${SANS};font-weight:700;">${eyebrow}</p>
<h3 style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#e8e8e8;font-weight:600;margin:0 0 16px 0;line-height:1.35;">${titre}</h3>
${corps}
${ctaButton(cta, url, { email })}
${pied}
</td></tr>
</table>`
}
