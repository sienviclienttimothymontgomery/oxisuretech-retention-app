# Provider Setup Checklist

Before launching the respective auth endpoints, confirm the following providers are correctly configured in your Supabase Auth settings:

## 1. Email Auth
- [ ] Ensure **Email Login** is enabled in Supabase dashboard.
- [ ] Determine your Magic Link / Confirm URL base (e.g., `http://localhost:3000/auth/callback` or `https://your-production-site.vercel.app/auth/callback`). Set this in the Redirect URLs constraint.
- [ ] Optional: Uncheck "Confirm Email" if creating a low-friction local testing environment.

## 2. Google OAuth
- [ ] Enable Google Provider in Supabase Auth.
- [ ] Open the Google Cloud Console and establish an OAuth Consent Screen.
- [ ] Create Web App Credentials; paste the Supabase Callback URI into the Authorized redirect URIs.
- [ ] Fill exactly the generated Google `Client ID` and `Client Secret` into the Supabase Dashboard.

## 3. Apple OAuth (*Limitations Apply Locally*)
- [ ] Enable Apple Provider in Supabase Auth.
- [ ] You must have an active Apple Developer Program membership.
- [ ] Setup a Services ID mapping to your production domain on developer.apple.com.
- [ ] You need a verified outbound domain and valid HTTPS certificates. *Localhost testing for Apple is often unreliable or unsupported entirely due to strict redirect URL requirements.*
- [ ] Insert your `Services ID`, `Team ID`, `Key ID`, and the `Secret Key` (.p8 file text) into the Supabase Dashboard.
