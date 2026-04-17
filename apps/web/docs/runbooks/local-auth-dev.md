# Local Authentication Development Runbook

Run these commands strictly to replicate the auth state locally and generate your types:

1. Validate you are in the appropriate directory (`web`).
2. Run `npx supabase start` to boot the local Supabase container (contains Postgres, GoTrue, Studio).
3. If new migrations exist, run `npx supabase db push`.
4. To regenerate your TypeScript definition files from the local container:
   `npx supabase gen types typescript --local > src/types/supabase.ts`
5. Place your environment variables `.env.local` linking them to the URLs output by `supabase start` (e.g. `http://127.0.0.1:54321` and the Anon key).
6. Run `npm run dev` to serve Next.js locally.
