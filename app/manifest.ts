import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let iconUrl = '/logo.png'

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'logo_url').maybeSingle()
      if (data?.value) iconUrl = data.value
    }
  } catch { /* fallback to default */ }

  return {
    name: 'SOS Shine',
    short_name: 'SOS Shine',
    description: 'Votre sanctuaire — Accompagnement corps, émotion, action.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#362038',
    theme_color: '#C9A961',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconUrl,
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  }
}
