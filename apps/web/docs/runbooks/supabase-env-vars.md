# Supabase Environment Variable Management

Always create a local copy `.env.local` inside your `web` directory.

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Never commit `.env.local` to version control.** It exists in `.gitignore` by default.

When promoting the environment (i.e. Vercel or Firebase App Hosting), these exact variables will need to be configured into the deployment hosting panel, but mapped to the Production versions of the keys found within your Supabase project settings.

The *Service Role Key* must absolutely `never` be included using `NEXT_PUBLIC_` within this Next.js project. It acts as an admin bypass to RLS and will trigger massive security violations if leaked.
