import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function WebDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    return redirect('/web/onboarding')
  }
    
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Web Tracker Dashboard</h1>
        <div className="bg-white p-4 rounded-xl shadow border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Tracker Status</h2>
          <ul className="text-sm space-y-2 text-[var(--color-text-secondary)]">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Path:</strong> {profile?.path_type || 'Web'}</li>
            <li><strong>Product SKU:</strong> {profile?.product_sku || 'Tracking Standard Kit'}</li>
            <li><strong>Quantity tracked:</strong> {profile?.quantity || 1}</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
