import { createClient } from '@/utils/supabase/server'
import PrototypeNav from '@/components/ui/PrototypeNav'
import { redirect } from 'next/navigation'

export default async function AppDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/app/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <PrototypeNav />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your App Dashboard</h1>
        <div className="bg-white p-4 rounded-xl shadow border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Your Persisted Profile</h2>
          <ul className="text-sm space-y-2 text-[var(--color-text-secondary)]">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Path:</strong> {profile?.path_type}</li>
            <li><strong>Type:</strong> {profile?.user_type}</li>
            <li><strong>Product SKU:</strong> {profile?.product_sku || 'None'}</li>
            <li><strong>Quantity:</strong> {profile?.quantity || 1}</li>
            <li><strong>Onboarding Completed:</strong> {profile?.onboarding_completed ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
