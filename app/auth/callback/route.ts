import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
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

          await admin.from('profiles').upsert(
            {
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
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )
        } catch {
          // Profile creation is best-effort; user can still proceed
        }

        // Link any existing quiz responses (by email) to this user_id
        try {
          const adminForQuiz = createAdminClient()
          if (adminForQuiz && user.email) {
            await adminForQuiz.from('quiz_v2_responses')
              .update({ user_id: user.id })
              .eq('email', user.email)
              .is('user_id', null)
          }
        } catch {}

        const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime() < 60000)
        if (isNewUser) {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
              || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
              || ''
            if (siteUrl) {
              const firstName = user.user_metadata?.full_name?.split(' ')[0]
                || user.user_metadata?.name?.split(' ')[0]
                || null
              await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  trigger_type: 'signup',
                  email: user.email,
                  first_name: firstName,
                }),
              })
            }
          } catch {}
        }

        // Redirect new users to onboarding questionnaire
        if (isNewUser) {
          const adminCheck = createAdminClient()
          const { data: onboardingDone } = await adminCheck.from('onboarding_responses')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!onboardingDone) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
              return NextResponse.redirect(`${origin}/onboarding`)
            } else if (forwardedHost) {
              return NextResponse.redirect(`https://${forwardedHost}/onboarding`)
            } else {
              return NextResponse.redirect(`${origin}/onboarding`)
            }
          }
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
