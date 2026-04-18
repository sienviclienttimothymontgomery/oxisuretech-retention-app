'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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
    .update({ quantity, onboarding_completed: true })
    .eq('id', user.id)

  redirect('/app/dashboard')
}

export async function submitWebOnboarding(formData: FormData) {
  const userType = formData.get('userType') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      user_type: userType, 
      quantity, 
      path_type: 'web',
      onboarding_completed: true 
    })

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
    
  redirect('/app/dashboard')
}
