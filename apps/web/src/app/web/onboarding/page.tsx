import Button from '@/components/ui/Button'
import { submitWebOnboarding } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function WebOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single()
  if (profile?.onboarding_completed) {
    return redirect('/web/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Just a few questions</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Let's set up your individual tracker.</p>
        
        <form action={submitWebOnboarding} className="space-y-6">
          <input type="hidden" name="userType" value="self" />
          <div>
            <label className="block text-sm font-medium mb-2">How many tubes do you swap per month?</label>
            <select name="quantity" className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-3 rounded-xl" defaultValue="1">
              <option value="1">1 tube (Standard)</option>
              <option value="2">2 tubes</option>
              <option value="3">3+ tubes</option>
            </select>
          </div>
          
          <Button type="submit" variant="primary" fullWidth size="lg">Complete Setup</Button>
        </form>
      </main>
    </div>
  )
}
