'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LE LOGO DE LA PLATEFORME
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Le back-office propose « Logo du site » depuis toujours (Paramètres →
 *  site_settings.logo_url), mais une trentaine d'écrans affichaient le fichier
 *  livré avec le code, en dur : le logo changeait sur la moitié de la
 *  plateforme et pas sur l'autre.
 *
 *  Tous les emplacements passent désormais par ce composant. Un seul réglage,
 *  une seule lecture — le résultat est mémorisé pour la durée de la page, quel
 *  que soit le nombre de logos affichés.
 */

export const LOGO_LIVRE = '/images/logo-shine.png'
export const LOGO_LIVRE_TRANSPARENT = '/images/logo-shine-transparent.png'

let memoire: string | null = null
let lecture: Promise<string> | null = null

function lireLogo(): Promise<string> {
  if (memoire !== null) return Promise.resolve(memoire)
  if (!lecture) {
    lecture = (async () => {
      try {
        const supabase = createClient()
        // Deux écrans du back-office savent régler un logo : « Paramètres →
        // Logo du site », et l'éditeur de la page d'accueil (section _global).
        // Le premier fait foi ; le second sert de repli pour ne rien perdre
        // des réglages existants.
        const [reglages, accueil] = await Promise.all([
          supabase.from('site_settings').select('value').eq('key', 'logo_url').maybeSingle(),
          supabase.from('landing_sections').select('content').eq('section_key', '_global').maybeSingle(),
        ])
        const duReglage = ((reglages.data as { value: string } | null)?.value || '').trim()
        const contenu = (accueil.data as { content: { logo_url?: string } } | null)?.content
        memoire = duReglage || (contenu?.logo_url || '').trim()
      } catch {
        // Pas de réseau, pas de session : on garde le logo livré.
        memoire = ''
      }
      return memoire
    })()
  }
  return lecture
}

/** L'URL du logo, ou le fichier de repli tant qu'on ne l'a pas lue. */
export function useLogo(repli: string = LOGO_LIVRE): string {
  const [url, setUrl] = useState(memoire || '')
  useEffect(() => {
    let vivant = true
    lireLogo().then(u => { if (vivant && u) setUrl(u) })
    return () => { vivant = false }
  }, [])
  return url || repli
}

export default function LogoSite({
  className,
  style,
  alt = 'SOS Shine',
  /** Le fichier affiché tant qu'aucun logo n'est réglé dans le back-office. */
  repli = LOGO_LIVRE,
}: {
  className?: string
  style?: CSSProperties
  alt?: string
  repli?: string
}) {
  const src = useLogo(repli)
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />
}
