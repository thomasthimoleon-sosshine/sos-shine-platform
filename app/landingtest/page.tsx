'use client'

/**
 * /landingtest — affiche la landing "Thomas" (variante A/B, avec vidéo).
 * Le contenu est chargé depuis Supabase (landing_sections, variant='thomas').
 */

import LandingClient from '../LandingClient'

export default function LandingTestPage() {
  return <LandingClient variant="thomas" />
}
