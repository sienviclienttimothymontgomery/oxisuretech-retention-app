-- 1. Drop all existing policies on profiles to clear out any rogue recursive policies
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin Support for User Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Unify Profile View Access Policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin Profile Access with RLS" ON public.profiles;
-- (Just dropping anything that might have been created)

-- 2. Drop the policy by checking if it exists via a DO block to be absolutely sure we get the rogue ones
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 3. Recreate the secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 4. Recreate the core policies (combining the original ones + our fixed admin one)
CREATE POLICY "Users can view own profile or admins can view all"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id OR public.is_admin() );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );
