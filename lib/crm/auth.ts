import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return false

    const cookieStore = await cookies()

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const adminClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || '')
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'founder' || profile?.role === 'admin_content' || profile?.role === 'admin_support'
  } catch {
    return false
  }
}
