# Route Protection Notes

## Strategy Overview
Route protection is actively handled server-side using Next.js Middleware in combination with Supabase SSR (`@supabase/ssr`).

### The Middleware `updateSession`
The core security checkpoint is `updateSession(request: NextRequest)` in `middleware.ts`. Wait, it protects against the following scenarios:
1. **Unauthenticated Access Denial**: Blocks unauthenticated requests to `/app/dashboard`, `/app/user-type...`, `/web/onboarding`, and `/web/dashboard`.
2. **Authenticated Access Redirection**: Stops authenticated users from viewing redundant login surfaces (`/`, `/app/welcome`, `/app/login`, `/web/start`). Redirects them to their specific namespace based on the `path_type` claim in `profiles` (i.e. `/app/dashboard` or `/web/dashboard`).

### Onboarding Interception
Because hitting the database inside the middleware boundary repeatedly has high performance costs, checking the `onboarding_completed` flag happens as a redirect layer inside the protected route itself (e.g. `/web/dashboard/page.tsx` checks `profile?.onboarding_completed` and pushes downstream to `/web/onboarding` if incomplete).

### The Signout Route
Signout is accomplished by POSTing to `/auth/signout/route.ts` which awaits `supabase.auth.signOut()` on the server context, accurately destroying the session footprint and clearing auth cookies before returning a 302 to the public homepage.
