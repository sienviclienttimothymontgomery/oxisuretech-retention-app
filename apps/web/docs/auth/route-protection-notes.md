# Route Protection Notes

## Mechanism

We enforce route protection through the Next.js `middleware.ts`. This acts as a gateway that ensures active Supabase sessions are validated before continuing to a matched route. 

## The Rules
*   **`/app/dashboard`**: Must have an active session. If missing, redirect to `/app/login`.
*   **`/web/dashboard`**: Must have an active session. If missing, redirect to `/web/start` or a `/web/login` equivalent.
*   **Authentication Check Bypass**: Any route outside the matcher constraints (e.g. `/`, `/app/login`, `/auth/callback`) resolves normally but could still enforce session rules selectively via server contexts (e.g. `await supabase.auth.getUser()`).
*   **Preventing Loop Logic**: Unauthenticated screens implicitly test if a user is already signed in (via `supabase.auth.getUser()`); if they are, they bounce them immediately back to the `/app/dashboard` to avoid the "already logged in" UX trap. 

## Note for Developers
Whenever passing a token requirement into a deeper API route, you *must* verify the standard JWT header using the Server Client. `createBrowserClient` values hold zero authoritative weight on the server side API boundaries.
