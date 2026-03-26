import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTemplateEmail, scheduleEmail } from '@/lib/email-templates/automated-emails'
import { enrollInSequence } from '@/lib/crm/enroll'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  let next = nextParam

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Can be ignored in middleware/route handlers
            }
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Ensure profile exists (upsert via admin client to bypass RLS)
        try {
          const admin = createAdminClient()
          const prenom =
            user.user_metadata?.prenom ||
            user.user_metadata?.full_name?.split(' ')[0] ||
            user.user_metadata?.name?.split(' ')[0] ||
            'Membre'
          const email = user.email || ''
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

          // Check if profile already exists to avoid overwriting plan/role
          const { data: existingProfile } = await admin
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!existingProfile) {
            // Only create profile if it doesn't exist — never overwrite existing data
            await admin.from('profiles').insert({
              id: user.id,
              prenom,
              email,
              role: 'member',
              avatar_url: avatarUrl,
              pseudo: null,
              bio: null,
              video_url: null,
              plan: null,
              is_bot: false,
            })
          } else {
            // Update only safe fields (avatar, prenom if empty)
            await admin.from('profiles').update({
              avatar_url: avatarUrl,
              email,
            }).eq('id', user.id)
          }
        } catch {
          // Profile creation is best-effort; user can still proceed
        }

        const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime() < 60000)
        if (isNewUser) {
          const firstName = user.user_metadata?.prenom
            || user.user_metadata?.full_name?.split(' ')[0]
            || user.user_metadata?.name?.split(' ')[0]
            || 'Membre'
          const userEmail = user.email || ''

          try {
            // Email de bienvenue immédiat
            await sendTemplateEmail('registration_welcome', userEmail, {
              firstName,
              email: userEmail,
            }, { recipientName: firstName })

            // Séquence de conversion pour les non-abonnés (J+1, J+3, J+7, J+14)
            const vars = { firstName, email: userEmail }
            scheduleEmail('registration_conversion_j1', userEmail, vars, 1, { recipientName: firstName }).catch(() => {})
            scheduleEmail('registration_conversion_j3', userEmail, vars, 3, { recipientName: firstName }).catch(() => {})
            scheduleEmail('registration_conversion_j7', userEmail, vars, 7, { recipientName: firstName }).catch(() => {})
            scheduleEmail('registration_conversion_j14', userEmail, vars, 14, { recipientName: firstName }).catch(() => {})

            // Enrôlement CRM
            enrollInSequence('registration', userEmail, firstName).catch(() => {})
          } catch {}
        }

        // New users without subscription → redirect to pricing page
        if (isNewUser && nextParam === '/dashboard') {
          next = '/dashboard/tarifs'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
    console.error('Auth callback error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
