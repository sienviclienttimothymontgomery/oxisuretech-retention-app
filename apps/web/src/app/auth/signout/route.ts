import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()

  // Build the public-facing origin from forwarded headers (Firebase Hosting → Cloud Run)
  // Cloud Run's request.url is internal (0.0.0.0:8080), so we must use forwarded headers
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host') || headersList.get('host') || ''
  const forwardedProto = headersList.get('x-forwarded-proto') || 'https'
  const publicOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin

  return NextResponse.redirect(`${publicOrigin}/web/start`, { status: 302 })
}

