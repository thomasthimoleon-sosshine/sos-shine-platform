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

  const publicRoutes = ['/', '/login', '/signup', '/encyclopedie', '/contact', '/cgv', '/confidentialite', '/mentions-legales', '/notre-histoire', '/signature-emotionnelle', '/compte-inactif', '/livre-sos-shine', '/livre-supers-pouvoirs', '/forgot-password', '/reset-password', '/inscription-confirmee', '/parents-enfants', '/success', '/cancel', '/blog', '/rejoindre', '/quiz', '/landingtest3d', '/sos-meet', '/choisir-mon-protocole', '/questionnaire-test', '/reconquete', '/incarnat', '/mes-cadeaux', '/test', '/resultat']
  const isPublicRoute = publicRoutes.some(route => {
    const isExact = request.nextUrl.pathname === route;
    const isSubRoute = request.nextUrl.pathname.startsWith('/encyclopedie') || request.nextUrl.pathname.startsWith('/auth/') || request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/signature-emotionnelle') || request.nextUrl.pathname.startsWith('/blog') || request.nextUrl.pathname.startsWith('/rejoindre') || request.nextUrl.pathname.startsWith('/protocole') || request.nextUrl.pathname.startsWith('/event') || request.nextUrl.pathname.startsWith('/quiz-approfondi') || request.nextUrl.pathname.startsWith('/cadeau') || request.nextUrl.pathname.startsWith('/sos-meet') || request.nextUrl.pathname.startsWith('/landingtest3d') || request.nextUrl.pathname.startsWith('/apercu-') || request.nextUrl.pathname.startsWith('/publication/') || request.nextUrl.pathname.startsWith('/resultat/') || request.nextUrl.pathname.startsWith('/test');
    return isExact || isSubRoute;
  })

  if (!user && !isPublicRoute) {
    const next = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url))
  }

  // ── Back-office ──────────────────────────────────────────────────────────
  // Le contrôle du rôle ne vivait que dans un composant exécuté chez le
  // visiteur : il ne protégeait que l'affichage. On le pose ici, avant que la
  // page ne soit servie.
  //
  // En cas d'incident de lecture du profil, on laisse passer : le contraire
  // enfermerait l'équipe dehors sur une simple panne réseau, alors que les
  // écrans d'administration ont chacun leurs propres garde-fous côté base.
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profil, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = (profil as { role?: string } | null)?.role
    const estEquipe = role === 'founder' || role === 'admin_content' || role === 'admin_support'

    if (!error && profil && !estEquipe) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
