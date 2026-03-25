import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicRoutes = ['/', '/login', '/signup', '/rejoindre', '/encyclopedie', '/contact', '/cgv', '/confidentialite', '/mentions-legales', '/notre-histoire', '/signature-emotionnelle', '/compte-inactif', '/livre-sos-shine', '/livre-supers-pouvoirs', '/forgot-password', '/reset-password', '/inscription-confirmee', '/parents-enfants', '/success', '/cancel']
  const isPublicRoute = publicRoutes.some(route => {
    const isExact = request.nextUrl.pathname === route;
    const isSubRoute = request.nextUrl.pathname.startsWith('/encyclopedie') || request.nextUrl.pathname.startsWith('/auth/') || request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/signature-emotionnelle');
    return isExact || isSubRoute;
  })

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check subscription status for dashboard routes (not admin)
  // After 22/03/2026: subscription (active or trialing) is MANDATORY — no card, no access
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Check if user is admin (admins always have access)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      if (profile) {
        const isAdmin = ['founder', 'admin_content', 'admin_support'].includes(profile.role)

        if (!isAdmin) {
          // Check subscription status
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single()

          const hasActiveSub = sub && (sub.status === 'active' || sub.status === 'trialing')

          // Require active subscription for ALL non-admin users
          if (!hasActiveSub) {
            return NextResponse.redirect(new URL('/rejoindre', request.url))
          }
        }
      }
    } catch {
      // If profile check fails, allow access (don't block on error)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
