import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const isPrefetch = request.headers.get('x-middleware-prefetch') === '1'
  const path = request.nextUrl.pathname
  
  if (!isPrefetch) {
    console.log(`[Middleware] 🌐 Request for: ${path} (Method: ${request.method})`)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: '__session',
      },
      cookieEncoding: 'raw',
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresh session if expired
  if (!isPrefetch) {
    console.log(`[Middleware] 🔑 Fetching active auth user...`)
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isPrefetch) {
    console.log(`[Middleware] 👤 Auth user result: ${user ? user.email : 'No active session'}`)
  }

  // Handle Magic Link error redirects from Supabase
  if (request.nextUrl.searchParams.has('error')) {
    const errorCode = request.nextUrl.searchParams.get('error_code');
    const errorDesc = request.nextUrl.searchParams.get('error_description');
    
    if (errorCode === 'otp_expired' || errorDesc?.includes('invalid')) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/auth-code-error';
      url.search = ''; // Clear search params
      return NextResponse.redirect(url);
    }
  }

  // ROUTE PROTECTION LOGIC
  const isAppDashboard = request.nextUrl.pathname.startsWith('/app/dashboard')
  const isAppOnboarding = request.nextUrl.pathname.startsWith('/app/user-type') || 
                          request.nextUrl.pathname.startsWith('/app/confirm-product') ||
                          request.nextUrl.pathname.startsWith('/app/quantity')
  
  const isWebDashboard = request.nextUrl.pathname.startsWith('/web/dashboard')
  const isWebAdmin = request.nextUrl.pathname.startsWith('/web/admin')
  const isWebOnboarding = request.nextUrl.pathname.startsWith('/web/onboarding')
  const isWebStart = request.nextUrl.pathname === '/web/start'
  const isWebEmail = request.nextUrl.pathname === '/web/check-email'

  const isAuthRoute = request.nextUrl.pathname === '/app/login' || request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/app/welcome' || isWebStart || isAuthRoute || isWebEmail

  if (!user && (isAppDashboard || isAppOnboarding)) {
    // protect app routes
    const url = request.nextUrl.clone()
    url.pathname = '/app/login'
    return NextResponse.redirect(url)
  }

  if (!user && (isWebDashboard || isWebAdmin || isWebOnboarding)) {
    // protect web routes
    const url = request.nextUrl.clone()
    url.pathname = '/web/start'
    return NextResponse.redirect(url)
  }

  const isStarterRoute = request.nextUrl.pathname === '/' || 
                         request.nextUrl.pathname === '/app/welcome' || 
                         request.nextUrl.pathname === '/app/login' || 
                         isWebStart || 
                         isWebEmail

  // Admin routing: admins should only see /web/admin, not the regular dashboard
  if (user && !isPrefetch && (isStarterRoute || isWebDashboard || isWebOnboarding)) {
    const isAdminEmail = user.email === 'admin@oxisuretech.com'
    if (isAdminEmail) {
      console.log(`[Middleware] 👑 Admin user detected, redirecting from ${path} to /web/admin`)
      const url = request.nextUrl.clone()
      url.pathname = '/web/admin'
      return NextResponse.redirect(url)
    }
  }

  // Root redirection for authenticated (non-admin) users trying to access starter pages
  if (user && isStarterRoute) {
    const url = request.nextUrl.clone()
    // Route based on which starter page they're on, not profile path_type
    // This allows mobile-registered users to also access the web dashboard
    if (isWebStart || isWebEmail) {
      console.log(`[Middleware] 🔄 Authenticated user on ${path}, redirecting to /web/dashboard`)
      url.pathname = '/web/dashboard'
    } else {
      console.log(`[Middleware] 🔄 Authenticated user on ${path}, redirecting to /app/dashboard`)
      url.pathname = '/app/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
