import { createBrowserClient } from '@supabase/ssr'
import { parse, serialize } from 'cookie'

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
    console.log('[Supabase Client] 🚀 Initializing browser client with custom cookie/storage sync...')
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: '__session',
        },
        cookieEncoding: 'raw',
        isSingleton: true,
        cookies: {
          getAll() {
            if (typeof document === 'undefined') return []

            // Parse all cookies from document.cookie
            const parsed = parse(document.cookie)
            const cookiesList = Object.keys(parsed).map((name) => ({
              name,
              value: parsed[name] ?? "",
            }))

            // Fallback: if __session-code-verifier is missing, check sessionStorage and localStorage
            const hasVerifier = cookiesList.some(c => c.name.endsWith('-code-verifier'))
            if (!hasVerifier) {
              const verifierKey = '__session-code-verifier'
              const fallbackValue = 
                window.sessionStorage.getItem(verifierKey) || 
                window.localStorage.getItem(verifierKey)
              
              if (fallbackValue) {
                console.log('[Supabase Client] ℹ️ Verifier missing in cookies, retrieved from storage fallback:', fallbackValue.substring(0, 10) + '...')
                cookiesList.push({
                  name: verifierKey,
                  value: fallbackValue,
                })
              }
            }

            return cookiesList
          },
          setAll(cookiesToSet) {
            if (typeof document === 'undefined') return

            console.log('[Supabase Client] 💾 setAll called with cookies:', cookiesToSet.map(c => `${c.name}=${c.value ? c.value.substring(0, 10) + '...' : 'empty'}`))

            cookiesToSet.forEach(({ name, value, options }) => {
              // Write to document.cookie
              document.cookie = serialize(name, value, options)

              // Mirror PKCE code-verifier to local and session storage
              if (name.endsWith('-code-verifier')) {
                if (value) {
                  console.log(`[Supabase Client] 📝 Saving verifier '${name}' to sessionStorage and localStorage`)
                  window.sessionStorage.setItem(name, value)
                  window.localStorage.setItem(name, value)
                } else {
                  console.log(`[Supabase Client] 🗑️ Removing verifier '${name}' from storage`)
                  window.sessionStorage.removeItem(name)
                  window.localStorage.removeItem(name)
                }
              }
            })
          }
        }
      }
    )
  }

  return client
}
