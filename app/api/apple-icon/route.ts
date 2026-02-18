import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(new URL('/logo.png', supabaseUrl || 'http://localhost:3000'))
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'logo_url').maybeSingle()

    if (data?.value) {
      // Redirect to the actual logo URL from storage
      return NextResponse.redirect(data.value)
    }

    // Fallback to default logo
    return NextResponse.redirect(new URL('/logo.png', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  } catch {
    return NextResponse.redirect(new URL('/logo.png', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }
}
