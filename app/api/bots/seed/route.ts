import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOT_PROFILES } from '@/lib/bots/profiles'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.BOT_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const results: { prenom: string; status: string; id?: string }[] = []

    for (const bot of BOT_PROFILES) {
      const { data: existingUsers } = await admin.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(u => u.email === bot.email)

      if (existing) {
        results.push({ prenom: bot.prenom, status: 'already_exists', id: existing.id })
        continue
      }

      const password = `Bot_${bot.prenom}_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: bot.email,
        password,
        email_confirm: true,
        user_metadata: { prenom: bot.prenom, is_bot: true },
      })

      if (authError || !authUser.user) {
        results.push({ prenom: bot.prenom, status: `auth_error: ${authError?.message}` })
        continue
      }

      const { error: profileError } = await admin.from('profiles').upsert({
        id: authUser.user.id,
        prenom: bot.prenom,
        email: bot.email,
        role: 'member',
        avatar_url: bot.avatar_url,
        bio: bot.bio,
        plan: bot.plan,
        pseudo: null,
        video_url: null,
      })

      if (profileError) {
        results.push({ prenom: bot.prenom, status: `profile_error: ${profileError.message}`, id: authUser.user.id })
      } else {
        results.push({ prenom: bot.prenom, status: 'created', id: authUser.user.id })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
