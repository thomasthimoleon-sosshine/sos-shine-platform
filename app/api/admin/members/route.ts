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
      .select('id, prenom, email, role, avatar_url, plan, is_active, publish_banned_until, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    // Fetch subscriptions for all users
    const { data: subscriptions } = await admin
      .from('subscriptions')
      .select('user_id, status, plan, current_period_end, waitlist_discount, cancel_at_period_end')

    // Build subscription map
    const subMap: Record<string, { status: string; plan: string; current_period_end: string | null; waitlist_discount: boolean; cancel_at_period_end: boolean }> = {}
    if (subscriptions) {
      for (const sub of subscriptions) {
        subMap[sub.user_id] = {
          status: sub.status,
          plan: sub.plan,
          current_period_end: sub.current_period_end,
          waitlist_discount: sub.waitlist_discount || false,
          cancel_at_period_end: sub.cancel_at_period_end || false,
        }
      }
    }

    // Merge subscription data into profiles
    const enriched = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      subscription: subMap[p.id as string] || null,
    }))

    return NextResponse.json({ profiles: enriched })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT — toggle member active status (admin)
export async function PUT(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { memberId, is_active } = await request.json()
    if (!memberId || typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'memberId et is_active requis' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ is_active })
      .eq('id', memberId)

    if (error) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — toggle publish ban (admin only)
export async function POST(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { memberId, action, days } = await request.json()
    if (!memberId || !action) {
      return NextResponse.json({ error: 'memberId et action requis' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (action === 'ban') {
      const banDays = typeof days === 'number' && days > 0 ? days : 30
      const until = new Date()
      until.setDate(until.getDate() + banDays)
      const { error } = await admin
        .from('profiles')
        .update({ publish_banned_until: until.toISOString() })
        .eq('id', memberId)

      if (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
      }
      return NextResponse.json({ success: true, publish_banned_until: until.toISOString() })
    }

    if (action === 'unban') {
      const { error } = await admin
        .from('profiles')
        .update({ publish_banned_until: null })
        .eq('id', memberId)

      if (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
      }
      return NextResponse.json({ success: true, publish_banned_until: null })
    }

    return NextResponse.json({ error: 'Action invalide (ban ou unban)' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — permanently delete a member (founder only)
export async function DELETE(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || caller.role !== 'founder') {
    return NextResponse.json({ error: 'Seuls les fondateurs peuvent supprimer des membres' }, { status: 403 })
  }

  try {
    const { memberId } = await request.json()
    if (!memberId) {
      return NextResponse.json({ error: 'memberId requis' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Delete subscription data
    await admin.from('subscriptions').delete().eq('user_id', memberId)

    // Delete payment logs
    await admin.from('subscription_payment_logs').delete().eq('user_id', memberId)

    // Delete profile
    await admin.from('profiles').delete().eq('id', memberId)

    // Delete the auth user via Supabase Admin API
    const { error: authError } = await admin.auth.admin.deleteUser(memberId)
    if (authError) {
      console.error('[Admin] Erreur suppression auth user:', authError)
      // Profile/subscription already deleted, log but don't fail
    }

    return NextResponse.json({ success: true })
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
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
