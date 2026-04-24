# Supabase Provider Setup Checklist

## 1. Magic Link (Email OTP)
- [x] Enable Email Provider in Supabase Dashboard (Auth -> Providers).
- [x] Configure Site URL (Auth -> URL Configuration) to match the production domain or `http://localhost:3000` for development.
- [x] Add redirect URIs to the allowed list (e.g. `http://localhost:3000/auth/callback`, `https://oxisuretechsolutions.com/auth/callback`).
- [x] Customize the Magic Link email template to include the correct deep link placeholder: `{{ .ConfirmationURL }}`.
- [x] Enable rate limiting adjustments if required.

## 2. OAuth Providers (Mobile App - Deferred)
- [ ] Configure Apple ID (Keys, Service ID, Team ID).
- [ ] Configure Google OAuth Client ID for Web/Android and iOS.
- [ ] Ensure Supabase URIs match the OAuth Provider Authorized Redirect URIs.
