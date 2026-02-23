import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export async function verifyAdminSession(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.BOT_SECRET

  if (secret && authHeader === `Bearer ${secret}`) {
    return true
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const p = profile as { role: string } | null
    return p?.role === 'founder' || p?.role === 'admin_content' || p?.role === 'admin_support'
  } catch {
    return false
  }
}
