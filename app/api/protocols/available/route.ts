import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Renvoie les protocoles réellement disponibles à l'achat :
// un protocole "available" ET dont le contenu (douleur) est publié.
export async function GET() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ protocols: [] })

  try {
    // 1. Protocoles disponibles
    const { data: protocols } = await supabase
      .from('protocols')
      .select('slug, title, duration_days')
      .eq('status', 'available')

    const availableSlugs = new Set((protocols || []).map((p: { slug: string }) => p.slug))
    if (availableSlugs.size === 0) return NextResponse.json({ protocols: [] })

    // 2. Contenus publiés correspondants
    const { data: douleurs } = await supabase
      .from('douleurs')
      .select('*')
      .eq('is_published', true)
      .in('slug', Array.from(availableSlugs))
      .order('title', { ascending: true })

    const list = (douleurs || []).map((d: Record<string, unknown>) => ({
      slug: d.slug as string,
      title: d.title as string,
      subtitle: (d.subtitle as string) || (d.excerpt as string) || (d.description as string) || '',
      category: (d.category as string) || '',
      cover_image: (d.cover_image as string) || (d.image_url as string) || null,
    }))

    return NextResponse.json({ protocols: list })
  } catch (e) {
    console.error('available protocols error:', e)
    return NextResponse.json({ protocols: [] })
  }
}
