import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'
import type { Profile } from '@/types/database'

const VALID_ROLES: Profile['role'][] = ['member', 'founder', 'admin_content', 'admin_support']

async function getCallerProfile(): Promise<{ role: string } | null> {
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
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile as { role: string } | null
  } catch {
    return null
  }
}

function isAdmin(role: string): boolean {
  return role === 'founder' || role === 'admin_content' || role === 'admin_support'
}

// GET — list all profiles (admin only)
export async function GET() {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('id, prenom, email, role, avatar_url, plan, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profiles: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH — update a member's role (founder only)
export async function PATCH(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || caller.role !== 'founder') {
    return NextResponse.json({ error: 'Seuls les fondateurs peuvent modifier les rôles' }, { status: 403 })
  }

  try {
    const { memberId, role } = await request.json()

    if (!memberId || !role) {
      return NextResponse.json({ error: 'memberId et role requis' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', memberId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
