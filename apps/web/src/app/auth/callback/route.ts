import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  // Build the public-facing origin from forwarded headers (Firebase Hosting → Cloud Run)
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host') || headersList.get('host') || ''
  const forwardedProto = headersList.get('x-forwarded-proto') || 'https'
  const publicOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${publicOrigin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${publicOrigin}/auth/auth-code-error`)
}
