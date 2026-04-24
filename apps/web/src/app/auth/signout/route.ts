import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to start page (fallback path)
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/web/start`, { status: 302 })
}
