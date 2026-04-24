# Supabase Environment Variable Management

## Requirements

The OxiSure platform interfaces with Supabase natively via the Next.js SSR tooling. It relies on strictly defining the API URL and the secure Anon Key dynamically.

### Client-Exposed Variables (Safe)
These are publicly available and appended inside `next.config` limits. They power non-invasive queries and identity checking matching RLS.
- `NEXT_PUBLIC_SUPABASE_URL`: The domain endpoint pointing to either `http://localhost:54321` or `https://<ref>.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The standard API token designed to enforce Row Level Security.

### Server Secrets (Critical)
DO NOT expose these to the browser context or push them into GitHub.
- `SUPABASE_SERVICE_ROLE_KEY`: A bypass key for administrative functions (e.g. forced trigger bypassing, server cron data purging). Currently not invoked in client web UI flows!

## Next.js Mapping
1. Put the keys inside `.env.local` locally for dev server parsing.
2. Store inside Vercel or App Hosting env settings for prod mapping.
