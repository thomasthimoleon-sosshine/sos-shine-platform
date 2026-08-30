/**
 *  CONSENTEMENT À LA MESURE D'AUDIENCE
 *  ───────────────────────────────────
 *
 *  La plateforme mesurait ses visites sur toutes les pages publiques sans
 *  jamais rien demander : chemin, référent, navigateur, empreinte de l'IP,
 *  appareil, campagne — et l'identifiant du membre s'il était connecté.
 *
 *  C'est ce croisement avec l'identité qui fait sortir la mesure de
 *  l'exemption CNIL « statistiques anonymes » : sans lui, elle aurait pu s'en
 *  passer. Avec lui, l'article 82 de la loi Informatique et Libertés exige un
 *  consentement préalable.
 *
 *  Le choix est gardé dans le navigateur de la personne, jamais envoyé au
 *  serveur : demander l'accord et le tracer ailleurs serait absurde.
 */

export type Consentement = 'accepte' | 'refuse' | null

const CLE = 'sos-shine-consentement-mesure'

/** Émis à chaque décision, pour que la mesure démarre ou s'arrête aussitôt. */
export const EVENEMENT_CONSENTEMENT = 'consentement-mesure'

export function lireConsentement(): Consentement {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(CLE)
    return v === 'accepte' || v === 'refuse' ? v : null
  } catch {
    // Navigation privée, stockage bloqué : on considère qu'on n'a rien
    // demandé, donc on ne mesure pas. Le doute profite à la personne.
    return null
  }
}

export function ecrireConsentement(valeur: Exclude<Consentement, null>) {
  try {
    localStorage.setItem(CLE, valeur)
  } catch {
    /* Sans stockage, le choix vaut pour la session en cours. */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENEMENT_CONSENTEMENT, { detail: valeur }))
  }
}

/** Vrai seulement si la personne a explicitement accepté. */
export function mesureAutorisee(): boolean {
  return lireConsentement() === 'accepte'
}
