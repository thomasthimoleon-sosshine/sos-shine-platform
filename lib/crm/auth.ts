import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey || !url.startsWith('http')) {
      console.error('CRM auth: missing or invalid Supabase config')
      return false
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return allCookies
        },
        setAll() {},
      },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('CRM auth: no user found', userError?.message)
      return false
    }

    if (!serviceKey) {
      console.error('CRM auth: missing service role key')
      return false
    }

    const adminClient = createClient(url, serviceKey)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('CRM auth: profile fetch error', profileError.message)
      return false
    }

    const allowed = profile?.role === 'founder' || profile?.role === 'admin_content' || profile?.role === 'admin_support'
    if (!allowed) {
      console.error('CRM auth: role not allowed:', profile?.role)
    }
    return allowed
  } catch (err) {
    console.error('CRM auth: unexpected error', err)
    return false
  }
}
