import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !url.startsWith('http')) return null
  return createClient(url, key)
}

async function getUserFromCookies() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey || !url.startsWith('http')) return null

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

    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

async function checkRole(userId: string): Promise<boolean> {
  const adminClient = getAdminSupabase()
  if (!adminClient) return false

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'founder' || profile?.role === 'admin_content' || profile?.role === 'admin_support'
}

export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const user = await getUserFromCookies()
    if (user) {
      return await checkRole(user.id)
    }

    return false
  } catch (err) {
    console.error('CRM auth error:', err)
    return false
  }
}
