'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitUserType(formData: FormData) {
  const userType = formData.get('userType') as string
  if (!userType) return
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .upsert({ id: user.id, user_type: userType, path_type: 'app' })

  redirect('/app/confirm-product')
}

export async function submitProduct(sku: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ product_sku: sku })
    .eq('id', user.id)

  redirect('/app/quantity')
}

export async function submitQuantity(formData: FormData) {
  const quantity = parseInt(formData.get('quantity') as string) || 1
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ quantity })
    .eq('id', user.id)

  redirect('/app/notifications')
}

export async function submitNotifications(pushEnabled: boolean, emailEnabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ 
      notifications_push: pushEnabled, 
      notifications_email: emailEnabled,
      onboarding_completed: true 
    })
    .eq('id', user.id)

  revalidatePath('/app/dashboard')
  redirect('/app/dashboard')
}

export async function submitWebOnboarding(formData: FormData) {
  const userType = formData.get('userType') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id,
      user_type: userType, 
      quantity, 
      path_type: 'web',
      onboarding_completed: true 
    })

  if (error) {
    redirect(`/web/onboarding?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/web/dashboard')
  redirect('/web/dashboard')
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)
    
  revalidatePath('/app/dashboard')
  redirect('/app/dashboard')
}
