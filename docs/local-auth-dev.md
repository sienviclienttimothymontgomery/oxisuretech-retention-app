# Local Development Runbook

Now that the application has been restructured into a monorepo, local development startup requires running specific processes from their workspaces.

## Starting the Backend (Supabase)
The Supabase configuration has been moved to the repository root. Start the backend by running the following command from the **root directory**.

```bash
npx supabase start
```

## Running Web Application
Navigate to `apps/web` to run the Next.js tracker application.
```bash
cd apps/web
npm run dev
```

## Running Mobile Application
Navigate to `apps/mobile` to run the Expo / React Native application.
```bash
cd apps/mobile
npm run android # Or npm run ios
```
