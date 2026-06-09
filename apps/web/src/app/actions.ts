'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logServerEvent } from '@/utils/analytics-server'

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

export async function submitNotifications(pushEnabled: boolean, emailEnabled: boolean, isOnboarding: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const updatePayload: Record<string, any> = {
    notifications_push: pushEnabled,
    notifications_email: emailEnabled,
  };

  if (isOnboarding) {
    updatePayload.onboarding_completed = true;
    updatePayload.tracker_started_at = new Date().toISOString();
  }

  await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (isOnboarding) {
    revalidatePath('/app/dashboard')
    redirect('/app/dashboard')
  } else {
    revalidatePath('/web/settings')
    redirect('/web/settings?success=1')
  }
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
      onboarding_completed: true,
      tracker_started_at: new Date().toISOString()
    })

  if (error) {
    redirect(`/web/onboarding?error=${encodeURIComponent(error.message)}`)
  }

  // Log activation event
  await logServerEvent('activation', user.id);

  revalidatePath('/web/dashboard')
  redirect('/web/dashboard')
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ onboarding_completed: true, tracker_started_at: new Date().toISOString() })
    .eq('id', user.id)

  // Log activation event
  await logServerEvent('activation', user.id);
    
  revalidatePath('/app/dashboard')
  redirect('/app/dashboard')
}

export async function completeOrderVerification() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  await supabase
    .from('profiles')
    .upsert({ id: user.id, order_verified: true })
    
  revalidatePath('/web/dashboard')
  redirect('/web/onboarding')
}

export async function updateWebSettings(formData: FormData) {
  const quantity = parseInt(formData.get('quantity') as string) || 1
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { error } = await supabase
    .from('profiles')
    .update({ quantity })
    .eq('id', user.id)

  if (error) {
    redirect(`/web/settings?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/web/dashboard')
  redirect('/web/settings?success=1')
}

// ── Caregiver: Dependent Management ──

export async function addDependent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const productSku = (formData.get('product_sku') as string) || 'OXI-TUB-07'
  const quantity = parseInt(formData.get('quantity') as string) || 1

  if (!name) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  await supabase
    .from('dependents')
    .insert({
      caregiver_id: user.id,
      name,
      product_sku: productSku,
      quantity,
      last_replaced_at: new Date().toISOString(),
    })

  revalidatePath('/web/dashboard')
  redirect('/web/dashboard?view=caregiver')
}

export async function markDependentReplaced(formData: FormData) {
  const dependentId = formData.get('dependent_id') as string
  if (!dependentId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  await supabase
    .from('dependents')
    .update({ last_replaced_at: new Date().toISOString() })
    .eq('id', dependentId)
    .eq('caregiver_id', user.id)

  revalidatePath('/web/dashboard')
  redirect('/web/dashboard?view=caregiver')
}

export async function deleteDependent(formData: FormData) {
  const dependentId = formData.get('dependent_id') as string
  if (!dependentId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  await supabase
    .from('dependents')
    .delete()
    .eq('id', dependentId)
    .eq('caregiver_id', user.id)

  revalidatePath('/web/dashboard')
  redirect('/web/dashboard?view=caregiver')
}
