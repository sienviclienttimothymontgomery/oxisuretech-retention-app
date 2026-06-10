import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side (during SSR/prerender): Return a fresh instance each time to avoid cross-request contamination
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: '__session',
        },
        cookieEncoding: 'raw',
        isSingleton: false,
      }
    )
  }

  // Client-side (browser): Use a module-scoped singleton to prevent state divergence
  if (!client) {
    console.log('[Supabase Client] 🚀 Initializing standard browser client with implicit flow...')
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: '__session',
        },
        cookieEncoding: 'raw',
        isSingleton: true,
        auth: {
          flowType: 'implicit',
          persistSession: true,
          detectSessionInUrl: true,
        }
      }
    )
  }

  return client
}
