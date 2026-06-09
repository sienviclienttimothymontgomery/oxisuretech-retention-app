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

            // Find if there's a valid (non-empty) code verifier in the cookies
            const verifierCookie = cookiesList.find(c => c.name.endsWith('-code-verifier') && c.value)

            if (!verifierCookie) {
              let foundKey: string | null = null
              let fallbackValue: string | null = null

              // Search sessionStorage first
              for (let i = 0; i < window.sessionStorage.length; i++) {
                const key = window.sessionStorage.key(i)
                if (key && key.endsWith('-code-verifier')) {
                  const val = window.sessionStorage.getItem(key)
                  if (val) {
                    foundKey = key
                    fallbackValue = val
                    break
                  }
                }
              }

              // Search localStorage if not found in sessionStorage
              if (!fallbackValue) {
                for (let i = 0; i < window.localStorage.length; i++) {
                  const key = window.localStorage.key(i)
                  if (key && key.endsWith('-code-verifier')) {
                    const val = window.localStorage.getItem(key)
                    if (val) {
                      foundKey = key
                      fallbackValue = val
                      break
                    }
                  }
                }
              }

              if (foundKey && fallbackValue) {
                console.log(`[Supabase Client] ℹ️ Verifier missing or empty in cookies. Retrieved from storage fallback (${foundKey}):`, fallbackValue.substring(0, 10) + '...')
                
                // If the cookie existed but was empty, update its value; otherwise, add it.
                const existingIndex = cookiesList.findIndex(c => c.name === foundKey)
                if (existingIndex > -1) {
                  cookiesList[existingIndex].value = fallbackValue
                } else {
                  cookiesList.push({
                    name: foundKey,
                    value: fallbackValue,
                  })
                }
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
