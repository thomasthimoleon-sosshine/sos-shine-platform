import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
