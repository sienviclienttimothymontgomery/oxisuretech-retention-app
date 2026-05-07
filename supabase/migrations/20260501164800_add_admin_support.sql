-- Migration: Add admin support to OxiSure
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/ytqnbvkordtflrvibmss/sql/new

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Update the user_type constraint to allow 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN ('self', 'caregiver', 'admin'));

-- 3. Confirm the admin user's email (so they can log in)
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW()
WHERE email = 'admin@oxisuretech.com';

-- 4. Set admin flag on the admin user's profile
UPDATE public.profiles 
SET is_admin = true, 
    user_type = 'admin',
    onboarding_completed = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@oxisuretech.com');

-- 5. Create a secure function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 6. Add RLS policy so admin can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR public.is_admin()
  );

-- Verify: check admin was set up correctly
SELECT id, email, is_admin, user_type, onboarding_completed 
FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@oxisuretech.com');
