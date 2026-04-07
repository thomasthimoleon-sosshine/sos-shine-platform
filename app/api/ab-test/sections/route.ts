import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Récupérer les sections d'une variante
export async function GET(req: NextRequest) {
  const variantName = req.nextUrl.searchParams.get('variant')
  if (!variantName) {
    return NextResponse.json({ error: 'variant param required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: variant } = await supabase
    .from('landing_page_variants')
    .select('id')
    .eq('name', variantName)
    .single()

  if (!variant) {
    return NextResponse.json({ sections: [] })
  }

  const { data: sections } = await supabase
    .from('landing_variant_sections')
    .select('*')
    .eq('variant_id', variant.id)
    .order('position')

  return NextResponse.json({ sections: sections || [] })
}
