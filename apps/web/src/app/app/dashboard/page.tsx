import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * App dashboard — redirects users to the appropriate full dashboard.
 * The /app/* flow is used for mobile onboarding; once complete, users
 * should see the full-featured /web/dashboard.
 */
export default async function AppDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/app/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    return redirect('/app/user-type')
  }

  // All users go to the unified web dashboard
  return redirect('/web/dashboard')
}
