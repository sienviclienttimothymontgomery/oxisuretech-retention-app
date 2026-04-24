# Week 4 Auth Architecture

## Web Fallback Path
The web fallback path is designed specifically for a secure, low-friction entry into the OxiSure Tech consumable lifecycle tracker.

### Authentication Mechanism
It relies entirely on **Magic Links** (passwordless login).
- **Tooling**: Supabase `signInWithOtp`
- **Route**: `/web/start` captures the email and dispatches the link.
- **Callback**: `/auth/callback` handles the JWT resolution from the Supabase `#access_token` or `?code=` query parameters.

### Expected Flow Sequence
1. **`/` (Activation Landing):** Acts as the primary entry point, immediately exposing the dual-path decision ("Download the App" vs "Use Web Tracker") without hiding it behind an interim gate. There is no longer a generic "Get Started".
2. **Path Selection:**
   - **Primary**: Users tap "Download the App" (routing to the designated App path e.g. `/app/login`).
   - **Secondary**: Users tap "Use Web Tracker" directly initiating the Web Fallback flow.
3. **`/web/start`**: Web Fallback users arrive here to capture their email and trigger the Magic Link.

### Redirection & Route Protection
- **`middleware.ts`**: Protects the entry routes. A signed-out user cannot navigate to `/web/dashboard` or `/web/onboarding`. Returning users are routed based on their profile's `path_type` field.
- **Onboarding Interceptor**: `/web/dashboard` verifies if the user has `onboarding_completed=true`. If not, it redirects them to `/web/onboarding`.

### Storage & Security
- Sessions are managed by the Supabase SSR package via server-side cookies, ensuring the tokens never leak into local storage where XSS could exfiltrate them.
- No `SUPABASE_SERVICE_ROLE_KEY` is present in the client-side code.
