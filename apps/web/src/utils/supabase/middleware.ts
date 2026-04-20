import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ROUTE PROTECTION LOGIC
  const isAppDashboard = request.nextUrl.pathname.startsWith('/app/dashboard')
  const isAppOnboarding = request.nextUrl.pathname.startsWith('/app/user-type') || 
                          request.nextUrl.pathname.startsWith('/app/confirm-product') ||
                          request.nextUrl.pathname.startsWith('/app/quantity')
  
  const isWebDashboard = request.nextUrl.pathname.startsWith('/web/dashboard')
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

  if (!user && (isWebDashboard || isWebOnboarding)) {
    // protect web routes
    const url = request.nextUrl.clone()
    url.pathname = '/web/start'
    return NextResponse.redirect(url)
  }

  // Root redirection for authenticated users
  if (user && request.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('path_type')
      .eq('id', user.id)
      .single()
    
    const url = request.nextUrl.clone()
    url.pathname = profile?.path_type === 'web' ? '/web/dashboard' : '/app/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
