'use client'

/**
 * /landingtest — Mix : page d'accueil actuelle (à jour) + vidéo remontée dans le hero
 * (comme la landing Thomas). L'événement est chargé côté client.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LandingMixClient from '../LandingMixClient'
import type { NextEvent } from '../quiz/page'

export default function LandingTestPage() {
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('physical_events')
      .select('id, title, event_date, end_time, location_name')
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setNextEvent((data as unknown as NextEvent) || null))
  }, [])

  return <LandingMixClient nextEvent={nextEvent} heroVideo />
}
