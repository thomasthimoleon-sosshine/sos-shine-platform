'use client'

/**
 * /landingtest — Landing "Thomas" (A/B) récupérée, avec 3 ajustements :
 *  - tous les CTA renvoient au questionnaire (ctaHref)
 *  - pas de mention d'essai gratuit (hideTrial)
 *  - prix à jour (via le contenu / valeurs par défaut)
 * Contenu chargé depuis Supabase (landing_sections, variant='thomas').
 */

import LandingClient from '../LandingClient'

export default function LandingTestPage() {
  return (
    <LandingClient
      variant="thomas"
      ctaHref="/signature-emotionnelle?start=1"
      hideTrial
    />
  )
}
