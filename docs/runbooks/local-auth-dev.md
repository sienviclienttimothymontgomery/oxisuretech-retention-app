# Local Auth Dev Runbook

## Commands for Local Environment

Because the auth stack depends on Supabase, these commands configure the local instances.

1. **Verify State**
   ```bash
   pwd
   git status
   ```

2. **Supabase Local Service**
   Ensure Docker Desktop is running the background.
   ```bash
   supabase start
   ```
   > **Note**: If you receive a daemon configuration error regarding elevated privileges in Windows, verify your Docker Desktop is active.

3. **Database Migration**
   The initial script `20240417000000_init_auth_onboarding.sql` structures the profiles and enables RLS.
   ```bash
   supabase db restart
   supabase db push
   supabase gen types typescript --local > types/supabase.ts
   ```

4. **Testing Magic Links Locally**
   When testing magic links via `localhost`, your email won't actually be mailed to your inbox. Instead:
   1. Access the local Inbucket instance via the URL provided by `supabase start` (usually `http://localhost:54324/m/` or similar).
   2. Open the intercepted email and copy the link.
   3. Note: The URL might redirect locally. Watch for `http://localhost:3000/auth/callback...` in the network traffic.

5. **Start frontend**
   ```bash
   npm run dev
   ```
