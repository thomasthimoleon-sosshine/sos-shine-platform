import { createClient } from '@/lib/supabase/server'
import type { Douleur } from '@/types/database'
import EncyclopedieClient from './EncyclopedieClient'
import type { ShineMap } from './EncyclopedieClient'

export default async function EncyclopediePage() {
  let initialDouleurs: Douleur[] = []
  let initialShineMap: ShineMap = {}

  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('douleurs')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true })

    if (data && data.length > 0) {
      initialDouleurs = data as Douleur[]
    }

    // Load shine content links for badges
    const [tvRes, audibleRes, shortsRes, libraryRes] = await Promise.all([
      supabase.from('shine_tv_videos').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
      supabase.from('shine_audible_tracks').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
      supabase.from('shine_shorts').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
      supabase.from('shine_library_books').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
    ])

    const map: ShineMap = {}
    const ensure = (id: string) => {
      if (!map[id]) map[id] = { hasTV: false, hasAudible: false, hasShort: false, hasLibrary: false }
    }
    tvRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasTV = true } })
    audibleRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasAudible = true } })
    shortsRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasShort = true } })
    libraryRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasLibrary = true } })
    initialShineMap = map
  } catch {
    // Fallback to client-side loading
  }

  return (
    <EncyclopedieClient
      initialDouleurs={initialDouleurs}
      initialShineMap={initialShineMap}
    />
  )
}
