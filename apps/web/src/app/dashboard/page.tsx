import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Smart dashboard redirect — reads user's path_type and sends them to the right place
export default async function DashboardRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/choose-path')

  const { data: profile } = await supabase
    .from('profiles')
    .select('path_type')
    .eq('id', user.id)
    .single()

  if (profile?.path_type === 'web') {
    redirect('/web/dashboard')
  } else {
    redirect('/app/dashboard')
  }
}
